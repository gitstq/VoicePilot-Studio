/**
 * @fileoverview I18n - Internationalization module for VoicePilot Studio.
 * Supports Simplified Chinese, Traditional Chinese, English, and Japanese.
 * Provides dynamic language switching without page reload.
 */

'use strict';

/**
 * I18n class handles all internationalization logic.
 * Manages translation dictionaries and applies translations to DOM elements.
 */
class I18n {
    /**
     * Creates an I18n instance.
     * @param {Object} [options] - Configuration options.
     * @param {string} [options.defaultLang='en'] - Default language code.
     * @param {string} [options.storageKey='vps_lang'] - localStorage key for persistence.
     */
    constructor(options = {}) {
        this.defaultLang = options.defaultLang || 'en';
        this.storageKey = options.storageKey || 'vps_lang';
        this.currentLang = this._loadSavedLang();
        this.translations = this._buildTranslations();
        this._listeners = [];
    }

    /**
     * All translation dictionaries.
     * Each key maps to a language code, which maps to a translation key-value pair.
     * @returns {Object<string, Object<string, string>>}
     * @private
     */
    _buildTranslations() {
        return {
            'en': {
                // Navbar
                'status_ready': 'Ready',
                'status_listening': 'Listening...',
                'status_speaking': 'Speaking...',
                'status_thinking': 'Thinking...',
                'status_error': 'Error',
                'status_disconnected': 'Disconnected',

                // Sidebar
                'conversations': 'Conversations',
                'new_conversation': 'New Conversation',
                'export_all': 'Export All',
                'no_conversations': 'No conversations yet',
                'delete_confirm': 'Are you sure you want to delete this conversation?',

                // Chat
                'welcome_title': 'Welcome to VoicePilot Studio',
                'welcome_desc': 'Click the microphone button to start a voice conversation, or type your message below.',
                'type_message': 'Type a message...',
                'send': 'Send',
                'quick_intro': 'Introduce yourself',
                'quick_capabilities': 'Your capabilities',
                'quick_joke': 'Tell a joke',
                'copy_message': 'Copy',
                'copied': 'Copied!',

                // Voice
                'click_to_speak': 'Click to speak',
                'listening': 'Listening...',
                'processing': 'Processing...',
                'voice_interrupt': 'Voice detected, stopping...',
                'stt_not_supported': 'Speech recognition is not supported in this browser.',
                'stt_error': 'Speech recognition error occurred.',
                'stt_no_speech': 'No speech detected. Please try again.',
                'stt_aborted': 'Speech recognition was aborted.',

                // Avatar
                'avatar_idle': 'Idle',
                'avatar_listening': 'Listening',
                'avatar_speaking': 'Speaking',
                'avatar_thinking': 'Thinking',

                // Settings
                'settings': 'Settings',
                'cancel': 'Cancel',
                'save': 'Save',
                'saved': 'Settings saved!',
                'tab_llm': 'LLM API',
                'tab_tts': 'TTS',
                'tab_stt': 'Voice Recognition',
                'tab_avatar': 'Avatar',
                'tab_general': 'General',

                // LLM Settings
                'setting_llm_provider': 'LLM Provider',
                'setting_api_key': 'API Key',
                'setting_api_base': 'API Base URL',
                'setting_model': 'Model',
                'setting_system_prompt': 'System Prompt',
                'setting_temperature': 'Temperature',
                'setting_max_tokens': 'Max Tokens',
                'setting_stream': 'Stream Response',

                // TTS Settings
                'setting_tts_engine': 'TTS Engine',
                'setting_tts_voice': 'Voice',
                'setting_tts_rate': 'Speech Rate',
                'setting_tts_pitch': 'Pitch',
                'setting_tts_volume': 'Volume',
                'setting_auto_speak': 'Auto-speak AI responses',

                // STT Settings
                'setting_stt_lang': 'Recognition Language',
                'setting_stt_continuous': 'Continuous Recognition',
                'setting_stt_interim': 'Show Interim Results',
                'setting_voice_interrupt': 'Voice Interrupt (Stop TTS when speaking)',
                'setting_interrupt_threshold': 'Interrupt Threshold',

                // Avatar Settings
                'setting_avatar_enabled': 'Show Avatar',
                'setting_avatar_color': 'Avatar Primary Color',
                'setting_avatar_size': 'Avatar Size',
                'setting_avatar_style': 'Avatar Style',

                // General Settings
                'setting_language': 'Interface Language',
                'setting_theme': 'Theme',
                'setting_font_size': 'Font Size',
                'setting_send_on_enter': 'Send on Enter',
                'clear_all_data': 'Clear All Data',
                'clear_confirm': 'This will delete all conversations and settings. Are you sure?',

                // Context Menu
                'context_rename': 'Rename',
                'context_export': 'Export',
                'context_delete': 'Delete',

                // Export
                'export_markdown': 'Export as Markdown',
                'export_json': 'Export as JSON',
                'exported': 'Conversation exported!',

                // Errors
                'error_no_api_key': 'Please set your API key in settings.',
                'error_api_request': 'API request failed. Please check your settings.',
                'error_network': 'Network error. Please check your connection.',
                'error_empty_message': 'Please enter a message.',

                // Misc
                'theme_dark': 'Dark',
                'theme_light': 'Light',
                'untitled': 'Untitled',
                'today': 'Today',
                'yesterday': 'Yesterday',
            },

            'zh-CN': {
                'status_ready': '就绪',
                'status_listening': '正在聆听...',
                'status_speaking': '正在说话...',
                'status_thinking': '思考中...',
                'status_error': '错误',
                'status_disconnected': '已断开',

                'conversations': '会话列表',
                'new_conversation': '新建会话',
                'export_all': '全部导出',
                'no_conversations': '暂无会话',
                'delete_confirm': '确定要删除此会话吗？',

                'welcome_title': '欢迎使用 VoicePilot Studio',
                'welcome_desc': '点击麦克风按钮开始语音对话，或在下方输入文字消息。',
                'type_message': '输入消息...',
                'send': '发送',
                'quick_intro': '自我介绍',
                'quick_capabilities': '你的能力',
                'quick_joke': '讲个笑话',
                'copy_message': '复制',
                'copied': '已复制！',

                'click_to_speak': '点击说话',
                'listening': '正在聆听...',
                'processing': '处理中...',
                'voice_interrupt': '检测到语音，停止播放...',
                'stt_not_supported': '当前浏览器不支持语音识别功能。',
                'stt_error': '语音识别发生错误。',
                'stt_no_speech': '未检测到语音，请重试。',
                'stt_aborted': '语音识别已中止。',

                'avatar_idle': '待机',
                'avatar_listening': '聆听中',
                'avatar_speaking': '说话中',
                'avatar_thinking': '思考中',

                'settings': '设置',
                'cancel': '取消',
                'save': '保存',
                'saved': '设置已保存！',
                'tab_llm': 'LLM API',
                'tab_tts': '语音合成',
                'tab_stt': '语音识别',
                'tab_avatar': '虚拟形象',
                'tab_general': '通用',

                'setting_llm_provider': 'LLM 提供商',
                'setting_api_key': 'API 密钥',
                'setting_api_base': 'API 基础地址',
                'setting_model': '模型',
                'setting_system_prompt': '系统提示词',
                'setting_temperature': '温度',
                'setting_max_tokens': '最大令牌数',
                'setting_stream': '流式响应',

                'setting_tts_engine': 'TTS 引擎',
                'setting_tts_voice': '语音',
                'setting_tts_rate': '语速',
                'setting_tts_pitch': '音调',
                'setting_tts_volume': '音量',
                'setting_auto_speak': '自动朗读 AI 回复',

                'setting_stt_lang': '识别语言',
                'setting_stt_continuous': '连续识别',
                'setting_stt_interim': '显示中间结果',
                'setting_voice_interrupt': '语音打断（说话时停止 TTS）',
                'setting_interrupt_threshold': '打断阈值',

                'setting_avatar_enabled': '显示虚拟形象',
                'setting_avatar_color': '形象主色',
                'setting_avatar_size': '形象大小',
                'setting_avatar_style': '形象样式',

                'setting_language': '界面语言',
                'setting_theme': '主题',
                'setting_font_size': '字体大小',
                'setting_send_on_enter': '回车发送',
                'clear_all_data': '清除所有数据',
                'clear_confirm': '这将删除所有会话和设置，确定继续吗？',

                'context_rename': '重命名',
                'context_export': '导出',
                'context_delete': '删除',

                'export_markdown': '导出为 Markdown',
                'export_json': '导出为 JSON',
                'exported': '会话已导出！',

                'error_no_api_key': '请在设置中配置 API 密钥。',
                'error_api_request': 'API 请求失败，请检查设置。',
                'error_network': '网络错误，请检查连接。',
                'error_empty_message': '请输入消息内容。',

                'theme_dark': '深色',
                'theme_light': '浅色',
                'untitled': '无标题',
                'today': '今天',
                'yesterday': '昨天',
            },

            'zh-TW': {
                'status_ready': '就緒',
                'status_listening': '正在聆聽...',
                'status_speaking': '正在說話...',
                'status_thinking': '思考中...',
                'status_error': '錯誤',
                'status_disconnected': '已斷開',

                'conversations': '會話列表',
                'new_conversation': '新建會話',
                'export_all': '全部匯出',
                'no_conversations': '暫無會話',
                'delete_confirm': '確定要刪除此會話嗎？',

                'welcome_title': '歡迎使用 VoicePilot Studio',
                'welcome_desc': '點擊麥克風按鈕開始語音對話，或在下方輸入文字訊息。',
                'type_message': '輸入訊息...',
                'send': '傳送',
                'quick_intro': '自我介紹',
                'quick_capabilities': '你的能力',
                'quick_joke': '講個笑話',
                'copy_message': '複製',
                'copied': '已複製！',

                'click_to_speak': '點擊說話',
                'listening': '正在聆聽...',
                'processing': '處理中...',
                'voice_interrupt': '偵測到語音，停止播放...',
                'stt_not_supported': '目前瀏覽器不支援語音辨識功能。',
                'stt_error': '語音辨識發生錯誤。',
                'stt_no_speech': '未偵測到語音，請重試。',
                'stt_aborted': '語音辨識已中止。',

                'avatar_idle': '待機',
                'avatar_listening': '聆聽中',
                'avatar_speaking': '說話中',
                'avatar_thinking': '思考中',

                'settings': '設定',
                'cancel': '取消',
                'save': '儲存',
                'saved': '設定已儲存！',
                'tab_llm': 'LLM API',
                'tab_tts': '語音合成',
                'tab_stt': '語音辨識',
                'tab_avatar': '虛擬形象',
                'tab_general': '一般',

                'setting_llm_provider': 'LLM 提供者',
                'setting_api_key': 'API 金鑰',
                'setting_api_base': 'API 基礎網址',
                'setting_model': '模型',
                'setting_system_prompt': '系統提示詞',
                'setting_temperature': '溫度',
                'setting_max_tokens': '最大 Token 數',
                'setting_stream': '串流回應',

                'setting_tts_engine': 'TTS 引擎',
                'setting_tts_voice': '語音',
                'setting_tts_rate': '語速',
                'setting_tts_pitch': '音調',
                'setting_tts_volume': '音量',
                'setting_auto_speak': '自動朗讀 AI 回覆',

                'setting_stt_lang': '辨識語言',
                'setting_stt_continuous': '連續辨識',
                'setting_stt_interim': '顯示中間結果',
                'setting_voice_interrupt': '語音打斷（說話時停止 TTS）',
                'setting_interrupt_threshold': '打斷閾值',

                'setting_avatar_enabled': '顯示虛擬形象',
                'setting_avatar_color': '形象主色',
                'setting_avatar_size': '形象大小',
                'setting_avatar_style': '形象樣式',

                'setting_language': '介面語言',
                'setting_theme': '主題',
                'setting_font_size': '字體大小',
                'setting_send_on_enter': 'Enter 傳送',
                'clear_all_data': '清除所有資料',
                'clear_confirm': '這將刪除所有會話和設定，確定繼續嗎？',

                'context_rename': '重新命名',
                'context_export': '匯出',
                'context_delete': '刪除',

                'export_markdown': '匯出為 Markdown',
                'export_json': '匯出為 JSON',
                'exported': '會話已匯出！',

                'error_no_api_key': '請在設定中配置 API 金鑰。',
                'error_api_request': 'API 請求失敗，請檢查設定。',
                'error_network': '網路錯誤，請檢查連線。',
                'error_empty_message': '請輸入訊息內容。',

                'theme_dark': '深色',
                'theme_light': '淺色',
                'untitled': '無標題',
                'today': '今天',
                'yesterday': '昨天',
            },

            'ja': {
                'status_ready': '準備完了',
                'status_listening': '聴き取り中...',
                'status_speaking': '話し中...',
                'status_thinking': '考え中...',
                'status_error': 'エラー',
                'status_disconnected': '切断',

                'conversations': '会話リスト',
                'new_conversation': '新しい会話',
                'export_all': 'すべてエクスポート',
                'no_conversations': '会話はまだありません',
                'delete_confirm': 'この会話を削除しますか？',

                'welcome_title': 'VoicePilot Studioへようこそ',
                'welcome_desc': 'マイクボタンをクリックして音声会話を開始するか、下にメッセージを入力してください。',
                'type_message': 'メッセージを入力...',
                'send': '送信',
                'quick_intro': '自己紹介',
                'quick_capabilities': 'あなたの能力',
                'quick_joke': 'ジョークを言って',
                'copy_message': 'コピー',
                'copied': 'コピーしました！',

                'click_to_speak': 'クリックして話す',
                'listening': '聴き取り中...',
                'processing': '処理中...',
                'voice_interrupt': '音声を検出、停止中...',
                'stt_not_supported': 'このブラウザは音声認識をサポートしていません。',
                'stt_error': '音声認識エラーが発生しました。',
                'stt_no_speech': '音声が検出されませんでした。もう一度お試しください。',
                'stt_aborted': '音声認識が中止されました。',

                'avatar_idle': '待機中',
                'avatar_listening': '聴き取り中',
                'avatar_speaking': '話し中',
                'avatar_thinking': '考え中',

                'settings': '設定',
                'cancel': 'キャンセル',
                'save': '保存',
                'saved': '設定を保存しました！',
                'tab_llm': 'LLM API',
                'tab_tts': '音声合成',
                'tab_stt': '音声認識',
                'tab_avatar': 'アバター',
                'tab_general': '一般',

                'setting_llm_provider': 'LLM プロバイダー',
                'setting_api_key': 'API キー',
                'setting_api_base': 'API ベースURL',
                'setting_model': 'モデル',
                'setting_system_prompt': 'システムプロンプト',
                'setting_temperature': '温度',
                'setting_max_tokens': '最大トークン数',
                'setting_stream': 'ストリームレスポンス',

                'setting_tts_engine': 'TTS エンジン',
                'setting_tts_voice': '音声',
                'setting_tts_rate': '話速',
                'setting_tts_pitch': 'ピッチ',
                'setting_tts_volume': '音量',
                'setting_auto_speak': 'AI応答を自動読み上げ',

                'setting_stt_lang': '認識言語',
                'setting_stt_continuous': '連続認識',
                'setting_stt_interim': '中間結果を表示',
                'setting_voice_interrupt': '音声割り込み（話す時にTTSを停止）',
                'setting_interrupt_threshold': '割り込み閾値',

                'setting_avatar_enabled': 'アバターを表示',
                'setting_avatar_color': 'アバターのメインカラー',
                'setting_avatar_size': 'アバターサイズ',
                'setting_avatar_style': 'アバタースタイル',

                'setting_language': '表示言語',
                'setting_theme': 'テーマ',
                'setting_font_size': 'フォントサイズ',
                'setting_send_on_enter': 'Enterで送信',
                'clear_all_data': 'すべてのデータを消去',
                'clear_confirm': 'すべての会話と設定が削除されます。よろしいですか？',

                'context_rename': '名前変更',
                'context_export': 'エクスポート',
                'context_delete': '削除',

                'export_markdown': 'Markdownでエクスポート',
                'export_json': 'JSONでエクスポート',
                'exported': '会話をエクスポートしました！',

                'error_no_api_key': '設定でAPIキーを設定してください。',
                'error_api_request': 'APIリクエストに失敗しました。設定を確認してください。',
                'error_network': 'ネットワークエラー。接続を確認してください。',
                'error_empty_message': 'メッセージを入力してください。',

                'theme_dark': 'ダーク',
                'theme_light': 'ライト',
                'untitled': '無題',
                'today': '今日',
                'yesterday': '昨日',
            }
        };
    }

    /**
     * Loads the saved language preference from localStorage.
     * @returns {string} The saved language code or the default.
     * @private
     */
    _loadSavedLang() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && this._isValidLang(saved)) {
                return saved;
            }
        } catch (e) {
            // localStorage may be unavailable
        }
        return this.defaultLang;
    }

    /**
     * Checks if a language code is valid (has translations).
     * @param {string} lang - Language code to validate.
     * @returns {boolean}
     * @private
     */
    _isValidLang(lang) {
        return lang in this._buildTranslations();
    }

    /**
     * Gets the translation for a given key in the current language.
     * Falls back to English if the key is not found in the current language.
     * Falls back to the key itself if not found in English either.
     * @param {string} key - The translation key.
     * @param {Object} [params] - Optional interpolation parameters.
     * @returns {string} The translated string.
     */
    t(key, params = {}) {
        const langDict = this.translations[this.currentLang] || this.translations['en'];
        let text = langDict[key] || this.translations['en'][key] || key;

        // Interpolate parameters: {{param}}
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(params[param]));
        });

        return text;
    }

    /**
     * Gets the current language code.
     * @returns {string}
     */
    getLang() {
        return this.currentLang;
    }

    /**
     * Gets a list of all supported language codes.
     * @returns {string[]}
     */
    getSupportedLangs() {
        return Object.keys(this.translations);
    }

    /**
     * Gets the display name for a language code.
     * @param {string} lang - Language code.
     * @returns {string}
     */
    getLangName(lang) {
        const names = {
            'en': 'English',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            'ja': '日本語'
        };
        return names[lang] || lang;
    }

    /**
     * Switches the current language and applies translations to the DOM.
     * @param {string} lang - The new language code.
     */
    setLang(lang) {
        if (!this._isValidLang(lang)) {
            console.warn(`[I18n] Unsupported language: ${lang}`);
            return;
        }
        this.currentLang = lang;
        try {
            localStorage.setItem(this.storageKey, lang);
        } catch (e) {
            // Silently fail if localStorage is unavailable
        }
        this.applyTranslations();
        this._notifyListeners(lang);
    }

    /**
     * Applies translations to all DOM elements with data-i18n attributes.
     * Also updates placeholder attributes for elements with data-i18n-placeholder.
     */
    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = this.t(key);
            }
        });

        // Translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.placeholder = this.t(key);
            }
        });

        // Update document lang attribute
        const htmlLang = this.currentLang === 'zh-CN' || this.currentLang === 'zh-TW' ? 'zh' : this.currentLang;
        document.documentElement.lang = htmlLang;
    }

    /**
     * Registers a callback for language change events.
     * @param {Function} callback - Function called with the new language code.
     */
    onChange(callback) {
        if (typeof callback === 'function') {
            this._listeners.push(callback);
        }
    }

    /**
     * Removes a previously registered listener.
     * @param {Function} callback - The callback to remove.
     */
    offChange(callback) {
        this._listeners = this._listeners.filter(cb => cb !== callback);
    }

    /**
     * Notifies all registered listeners of a language change.
     * @param {string} lang - The new language code.
     * @private
     */
    _notifyListeners(lang) {
        this._listeners.forEach(cb => {
            try {
                cb(lang);
            } catch (e) {
                console.error('[I18n] Listener error:', e);
            }
        });
    }
}

// Export for use in other modules
window.I18n = I18n;
