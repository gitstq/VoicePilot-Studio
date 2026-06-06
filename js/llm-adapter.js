/**
 * @fileoverview LLMAdapter - Multi-provider LLM API adapter for VoicePilot Studio.
 * Supports OpenAI, Anthropic (Claude), Google Gemini, DeepSeek, GLM-5.1,
 * and custom OpenAI-compatible APIs with streaming SSE response parsing.
 */

'use strict';

/**
 * LLMAdapter handles communication with various LLM API providers.
 * Supports streaming responses via SSE (Server-Sent Events).
 */
class LLMAdapter {
    /**
     * Creates an LLMAdapter instance.
     * @param {Object} config - Provider configuration.
     * @param {string} config.provider - Provider identifier ('openai'|'anthropic'|'gemini'|'deepseek'|'glm'|'custom').
     * @param {string} config.apiKey - API key for authentication.
     * @param {string} [config.apiBase] - Custom API base URL.
     * @param {string} [config.model] - Model name to use.
     * @param {string} [config.systemPrompt] - System prompt for the conversation.
     * @param {number} [config.temperature=0.7] - Sampling temperature.
     * @param {number} [config.maxTokens=2048] - Maximum tokens in response.
     * @param {boolean} [config.stream=true] - Whether to use streaming responses.
     */
    constructor(config = {}) {
        this.provider = config.provider || 'openai';
        this.apiKey = config.apiKey || '';
        this.apiBase = config.apiBase || this._getDefaultBase(this.provider);
        this.model = config.model || this._getDefaultModel(this.provider);
        this.systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';
        this.temperature = config.temperature ?? 0.7;
        this.maxTokens = config.maxTokens ?? 2048;
        this.stream = config.stream ?? true;

        /** @type {AbortController|null} */
        this._abortController = null;

        /** @type {boolean} */
        this._isStreaming = false;

        /** @type {Function|null} */
        this._onLog = null;
    }

    /**
     * Returns the default API base URL for a given provider.
     * @param {string} provider - Provider identifier.
     * @returns {string}
     * @private
     */
    _getDefaultBase(provider) {
        const bases = {
            'openai': 'https://api.openai.com/v1',
            'anthropic': 'https://api.anthropic.com/v1',
            'gemini': 'https://generativelanguage.googleapis.com/v1beta',
            'deepseek': 'https://api.deepseek.com/v1',
            'glm': 'https://open.bigmodel.cn/api/paas/v4',
            'custom': 'https://api.openai.com/v1'
        };
        return bases[provider] || bases['openai'];
    }

    /**
     * Returns the default model for a given provider.
     * @param {string} provider - Provider identifier.
     * @returns {string}
     * @private
     */
    _getDefaultModel(provider) {
        const models = {
            'openai': 'gpt-4o',
            'anthropic': 'claude-sonnet-4-20250514',
            'gemini': 'gemini-2.5-flash',
            'deepseek': 'deepseek-chat',
            'glm': 'glm-4-plus',
            'custom': 'gpt-4o'
        };
        return models[provider] || models['openai'];
    }

    /**
     * Sets a logging callback for request/response debugging.
     * @param {Function} callback - Called with log level and message.
     */
    setLogCallback(callback) {
        this._onLog = callback;
    }

    /**
     * Logs a message if a log callback is set.
     * @param {string} level - Log level ('info'|'warn'|'error').
     * @param {string} message - Log message.
     * @private
     */
    _log(level, message) {
        if (this._onLog) {
            this._onLog(level, `[LLM:${this.provider}] ${message}`);
        }
    }

    /**
     * Updates the adapter configuration.
     * @param {Object} config - Partial configuration to update.
     */
    updateConfig(config = {}) {
        if (config.provider !== undefined) {
            this.provider = config.provider;
            if (!config.apiBase) this.apiBase = this._getDefaultBase(config.provider);
            if (!config.model) this.model = this._getDefaultModel(config.provider);
        }
        if (config.apiKey !== undefined) this.apiKey = config.apiKey;
        if (config.apiBase !== undefined) this.apiBase = config.apiBase;
        if (config.model !== undefined) this.model = config.model;
        if (config.systemPrompt !== undefined) this.systemPrompt = config.systemPrompt;
        if (config.temperature !== undefined) this.temperature = config.temperature;
        if (config.maxTokens !== undefined) this.maxTokens = config.maxTokens;
        if (config.stream !== undefined) this.stream = config.stream;
    }

    /**
     * Sends a chat completion request to the configured LLM provider.
     * @param {Array<Object>} messages - Array of message objects {role, content}.
     * @param {Object} [options] - Additional request options.
     * @param {Function} [options.onChunk] - Callback for streaming text chunks.
     * @param {Function} [options.onDone] - Callback when stream is complete.
     * @param {Function} [options.onError] - Callback for errors.
     * @returns {Promise<string>} The complete response text.
     */
    async chat(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key is required. Please configure it in settings.');
        }

        this._abortController = new AbortController();

        // Prepend system prompt if not already present
        const systemMessages = [{ role: 'system', content: this.systemPrompt }];
        const allMessages = this._hasSystemMessage(messages)
            ? messages
            : [...systemMessages, ...messages];

        if (this.stream && this.provider !== 'gemini') {
            return this._streamChat(allMessages, options);
        } else {
            return this._nonStreamChat(allMessages, options);
        }
    }

    /**
     * Checks if the messages array already contains a system message.
     * @param {Array<Object>} messages - Message array.
     * @returns {boolean}
     * @private
     */
    _hasSystemMessage(messages) {
        return messages.length > 0 && messages[0].role === 'system';
    }

    /**
     * Sends a streaming chat request.
     * @param {Array<Object>} messages - Message array.
     * @param {Object} options - Callbacks.
     * @returns {Promise<string>}
     * @private
     */
    async _streamChat(messages, options = {}) {
        this._isStreaming = true;
        let fullText = '';

        try {
            const { url, headers, body } = this._buildRequest(messages, true);

            this._log('info', `Streaming request to ${url}`);
            this._log('info', `Model: ${this.model}, Messages: ${messages.length}`);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: this._abortController.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const chunk = this._parseStreamChunk(json);
                        if (chunk) {
                            fullText += chunk;
                            if (options.onChunk) {
                                options.onChunk(chunk, fullText);
                            }
                        }
                    } catch (parseErr) {
                        // Skip malformed JSON chunks
                    }
                }
            }

            this._log('info', `Stream complete. Total length: ${fullText.length}`);
            if (options.onDone) options.onDone(fullText);
            return fullText;

        } catch (error) {
            if (error.name === 'AbortError') {
                this._log('info', 'Request aborted by user.');
                if (options.onDone) options.onDone(fullText);
                return fullText;
            }
            this._log('error', error.message);
            if (options.onError) options.onError(error);
            throw error;
        } finally {
            this._isStreaming = false;
            this._abortController = null;
        }
    }

    /**
     * Sends a non-streaming chat request.
     * @param {Array<Object>} messages - Message array.
     * @param {Object} options - Callbacks.
     * @returns {Promise<string>}
     * @private
     */
    async _nonStreamChat(messages, options = {}) {
        try {
            const { url, headers, body } = this._buildRequest(messages, false);

            this._log('info', `Non-streaming request to ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: this._abortController.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const json = await response.json();
            const text = this._parseResponse(json);

            this._log('info', `Response length: ${text.length}`);
            if (options.onDone) options.onDone(text);
            return text;

        } catch (error) {
            if (error.name === 'AbortError') {
                this._log('info', 'Request aborted by user.');
                return '';
            }
            this._log('error', error.message);
            if (options.onError) options.onError(error);
            throw error;
        } finally {
            this._abortController = null;
        }
    }

    /**
     * Builds the request URL, headers, and body based on the provider.
     * @param {Array<Object>} messages - Message array.
     * @param {boolean} isStream - Whether to use streaming.
     * @returns {{url: string, headers: Object, body: Object}}
     * @private
     */
    _buildRequest(messages, isStream) {
        switch (this.provider) {
            case 'anthropic':
                return this._buildAnthropicRequest(messages, isStream);
            case 'gemini':
                return this._buildGeminiRequest(messages, isStream);
            default:
                return this._buildOpenAIRequest(messages, isStream);
        }
    }

    /**
     * Builds an OpenAI-compatible API request.
     * Used by OpenAI, DeepSeek, GLM, and custom providers.
     * @param {Array<Object>} messages - Message array.
     * @param {boolean} isStream - Whether to use streaming.
     * @returns {{url: string, headers: Object, body: Object}}
     * @private
     */
    _buildOpenAIRequest(messages, isStream) {
        const url = `${this.apiBase}/chat/completions`;
        return {
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: {
                model: this.model,
                messages,
                temperature: this.temperature,
                max_tokens: this.maxTokens,
                stream: isStream
            }
        };
    }

    /**
     * Builds an Anthropic Claude API request.
     * @param {Array<Object>} messages - Message array.
     * @param {boolean} isStream - Whether to use streaming.
     * @returns {{url: string, headers: Object, body: Object}}
     * @private
     */
    _buildAnthropicRequest(messages, isStream) {
        const url = `${this.apiBase}/messages`;
        // Anthropic separates system prompt from messages
        let systemPrompt = '';
        const filteredMessages = messages.filter(msg => {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
                return false;
            }
            return true;
        });

        const body = {
            model: this.model,
            messages: filteredMessages,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            stream: isStream
        };

        if (systemPrompt) {
            body.system = systemPrompt;
        }

        return {
            url,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body
        };
    }

    /**
     * Builds a Google Gemini API request.
     * @param {Array<Object>} messages - Message array.
     * @param {boolean} isStream - Whether to use streaming.
     * @returns {{url: string, headers: Object, body: Object}}
     * @private
     */
    _buildGeminiRequest(messages, isStream) {
        const action = isStream ? 'streamGenerateContent' : 'generateContent';
        const url = `${this.apiBase}/models/${this.model}:${action}?key=${this.apiKey}`;

        // Convert messages to Gemini format
        let systemPrompt = '';
        const contents = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
                continue;
            }
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        const body = {
            contents,
            generationConfig: {
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens
            }
        };

        if (systemPrompt) {
            body.systemInstruction = {
                parts: [{ text: systemPrompt }]
            };
        }

        return {
            url,
            headers: {
                'Content-Type': 'application/json'
            },
            body
        };
    }

    /**
     * Parses a streaming chunk from the API response.
     * @param {Object} json - Parsed JSON chunk.
     * @returns {string|null} The text delta or null.
     * @private
     */
    _parseStreamChunk(json) {
        switch (this.provider) {
            case 'anthropic':
                return this._parseAnthropicChunk(json);
            case 'gemini':
                return this._parseGeminiChunk(json);
            default:
                return this._parseOpenAIChunk(json);
        }
    }

    /**
     * Parses an OpenAI-compatible streaming chunk.
     * @param {Object} json - Parsed JSON.
     * @returns {string|null}
     * @private
     */
    _parseOpenAIChunk(json) {
        try {
            const delta = json.choices?.[0]?.delta;
            if (delta && delta.content) {
                return delta.content;
            }
        } catch (e) {
            // Malformed chunk
        }
        return null;
    }

    /**
     * Parses an Anthropic streaming chunk.
     * @param {Object} json - Parsed JSON.
     * @returns {string|null}
     * @private
     */
    _parseAnthropicChunk(json) {
        try {
            if (json.type === 'content_block_delta') {
                return json.delta?.text || null;
            }
        } catch (e) {
            // Malformed chunk
        }
        return null;
    }

    /**
     * Parses a Gemini streaming chunk.
     * @param {Object} json - Parsed JSON.
     * @returns {string|null}
     * @private
     */
    _parseGeminiChunk(json) {
        try {
            const candidates = json.candidates;
            if (candidates && candidates[0]) {
                const parts = candidates[0].content?.parts;
                if (parts && parts[0]) {
                    return parts[0].text || null;
                }
            }
        } catch (e) {
            // Malformed chunk
        }
        return null;
    }

    /**
     * Parses a complete (non-streaming) API response.
     * @param {Object} json - Parsed JSON response.
     * @returns {string} The response text.
     * @private
     */
    _parseResponse(json) {
        switch (this.provider) {
            case 'anthropic':
                return json.content?.[0]?.text || '';
            case 'gemini':
                return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            default:
                return json.choices?.[0]?.message?.content || '';
        }
    }

    /**
     * Aborts the current in-flight request.
     */
    abort() {
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
        this._isStreaming = false;
    }

    /**
     * Checks if the adapter is currently streaming a response.
     * @returns {boolean}
     */
    isStreaming() {
        return this._isStreaming;
    }

    /**
     * Estimates the number of tokens in a text string.
     * Uses a rough heuristic: ~4 characters per token for English,
     * ~2 characters per token for CJK.
     * @param {string} text - Input text.
     * @returns {number} Estimated token count.
     */
    estimateTokens(text) {
        if (!text) return 0;
        // Count CJK characters
        const cjkMatches = text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g);
        const cjkCount = cjkMatches ? cjkMatches.length : 0;
        const nonCjkLength = text.length - cjkCount;
        // CJK: ~1.5 tokens per character; Non-CJK: ~4 characters per token
        return Math.ceil(cjkCount * 1.5 + nonCjkLength / 4);
    }

    /**
     * Estimates total tokens for an array of messages.
     * @param {Array<Object>} messages - Message array.
     * @returns {number} Estimated total token count.
     */
    estimateMessageTokens(messages) {
        let total = 0;
        for (const msg of messages) {
            total += this.estimateTokens(msg.content || '');
            total += 4; // Overhead per message (role, formatting)
        }
        return total;
    }

    /**
     * Returns the current configuration (without API key for security).
     * @returns {Object} Current configuration.
     */
    getConfig() {
        return {
            provider: this.provider,
            apiBase: this.apiBase,
            model: this.model,
            systemPrompt: this.systemPrompt,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            stream: this.stream,
            hasApiKey: !!this.apiKey
        };
    }
}

// Export for use in other modules
window.LLMAdapter = LLMAdapter;
