/**
 * @fileoverview VoicePilotStudio - Main application logic for VoicePilot Studio.
 * Orchestrates all modules: LLM adapter, avatar engine, audio visualizer,
 * speech recognition, speech synthesis, session management, and i18n.
 * Zero external dependencies - pure vanilla JavaScript (ES2022+).
 */

'use strict';

/**
 * VoicePilotStudio is the main application class that ties all modules together.
 * It manages the UI, conversations, voice I/O, and LLM communication.
 */
class VoicePilotStudio {
    /**
     * Creates a VoicePilotStudio instance and initializes the application.
     */
    constructor() {
        // Module instances
        this.i18n = new I18n({ storageKey: 'vps_lang' });
        this.llmAdapter = null;
        this.avatarEngine = null;
        this.audioVisualizer = null;

        // Speech API instances
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;

        // Application state
        this.conversations = [];
        this.activeConversationId = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.isThinking = false;
        this.isTTSMuted = false;
        this._pendingStreamAbort = false;

        // Settings (defaults)
        this.settings = this._loadSettings();

        // DOM element references
        this.els = {};

        // Context menu state
        this._contextMenuTarget = null;

        // Initialize
        this._cacheElements();
        this._initLLMAdapter();
        this._initAvatarEngine();
        this._initAudioVisualizer();
        this._initSpeechRecognition();
        this._loadConversations();
        this._applySettings();
        this._bindEvents();
        this._applyLanguage(this.settings.generalLanguage || 'en');
        this._updateUI();
    }

    // ================================================================
    // Initialization
    // ================================================================

    /**
     * Caches frequently accessed DOM elements.
     * @private
     */
    _cacheElements() {
        const ids = [
            'langSwitcher', 'themeToggle', 'settingsBtn', 'settingsModal',
            'settingsClose', 'settingsCancel', 'settingsSave', 'connectionStatus',
            'conversationList', 'newChatBtn', 'chatMessages', 'welcomeScreen',
            'textInput', 'sendBtn', 'avatarCanvas', 'avatarStatus',
            'avatarPanel', 'avatarToggleBtn', 'micBtn', 'voiceStatus',
            'voiceWaveform', 'waveformCanvas', 'muteBtn', 'stopBtn',
            'contextMenu', 'exportAllBtn', 'clearAllData',
            'llmProvider', 'llmApiKey', 'llmApiBase', 'llmModel',
            'llmSystemPrompt', 'llmTemperature', 'temperatureValue',
            'llmMaxTokens', 'llmStream',
            'ttsEngine', 'ttsVoice', 'ttsRate', 'ttsRateValue',
            'ttsPitch', 'ttsPitchValue', 'ttsVolume', 'ttsVolumeValue',
            'ttsAutoSpeak',
            'sttLanguage', 'sttContinuous', 'sttInterim',
            'voiceInterrupt', 'interruptThreshold', 'interruptThresholdValue',
            'avatarEnabled', 'avatarColor', 'avatarSize', 'avatarSizeValue', 'avatarStyle',
            'generalLanguage', 'generalTheme', 'generalFontSize', 'fontSizeValue',
            'sendOnEnter'
        ];

        for (const id of ids) {
            this.els[id] = document.getElementById(id);
        }
    }

    /**
     * Initializes the LLM adapter with current settings.
     * @private
     */
    _initLLMAdapter() {
        this.llmAdapter = new LLMAdapter({
            provider: this.settings.llmProvider || 'openai',
            apiKey: this.settings.llmApiKey || '',
            apiBase: this.settings.llmApiBase || '',
            model: this.settings.llmModel || '',
            systemPrompt: this.settings.llmSystemPrompt || 'You are a helpful AI assistant.',
            temperature: this.settings.llmTemperature ?? 0.7,
            maxTokens: this.settings.llmMaxTokens ?? 2048,
            stream: this.settings.llmStream ?? true
        });

        this.llmAdapter.setLogCallback((level, msg) => {
            if (level === 'error') {
                console.error(msg);
            } else {
                console.log(msg);
            }
        });
    }

    /**
     * Initializes the avatar animation engine.
     * @private
     */
    _initAvatarEngine() {
        if (this.els.avatarCanvas) {
            this.avatarEngine = new AvatarEngine(this.els.avatarCanvas, {
                primaryColor: this.settings.avatarColor || '#6366f1',
                size: this.settings.avatarSize || 280,
                style: this.settings.avatarStyle || 'circle'
            });
            this.avatarEngine.start();
        }
    }

    /**
     * Initializes the audio visualizer.
     * @private
     */
    _initAudioVisualizer() {
        if (this.els.waveformCanvas) {
            this.audioVisualizer = new AudioVisualizer(this.els.waveformCanvas, {
                waveColor: this.settings.avatarColor || '#6366f1',
                interruptThreshold: this.settings.interruptThreshold ?? 0.05
            });

            this.audioVisualizer.onInterrupt((volume) => {
                this._handleVoiceInterrupt(volume);
            });

            this.audioVisualizer.onVolumeChange((volume) => {
                if (this.avatarEngine && this.isSpeaking) {
                    this.avatarEngine.setAudioLevel(volume);
                }
            });
        }
    }

    /**
     * Initializes the Web Speech API recognition.
     * @private
     */
    _initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[VoicePilot] SpeechRecognition not supported.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.settings.sttContinuous ?? true;
        this.recognition.interimResults = this.settings.sttInterim ?? true;
        this.recognition.lang = this.settings.sttLanguage || 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this._setMicState(true);
            this._setAvatarState('listening');
            this._setVoiceStatus(this.i18n.t('listening'));
            this._setStatus('listening');
        };

        this.recognition.onresult = (event) => {
            this._handleRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            this._handleRecognitionError(event);
        };

        this.recognition.onend = () => {
            // Auto-restart if continuous and still supposed to be listening
            if (this.isListening && this.settings.sttContinuous) {
                try {
                    this.recognition.start();
                } catch (e) {
                    this.isListening = false;
                    this._setMicState(false);
                    this._setAvatarState('idle');
                    this._setVoiceStatus(this.i18n.t('click_to_speak'));
                    this._setStatus('ready');
                }
            } else {
                this.isListening = false;
                this._setMicState(false);
                this._setAvatarState('idle');
                this._setVoiceStatus(this.i18n.t('click_to_speak'));
                this._setStatus('ready');
            }
        };
    }

    // ================================================================
    // Event Binding
    // ================================================================

    /**
     * Binds all UI event listeners.
     * @private
     */
    _bindEvents() {
        // Language switcher
        if (this.els.langSwitcher) {
            this.els.langSwitcher.addEventListener('click', (e) => {
                const btn = e.target.closest('.lang-btn');
                if (btn) {
                    const lang = btn.dataset.lang;
                    this._applyLanguage(lang);
                    this.settings.generalLanguage = lang;
                    this._saveSettings();
                }
            });
        }

        // Theme toggle
        if (this.els.themeToggle) {
            this.els.themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                this._setTheme(next);
                this.settings.generalTheme = next;
                this._saveSettings();
            });
        }

        // Settings modal
        if (this.els.settingsBtn) {
            this.els.settingsBtn.addEventListener('click', () => this._openSettings());
        }
        if (this.els.settingsClose) {
            this.els.settingsClose.addEventListener('click', () => this._closeSettings());
        }
        if (this.els.settingsCancel) {
            this.els.settingsCancel.addEventListener('click', () => this._closeSettings());
        }
        if (this.els.settingsModal) {
            this.els.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.els.settingsModal) this._closeSettings();
            });
        }
        if (this.els.settingsSave) {
            this.els.settingsSave.addEventListener('click', () => this._saveSettingsFromUI());
        }

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const panel = document.getElementById(`settings-${tab.dataset.tab}`);
                if (panel) panel.classList.add('active');
            });
        });

        // Range value displays
        this._bindRangeDisplay('llmTemperature', 'temperatureValue');
        this._bindRangeDisplay('ttsRate', 'ttsRateValue');
        this._bindRangeDisplay('ttsPitch', 'ttsPitchValue');
        this._bindRangeDisplay('ttsVolume', 'ttsVolumeValue');
        this._bindRangeDisplay('interruptThreshold', 'interruptThresholdValue');
        this._bindRangeDisplay('avatarSize', 'avatarSizeValue');
        this._bindRangeDisplay('generalFontSize', 'fontSizeValue');

        // New conversation
        if (this.els.newChatBtn) {
            this.els.newChatBtn.addEventListener('click', () => this._createConversation());
        }

        // Send message
        if (this.els.sendBtn) {
            this.els.sendBtn.addEventListener('click', () => this._sendTextMessage());
        }

        // Text input
        if (this.els.textInput) {
            this.els.textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    if (this.settings.sendOnEnter !== false) {
                        e.preventDefault();
                        this._sendTextMessage();
                    }
                }
            });
            // Auto-resize textarea
            this.els.textInput.addEventListener('input', () => {
                this.els.textInput.style.height = 'auto';
                this.els.textInput.style.height = Math.min(this.els.textInput.scrollHeight, 120) + 'px';
            });
        }

        // Microphone button
        if (this.els.micBtn) {
            this.els.micBtn.addEventListener('click', () => this._toggleListening());
        }

        // Mute TTS button
        if (this.els.muteBtn) {
            this.els.muteBtn.addEventListener('click', () => this._toggleMute());
        }

        // Stop speaking button
        if (this.els.stopBtn) {
            this.els.stopBtn.addEventListener('click', () => this._stopSpeaking());
        }

        // Avatar toggle
        if (this.els.avatarToggleBtn) {
            this.els.avatarToggleBtn.addEventListener('click', () => {
                this.els.avatarPanel.classList.toggle('hidden');
            });
        }

        // Context menu
        if (this.els.contextMenu) {
            document.addEventListener('click', () => this._hideContextMenu());
        }
        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this._handleContextAction(item.dataset.action);
            });
        });

        // Export all
        if (this.els.exportAllBtn) {
            this.els.exportAllBtn.addEventListener('click', () => this._exportAllConversations());
        }

        // Clear all data
        if (this.els.clearAllData) {
            this.els.clearAllData.addEventListener('click', () => {
                if (confirm(this.i18n.t('clear_confirm'))) {
                    localStorage.removeItem('vps_conversations');
                    localStorage.removeItem('vps_settings');
                    this.conversations = [];
                    this.activeConversationId = null;
                    this._updateConversationList();
                    this._updateChatArea();
                    this._showToast('info', this.i18n.t('saved'));
                }
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                if (prompt) {
                    if (!this.activeConversationId) {
                        this._createConversation();
                    }
                    this._sendMessage(prompt);
                }
            });
        });

        // LLM provider change - update defaults
        if (this.els.llmProvider) {
            this.els.llmProvider.addEventListener('change', () => {
                const provider = this.els.llmProvider.value;
                const defaults = this._getProviderDefaults(provider);
                if (defaults.apiBase) this.els.llmApiBase.value = defaults.apiBase;
                if (defaults.model) this.els.llmModel.value = defaults.model;
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                this._closeSettings();
                this._hideContextMenu();
            }
        });
    }

    /**
     * Binds a range input to its value display element.
     * @param {string} rangeId - Range input element ID.
     * @param {string} displayId - Display element ID.
     * @private
     */
    _bindRangeDisplay(rangeId, displayId) {
        const range = this.els[rangeId];
        const display = this.els[displayId];
        if (range && display) {
            range.addEventListener('input', () => {
                display.textContent = range.value;
            });
        }
    }

    // ================================================================
    // Language & Theme
    // ================================================================

    /**
     * Applies a language to the UI and updates settings.
     * @param {string} lang - Language code.
     * @private
     */
    _applyLanguage(lang) {
        this.i18n.setLang(lang);

        // Update lang switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update general language select in settings
        if (this.els.generalLanguage) {
            this.els.generalLanguage.value = lang;
        }

        // Update avatar status text
        this._updateAvatarStatusText();
    }

    /**
     * Sets the application theme.
     * @param {string} theme - 'dark' or 'light'.
     * @private
     */
    _setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (this.els.generalTheme) {
            this.els.generalTheme.value = theme;
        }
    }

    // ================================================================
    // Settings Management
    // ================================================================

    /**
     * Loads settings from localStorage.
     * @returns {Object} Settings object.
     * @private
     */
    _loadSettings() {
        try {
            const saved = localStorage.getItem('vps_settings');
            if (saved) {
                return { ...this._getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('[VoicePilot] Failed to load settings:', e);
        }
        return this._getDefaultSettings();
    }

    /**
     * Returns default settings values.
     * @returns {Object}
     * @private
     */
    _getDefaultSettings() {
        return {
            llmProvider: 'openai',
            llmApiKey: '',
            llmApiBase: '',
            llmModel: '',
            llmSystemPrompt: 'You are a helpful AI assistant.',
            llmTemperature: 0.7,
            llmMaxTokens: 2048,
            llmStream: true,
            ttsEngine: 'browser',
            ttsVoice: '',
            ttsRate: 1,
            ttsPitch: 1,
            ttsVolume: 1,
            ttsAutoSpeak: true,
            sttLanguage: 'en-US',
            sttContinuous: true,
            sttInterim: true,
            voiceInterrupt: true,
            interruptThreshold: 0.05,
            avatarEnabled: true,
            avatarColor: '#6366f1',
            avatarSize: 280,
            avatarStyle: 'circle',
            generalLanguage: 'en',
            generalTheme: 'dark',
            generalFontSize: 14,
            sendOnEnter: true
        };
    }

    /**
     * Saves current settings to localStorage.
     * @private
     */
    _saveSettings() {
        try {
            localStorage.setItem('vps_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('[VoicePilot] Failed to save settings:', e);
        }
    }

    /**
     * Applies settings to the UI and modules.
     * @private
     */
    _applySettings() {
        // Theme
        this._setTheme(this.settings.generalTheme || 'dark');

        // Font size
        if (this.settings.generalFontSize) {
            document.documentElement.style.fontSize = this.settings.generalFontSize + 'px';
        }

        // Avatar
        if (this.els.avatarPanel) {
            this.els.avatarPanel.classList.toggle('hidden', !this.settings.avatarEnabled);
        }

        // Populate settings UI
        this._populateSettingsUI();
    }

    /**
     * Populates the settings modal with current values.
     * @private
     */
    _populateSettingsUI() {
        const s = this.settings;

        this._setSelectValue('llmProvider', s.llmProvider);
        this._setInputValue('llmApiKey', s.llmApiKey);
        this._setInputValue('llmApiBase', s.llmApiBase);
        this._setInputValue('llmModel', s.llmModel);
        this._setInputValue('llmSystemPrompt', s.llmSystemPrompt);
        this._setRangeValue('llmTemperature', 'temperatureValue', s.llmTemperature);
        this._setInputValue('llmMaxTokens', s.llmMaxTokens);
        this._setChecked('llmStream', s.llmStream);

        this._setSelectValue('ttsEngine', s.ttsEngine);
        this._populateTTSVoices();
        this._setRangeValue('ttsRate', 'ttsRateValue', s.ttsRate);
        this._setRangeValue('ttsPitch', 'ttsPitchValue', s.ttsPitch);
        this._setRangeValue('ttsVolume', 'ttsVolumeValue', s.ttsVolume);
        this._setChecked('ttsAutoSpeak', s.ttsAutoSpeak);

        this._setSelectValue('sttLanguage', s.sttLanguage);
        this._setChecked('sttContinuous', s.sttContinuous);
        this._setChecked('sttInterim', s.sttInterim);
        this._setChecked('voiceInterrupt', s.voiceInterrupt);
        this._setRangeValue('interruptThreshold', 'interruptThresholdValue', s.interruptThreshold);

        this._setChecked('avatarEnabled', s.avatarEnabled);
        this._setInputValue('avatarColor', s.avatarColor);
        this._setRangeValue('avatarSize', 'avatarSizeValue', s.avatarSize);
        this._setSelectValue('avatarStyle', s.avatarStyle);

        this._setSelectValue('generalLanguage', s.generalLanguage);
        this._setSelectValue('generalTheme', s.generalTheme);
        this._setRangeValue('generalFontSize', 'fontSizeValue', s.generalFontSize);
        this._setChecked('sendOnEnter', s.sendOnEnter);
    }

    /**
     * Saves settings from the UI back to the settings object.
     * @private
     */
    _saveSettingsFromUI() {
        this.settings.llmProvider = this._getSelectValue('llmProvider');
        this.settings.llmApiKey = this._getInputValue('llmApiKey');
        this.settings.llmApiBase = this._getInputValue('llmApiBase');
        this.settings.llmModel = this._getInputValue('llmModel');
        this.settings.llmSystemPrompt = this._getInputValue('llmSystemPrompt');
        this.settings.llmTemperature = parseFloat(this._getInputValue('llmTemperature')) || 0.7;
        this.settings.llmMaxTokens = parseInt(this._getInputValue('llmMaxTokens')) || 2048;
        this.settings.llmStream = this._getChecked('llmStream');

        this.settings.ttsEngine = this._getSelectValue('ttsEngine');
        this.settings.ttsVoice = this._getSelectValue('ttsVoice');
        this.settings.ttsRate = parseFloat(this._getInputValue('ttsRate')) || 1;
        this.settings.ttsPitch = parseFloat(this._getInputValue('ttsPitch')) || 1;
        this.settings.ttsVolume = parseFloat(this._getInputValue('ttsVolume')) || 1;
        this.settings.ttsAutoSpeak = this._getChecked('ttsAutoSpeak');

        this.settings.sttLanguage = this._getSelectValue('sttLanguage');
        this.settings.sttContinuous = this._getChecked('sttContinuous');
        this.settings.sttInterim = this._getChecked('sttInterim');
        this.settings.voiceInterrupt = this._getChecked('voiceInterrupt');
        this.settings.interruptThreshold = parseFloat(this._getInputValue('interruptThreshold')) || 0.05;

        this.settings.avatarEnabled = this._getChecked('avatarEnabled');
        this.settings.avatarColor = this._getInputValue('avatarColor');
        this.settings.avatarSize = parseInt(this._getInputValue('avatarSize')) || 280;
        this.settings.avatarStyle = this._getSelectValue('avatarStyle');

        this.settings.generalLanguage = this._getSelectValue('generalLanguage');
        this.settings.generalTheme = this._getSelectValue('generalTheme');
        this.settings.generalFontSize = parseInt(this._getInputValue('generalFontSize')) || 14;
        this.settings.sendOnEnter = this._getChecked('sendOnEnter');

        // Apply settings
        this._applySettings();
        this._initLLMAdapter();
        this._updateSpeechRecognitionConfig();

        // Update avatar
        if (this.avatarEngine) {
            this.avatarEngine.setColor(this.settings.avatarColor);
            this.avatarEngine.setSize(this.settings.avatarSize);
            this.avatarEngine.style = this.settings.avatarStyle;
        }

        // Update audio visualizer
        if (this.audioVisualizer) {
            this.audioVisualizer.setWaveColor(this.settings.avatarColor);
            this.audioVisualizer.setInterruptThreshold(this.settings.interruptThreshold);
        }

        this._saveSettings();
        this._closeSettings();
        this._showToast('success', this.i18n.t('saved'));
    }

    // ================================================================
    // Settings UI Helpers
    // ================================================================

    _setSelectValue(id, val) { if (this.els[id]) this.els[id].value = val || ''; }
    _setInputValue(id, val) { if (this.els[id]) this.els[id].value = val ?? ''; }
    _setChecked(id, val) { if (this.els[id]) this.els[id].checked = !!val; }
    _setRangeValue(rangeId, displayId, val) {
        if (this.els[rangeId]) this.els[rangeId].value = val;
        if (this.els[displayId]) this.els[displayId].textContent = val;
    }
    _getSelectValue(id) { return this.els[id] ? this.els[id].value : ''; }
    _getInputValue(id) { return this.els[id] ? this.els[id].value : ''; }
    _getChecked(id) { return this.els[id] ? this.els[id].checked : false; }

    /**
     * Gets default API base and model for a provider.
     * @param {string} provider
     * @returns {{apiBase?: string, model?: string}}
     * @private
     */
    _getProviderDefaults(provider) {
        const adapter = new LLMAdapter({ provider });
        return { apiBase: adapter.apiBase, model: adapter.model };
    }

    /**
     * Populates the TTS voice selector with available voices.
     * @private
     */
    _populateTTSVoices() {
        if (!this.els.ttsVoice) return;
        this.els.ttsVoice.innerHTML = '';

        const voices = this.synth.getVoices();
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) option.selected = true;
            this.els.ttsVoice.appendChild(option);
        });

        // Restore saved voice preference
        if (this.settings.ttsVoice !== '' && this.els.ttsVoice.options[this.settings.ttsVoice]) {
            this.els.ttsVoice.value = this.settings.ttsVoice;
        }
    }

    /**
     * Opens the settings modal.
     * @private
     */
    _openSettings() {
        this._populateSettingsUI();
        this.els.settingsModal.classList.add('active');
    }

    /**
     * Closes the settings modal.
     * @private
     */
    _closeSettings() {
        this.els.settingsModal.classList.remove('active');
    }

    // ================================================================
    // Conversation Management
    // ================================================================

    /**
     * Loads conversations from localStorage.
     * @private
     */
    _loadConversations() {
        try {
            const saved = localStorage.getItem('vps_conversations');
            if (saved) {
                this.conversations = JSON.parse(saved);
                if (this.conversations.length > 0) {
                    this.activeConversationId = this.conversations[0].id;
                }
            }
        } catch (e) {
            console.warn('[VoicePilot] Failed to load conversations:', e);
            this.conversations = [];
        }
    }

    /**
     * Saves conversations to localStorage.
     * @private
     */
    _saveConversations() {
        try {
            localStorage.setItem('vps_conversations', JSON.stringify(this.conversations));
        } catch (e) {
            console.warn('[VoicePilot] Failed to save conversations:', e);
        }
    }

    /**
     * Creates a new conversation.
     * @param {string} [title] - Optional title.
     * @returns {Object} The new conversation object.
     * @private
     */
    _createConversation(title) {
        const conv = {
            id: 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            title: title || this.i18n.t('untitled'),
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.conversations.unshift(conv);
        this.activeConversationId = conv.id;
        this._saveConversations();
        this._updateConversationList();
        this._updateChatArea();
        return conv;
    }

    /**
     * Switches to a different conversation.
     * @param {string} id - Conversation ID.
     * @private
     */
    _switchConversation(id) {
        if (this.activeConversationId === id) return;
        this.activeConversationId = id;
        this._updateConversationList();
        this._updateChatArea();
    }

    /**
     * Deletes a conversation.
     * @param {string} id - Conversation ID.
     * @private
     */
    _deleteConversation(id) {
        if (!confirm(this.i18n.t('delete_confirm'))) return;

        this.conversations = this.conversations.filter(c => c.id !== id);
        if (this.activeConversationId === id) {
            this.activeConversationId = this.conversations.length > 0 ? this.conversations[0].id : null;
        }
        this._saveConversations();
        this._updateConversationList();
        this._updateChatArea();
    }

    /**
     * Renames a conversation.
     * @param {string} id - Conversation ID.
     * @private
     */
    _renameConversation(id) {
        const conv = this.conversations.find(c => c.id === id);
        if (!conv) return;

        const newName = prompt('New name:', conv.title);
        if (newName !== null && newName.trim()) {
            conv.title = newName.trim();
            conv.updatedAt = Date.now();
            this._saveConversations();
            this._updateConversationList();
        }
    }

    /**
     * Gets the currently active conversation.
     * @returns {Object|null}
     * @private
     */
    _getActiveConversation() {
        return this.conversations.find(c => c.id === this.activeConversationId) || null;
    }

    /**
     * Updates the conversation list UI in the sidebar.
     * @private
     */
    _updateConversationList() {
        if (!this.els.conversationList) return;
        this.els.conversationList.innerHTML = '';

        if (this.conversations.length === 0) {
            this.els.conversationList.innerHTML = `
                <div style="padding:20px;text-align:center;color:var(--text-tertiary);font-size:13px;">
                    ${this.i18n.t('no_conversations')}
                </div>`;
            return;
        }

        this.conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = `conversation-item${conv.id === this.activeConversationId ? ' active' : ''}`;
            item.dataset.id = conv.id;

            const lastMsg = conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].content.slice(0, 50)
                : '';
            const timeStr = this._formatTime(conv.updatedAt);

            item.innerHTML = `
                <div class="conv-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="conv-info">
                    <div class="conv-title">${this._escapeHtml(conv.title)}</div>
                    <div class="conv-preview">${this._escapeHtml(lastMsg)}</div>
                </div>
                <span class="conv-time">${timeStr}</span>`;

            item.addEventListener('click', () => this._switchConversation(conv.id));

            // Right-click for context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this._showContextMenu(e, conv.id);
            });

            this.els.conversationList.appendChild(item);
        });
    }

    /**
     * Updates the chat area to display messages from the active conversation.
     * @private
     */
    _updateChatArea() {
        if (!this.els.chatMessages) return;

        const conv = this._getActiveConversation();

        if (!conv || conv.messages.length === 0) {
            // Show welcome screen
            this.els.chatMessages.innerHTML = '';
            this.els.chatMessages.appendChild(this._createWelcomeScreen());
            return;
        }

        this.els.chatMessages.innerHTML = '';
        conv.messages.forEach(msg => {
            this.els.chatMessages.appendChild(this._createMessageElement(msg));
        });

        this._scrollToBottom();
    }

    /**
     * Creates the welcome screen element.
     * @returns {HTMLElement}
     * @private
     */
    _createWelcomeScreen() {
        const div = document.createElement('div');
        div.className = 'welcome-screen';
        div.id = 'welcomeScreen';
        div.innerHTML = `
            <div class="welcome-icon">
                <svg viewBox="0 0 64 64" width="64" height="64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.5"/>
                    <circle cx="32" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.3"/>
                    <path d="M22 36 Q32 42 42 36" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="24" cy="28" r="3" fill="var(--accent)" opacity="0.7"/>
                    <circle cx="40" cy="28" r="3" fill="var(--accent)" opacity="0.7"/>
                </svg>
            </div>
            <h2 data-i18n="welcome_title">${this.i18n.t('welcome_title')}</h2>
            <p data-i18n="welcome_desc">${this.i18n.t('welcome_desc')}</p>
            <div class="quick-actions">
                <button class="quick-action-btn" data-prompt="Hello! Can you introduce yourself?">
                    <span>${this.i18n.t('quick_intro')}</span>
                </button>
                <button class="quick-action-btn" data-prompt="What can you do for me?">
                    <span>${this.i18n.t('quick_capabilities')}</span>
                </button>
                <button class="quick-action-btn" data-prompt="Tell me a joke.">
                    <span>${this.i18n.t('quick_joke')}</span>
                </button>
            </div>`;

        // Re-bind quick action buttons
        div.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                if (prompt) {
                    if (!this.activeConversationId) this._createConversation();
                    this._sendMessage(prompt);
                }
            });
        });

        return div;
    }

    /**
     * Creates a message DOM element.
     * @param {Object} msg - Message object {role, content, timestamp}.
     * @returns {HTMLElement}
     * @private
     */
    _createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = `message ${msg.role}`;

        const avatarLabel = msg.role === 'user' ? 'U' : 'AI';
        const timeStr = this._formatTime(msg.timestamp);

        div.innerHTML = `
            <div class="msg-avatar">${avatarLabel}</div>
            <div>
                <div class="msg-bubble">${this._formatMessageContent(msg.content)}</div>
                <div class="msg-time">${timeStr}</div>
            </div>`;

        return div;
    }

    /**
     * Creates a streaming message element that updates as chunks arrive.
     * @returns {{container: HTMLElement, bubble: HTMLElement}}
     * @private
     */
    _createStreamingMessageElement() {
        const div = document.createElement('div');
        div.className = 'message ai';

        div.innerHTML = `
            <div class="msg-avatar">AI</div>
            <div>
                <div class="msg-bubble streaming-cursor"></div>
                <div class="msg-time"></div>
            </div>`;

        return {
            container: div,
            bubble: div.querySelector('.msg-bubble'),
            timeEl: div.querySelector('.msg-time')
        };
    }

    /**
     * Formats message content with basic markdown-like rendering.
     * @param {string} content - Raw message content.
     * @returns {string} HTML formatted content.
     * @private
     */
    _formatMessageContent(content) {
        let html = this._escapeHtml(content);

        // Code blocks (```...```)
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

        // Inline code (`...`)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold (**...**)
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic (*...*)
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    // ================================================================
    // Message Sending & LLM Communication
    // ================================================================

    /**
     * Sends a text message from the input field.
     * @private
     */
    _sendTextMessage() {
        const input = this.els.textInput;
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';

        this._sendMessage(text);
    }

    /**
     * Sends a message to the LLM and handles the response.
     * @param {string} text - The user message text.
     * @private
     */
    async _sendMessage(text) {
        if (!text.trim()) return;

        // Ensure we have an active conversation
        if (!this.activeConversationId) {
            this._createConversation();
        }

        const conv = this._getActiveConversation();
        if (!conv) return;

        // Hide welcome screen if visible
        const welcome = document.getElementById('welcomeScreen');
        if (welcome) welcome.remove();

        // Add user message
        const userMsg = {
            role: 'user',
            content: text.trim(),
            timestamp: Date.now()
        };
        conv.messages.push(userMsg);
        conv.updatedAt = Date.now();

        // Render user message
        const userEl = this._createMessageElement(userMsg);
        this.els.chatMessages.appendChild(userEl);
        this._scrollToBottom();

        // Update conversation list
        this._saveConversations();
        this._updateConversationList();

        // Check API key
        if (!this.settings.llmApiKey) {
            const errorMsg = {
                role: 'assistant',
                content: this.i18n.t('error_no_api_key'),
                timestamp: Date.now()
            };
            conv.messages.push(errorMsg);
            this.els.chatMessages.appendChild(this._createMessageElement(errorMsg));
            this._scrollToBottom();
            this._saveConversations();
            return;
        }

        // Set thinking state
        this.isThinking = true;
        this._setAvatarState('thinking');
        this._setStatus('thinking');

        // Show typing indicator
        const typingEl = this._createTypingIndicator();
        this.els.chatMessages.appendChild(typingEl);
        this._scrollToBottom();

        try {
            // Build messages array for LLM
            const messages = conv.messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            // Remove typing indicator
            typingEl.remove();

            // Create streaming message element
            const streaming = this._createStreamingMessageElement();
            this.els.chatMessages.appendChild(streaming.container);
            this._scrollToBottom();

            // Send to LLM
            const responseText = await this.llmAdapter.chat(messages, {
                onChunk: (chunk, fullText) => {
                    streaming.bubble.innerHTML = this._formatMessageContent(fullText);
                    this._scrollToBottom();
                },
                onDone: (fullText) => {
                    streaming.bubble.classList.remove('streaming-cursor');
                    streaming.timeEl.textContent = this._formatTime(Date.now());
                },
                onError: (error) => {
                    streaming.bubble.textContent = `Error: ${error.message}`;
                    streaming.bubble.classList.remove('streaming-cursor');
                    streaming.bubble.style.color = 'var(--danger)';
                }
            });

            // Save AI message
            if (responseText) {
                const aiMsg = {
                    role: 'assistant',
                    content: responseText,
                    timestamp: Date.now()
                };
                conv.messages.push(aiMsg);
                conv.updatedAt = Date.now();

                // Auto-title from first exchange
                if (conv.messages.length === 2) {
                    conv.title = text.trim().slice(0, 40) + (text.length > 40 ? '...' : '');
                }

                this._saveConversations();
                this._updateConversationList();

                // Auto-speak response
                if (this.settings.ttsAutoSpeak && !this.isTTSMuted) {
                    this._speak(responseText);
                }
            }

        } catch (error) {
            typingEl.remove();

            const errorMsg = {
                role: 'assistant',
                content: `${this.i18n.t('error_api_request')}\n${error.message}`,
                timestamp: Date.now()
            };
            conv.messages.push(errorMsg);
            this.els.chatMessages.appendChild(this._createMessageElement(errorMsg));
            this._scrollToBottom();
            this._saveConversations();
        } finally {
            this.isThinking = false;
            this._setAvatarState('idle');
            this._setStatus('ready');
        }
    }

    /**
     * Creates a typing indicator element.
     * @returns {HTMLElement}
     * @private
     */
    _createTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai';
        div.innerHTML = `
            <div class="msg-avatar">AI</div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>`;
        return div;
    }

    // ================================================================
    // Speech Recognition (STT)
    // ================================================================

    /**
     * Toggles speech recognition on/off.
     * @private
     */
    _toggleListening() {
        if (this.isListening) {
            this._stopListening();
        } else {
            this._startListening();
        }
    }

    /**
     * Starts speech recognition.
     * @private
     */
    _startListening() {
        if (!this.recognition) {
            this._showToast('error', this.i18n.t('stt_not_supported'));
            return;
        }

        // Stop TTS if speaking
        if (this.isSpeaking) {
            this._stopSpeaking();
        }

        try {
            this.recognition.lang = this.settings.sttLanguage || 'en-US';
            this.recognition.continuous = this.settings.sttContinuous ?? true;
            this.recognition.interimResults = this.settings.sttInterim ?? true;
            this.recognition.start();
        } catch (e) {
            console.error('[VoicePilot] Failed to start recognition:', e);
        }
    }

    /**
     * Stops speech recognition.
     * @private
     */
    _stopListening() {
        this.isListening = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore
            }
        }
        this._setMicState(false);
        this._setAvatarState('idle');
        this._setVoiceStatus(this.i18n.t('click_to_speak'));
        this._setStatus('ready');

        if (this.audioVisualizer) {
            this.audioVisualizer.stop();
        }
    }

    /**
     * Handles speech recognition results.
     * @param {SpeechRecognitionEvent} event
     * @private
     */
    _handleRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Show interim results in voice status
        if (interimTranscript && !finalTranscript) {
            this._setVoiceStatus(interimTranscript);
        }

        // Process final result
        if (finalTranscript) {
            this._setVoiceStatus(finalTranscript);
            this._sendMessage(finalTranscript);
        }
    }

    /**
     * Handles speech recognition errors.
     * @param {SpeechRecognitionErrorEvent} event
     * @private
     */
    _handleRecognitionError(event) {
        switch (event.error) {
            case 'no-speech':
                this._showToast('warning', this.i18n.t('stt_no_speech'));
                break;
            case 'aborted':
                // User-initiated abort, no message needed
                break;
            case 'not-allowed':
                this._showToast('error', 'Microphone access denied. Please allow microphone permissions.');
                break;
            default:
                this._showToast('error', `${this.i18n.t('stt_error')} (${event.error})`);
                break;
        }

        this.isListening = false;
        this._setMicState(false);
        this._setAvatarState('idle');
        this._setVoiceStatus(this.i18n.t('click_to_speak'));
        this._setStatus('ready');
    }

    /**
     * Updates speech recognition configuration from settings.
     * @private
     */
    _updateSpeechRecognitionConfig() {
        if (this.recognition) {
            this.recognition.lang = this.settings.sttLanguage || 'en-US';
            this.recognition.continuous = this.settings.sttContinuous ?? true;
            this.recognition.interimResults = this.settings.sttInterim ?? true;
        }
    }

    // ================================================================
    // Speech Synthesis (TTS)
    // ================================================================

    /**
     * Speaks the given text using the Web Speech Synthesis API.
     * @param {string} text - Text to speak.
     * @private
     */
    _speak(text) {
        if (!this.synth || this.isTTSMuted) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.ttsRate || 1;
        utterance.pitch = this.settings.ttsPitch || 1;
        utterance.volume = this.settings.ttsVolume || 1;

        // Set voice if available
        const voices = this.synth.getVoices();
        const voiceIndex = parseInt(this.settings.ttsVoice);
        if (!isNaN(voiceIndex) && voices[voiceIndex]) {
            utterance.voice = voices[voiceIndex];
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this._setAvatarState('speaking');
            this._setStatus('speaking');
            if (this.els.stopBtn) this.els.stopBtn.style.display = '';
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this._setAvatarState('idle');
            this._setStatus('ready');
            if (this.els.stopBtn) this.els.stopBtn.style.display = 'none';
            if (this.avatarEngine) this.avatarEngine.setAudioLevel(0);
        };

        utterance.onerror = (e) => {
            if (e.error !== 'canceled') {
                console.error('[VoicePilot] TTS error:', e.error);
            }
            this.isSpeaking = false;
            this._setAvatarState('idle');
            this._setStatus('ready');
            if (this.els.stopBtn) this.els.stopBtn.style.display = 'none';
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    /**
     * Stops the current TTS output.
     * @private
     */
    _stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
        this._setAvatarState('idle');
        this._setStatus('ready');
        if (this.els.stopBtn) this.els.stopBtn.style.display = 'none';
        if (this.avatarEngine) this.avatarEngine.setAudioLevel(0);
    }

    /**
     * Toggles TTS mute state.
     * @private
     */
    _toggleMute() {
        this.isTTSMuted = !this.isTTSMuted;
        if (this.els.muteBtn) {
            this.els.muteBtn.style.opacity = this.isTTSMuted ? '0.4' : '1';
        }
        if (this.isTTSMuted && this.isSpeaking) {
            this._stopSpeaking();
        }
    }

    /**
     * Handles voice interrupt: stops TTS when user starts speaking.
     * @param {number} volume - Detected volume level.
     * @private
     */
    _handleVoiceInterrupt(volume) {
        if (this.settings.voiceInterrupt && this.isSpeaking) {
            this._stopSpeaking();
            this._showToast('info', this.i18n.t('voice_interrupt'));
        }
    }

    // ================================================================
    // UI State Updates
    // ================================================================

    /**
     * Sets the microphone button visual state.
     * @param {boolean} active - Whether the mic is active.
     * @private
     */
    _setMicState(active) {
        if (this.els.micBtn) {
            this.els.micBtn.classList.toggle('listening', active);
        }
        if (this.els.voiceWaveform) {
            this.els.voiceWaveform.classList.toggle('active', active);
        }
    }

    /**
     * Sets the avatar animation state.
     * @param {string} state - 'idle'|'listening'|'speaking'|'thinking'.
     * @private
     */
    _setAvatarState(state) {
        if (this.avatarEngine) {
            this.avatarEngine.setState(state);

            // Set expression based on state
            const expressions = {
                'idle': 'neutral',
                'listening': 'neutral',
                'speaking': 'happy',
                'thinking': 'thinking'
            };
            this.avatarEngine.setExpression(expressions[state] || 'neutral');
        }

        // Update avatar status indicator
        if (this.els.avatarStatus) {
            this.els.avatarStatus.className = 'avatar-status ' + state;
        }
        this._updateAvatarStatusText();
    }

    /**
     * Updates the avatar status text based on current state.
     * @private
     */
    _updateAvatarStatusText() {
        if (!this.els.avatarStatus) return;

        const state = this.avatarEngine ? this.avatarEngine.getState() : 'idle';
        const textMap = {
            'idle': this.i18n.t('avatar_idle'),
            'listening': this.i18n.t('avatar_listening'),
            'speaking': this.i18n.t('avatar_speaking'),
            'thinking': this.i18n.t('avatar_thinking')
        };

        const dot = this.els.avatarStatus.querySelector('.avatar-status-dot');
        const span = this.els.avatarStatus.querySelector('span:last-child');
        if (span) span.textContent = textMap[state] || '';
    }

    /**
     * Sets the voice status bar text.
     * @param {string} text - Status text to display.
     * @private
     */
    _setVoiceStatus(text) {
        if (this.els.voiceStatus) {
            this.els.voiceStatus.textContent = text;
            this.els.voiceStatus.classList.toggle('active', this.isListening || this.isSpeaking);
        }
    }

    /**
     * Sets the connection status indicator.
     * @param {string} status - 'ready'|'listening'|'speaking'|'thinking'|'error'.
     * @private
     */
    _setStatus(status) {
        if (!this.els.connectionStatus) return;

        const dot = this.els.connectionStatus.querySelector('.status-dot');
        const text = this.els.connectionStatus.querySelector('span:last-child');

        const statusMap = {
            'ready': { color: 'var(--success)', label: this.i18n.t('status_ready') },
            'listening': { color: 'var(--warning)', label: this.i18n.t('status_listening') },
            'speaking': { color: 'var(--info)', label: this.i18n.t('status_speaking') },
            'thinking': { color: 'var(--accent)', label: this.i18n.t('status_thinking') },
            'error': { color: 'var(--danger)', label: this.i18n.t('status_error') }
        };

        const info = statusMap[status] || statusMap['ready'];
        if (dot) dot.style.background = info.color;
        if (text) text.textContent = info.label;
    }

    /**
     * Scrolls the chat messages to the bottom.
     * @private
     */
    _scrollToBottom() {
        if (this.els.chatMessages) {
            this.els.chatMessages.scrollTop = this.els.chatMessages.scrollHeight;
        }
    }

    /**
     * General UI update method.
     * @private
     */
    _updateUI() {
        this._updateConversationList();
        this._updateChatArea();
    }

    // ================================================================
    // Context Menu
    // ================================================================

    /**
     * Shows the context menu at the specified position.
     * @param {MouseEvent} e - Mouse event.
     * @param {string} convId - Target conversation ID.
     * @private
     */
    _showContextMenu(e, convId) {
        this._contextMenuTarget = convId;
        const menu = this.els.contextMenu;
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.classList.add('active');

        // Ensure menu stays within viewport
        requestAnimationFrame(() => {
            const rect = menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                menu.style.left = (e.clientX - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                menu.style.top = (e.clientY - rect.height) + 'px';
            }
        });
    }

    /**
     * Hides the context menu.
     * @private
     */
    _hideContextMenu() {
        if (this.els.contextMenu) {
            this.els.contextMenu.classList.remove('active');
        }
        this._contextMenuTarget = null;
    }

    /**
     * Handles a context menu action.
     * @param {string} action - 'rename'|'export'|'delete'.
     * @private
     */
    _handleContextAction(action) {
        if (!this._contextMenuTarget) return;

        switch (action) {
            case 'rename':
                this._renameConversation(this._contextMenuTarget);
                break;
            case 'export':
                this._exportConversation(this._contextMenuTarget);
                break;
            case 'delete':
                this._deleteConversation(this._contextMenuTarget);
                break;
        }

        this._hideContextMenu();
    }

    // ================================================================
    // Export
    // ================================================================

    /**
     * Exports a single conversation.
     * @param {string} id - Conversation ID.
     * @param {string} [format='markdown'] - Export format ('markdown'|'json').
     * @private
     */
    _exportConversation(id, format = 'markdown') {
        const conv = this.conversations.find(c => c.id === id);
        if (!conv) return;

        let content, filename, mimeType;

        if (format === 'json') {
            content = JSON.stringify(conv, null, 2);
            filename = `${conv.title}.json`;
            mimeType = 'application/json';
        } else {
            content = this._conversationToMarkdown(conv);
            filename = `${conv.title}.md`;
            mimeType = 'text/markdown';
        }

        this._downloadFile(content, filename, mimeType);
        this._showToast('success', this.i18n.t('exported'));
    }

    /**
     * Exports all conversations as a single file.
     * @private
     */
    _exportAllConversations() {
        const format = 'markdown';
        let content = '';

        if (format === 'json') {
            content = JSON.stringify(this.conversations, null, 2);
            this._downloadFile(content, 'voicepilot_conversations.json', 'application/json');
        } else {
            this.conversations.forEach(conv => {
                content += this._conversationToMarkdown(conv) + '\n\n---\n\n';
            });
            this._downloadFile(content, 'voicepilot_conversations.md', 'text/markdown');
        }

        this._showToast('success', this.i18n.t('exported'));
    }

    /**
     * Converts a conversation to Markdown format.
     * @param {Object} conv - Conversation object.
     * @returns {string} Markdown string.
     * @private
     */
    _conversationToMarkdown(conv) {
        let md = `# ${conv.title}\n\n`;
        md += `*Created: ${new Date(conv.createdAt).toLocaleString()}*\n\n---\n\n`;

        conv.messages.forEach(msg => {
            const role = msg.role === 'user' ? '**You**' : '**AI**';
            const time = new Date(msg.timestamp).toLocaleTimeString();
            md += `### ${role} (${time})\n\n${msg.content}\n\n`;
        });

        return md;
    }

    /**
     * Triggers a file download.
     * @param {string} content - File content.
     * @param {string} filename - File name.
     * @param {string} mimeType - MIME type.
     * @private
     */
    _downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ================================================================
    // Toast Notifications
    // ================================================================

    /**
     * Shows a toast notification.
     * @param {string} type - 'success'|'error'|'warning'|'info'.
     * @param {string} message - Toast message.
     * @private
     */
    _showToast(type, message) {
        // Create toast container if not exists
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ================================================================
    // Utility Methods
    // ================================================================

    /**
     * Escapes HTML special characters.
     * @param {string} str - String to escape.
     * @returns {string} Escaped string.
     * @private
     */
    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Formats a timestamp to a human-readable string.
     * @param {number} timestamp - Unix timestamp in milliseconds.
     * @returns {string} Formatted time string.
     * @private
     */
    _formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return time;
        if (isYesterday) return this.i18n.t('yesterday') + ' ' + time;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time;
    }
}

// ================================================================
// Application Bootstrap
// ================================================================

/**
 * Initializes VoicePilot Studio when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Ensure voices are loaded for TTS
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
            if (window.voicePilotApp) {
                window.voicePilotApp._populateTTSVoices();
            }
        };
    }

    // Create and start the application
    window.voicePilotApp = new VoicePilotStudio();
    console.log('[VoicePilot Studio] Application initialized.');
});
