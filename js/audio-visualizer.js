/**
 * @fileoverview AudioVisualizer - Audio visualization and analysis module for VoicePilot Studio.
 * Uses Web Audio API for real-time frequency spectrum analysis, volume detection,
 * and waveform rendering. Supports voice interrupt detection.
 */

'use strict';

/**
 * AudioVisualizer provides real-time audio analysis and visualization.
 * It uses the Web Audio API to analyze microphone input or TTS output,
 * rendering frequency data on a canvas and detecting volume levels.
 */
class AudioVisualizer {
    /**
     * Creates an AudioVisualizer instance.
     * @param {HTMLCanvasElement} canvas - The canvas element for waveform rendering.
     * @param {Object} [options] - Configuration options.
     * @param {number} [options.fftSize=256] - FFT size for frequency analysis (power of 2).
     * @param {number} [options.smoothingTimeConstant=0.8] - Smoothing constant for frequency data.
     * @param {string} [options.waveColor='#6366f1'] - Color for the waveform visualization.
     * @param {number} [options.interruptThreshold=0.05] - Volume threshold for voice interrupt (0-1).
     * @param {number} [options.interruptDuration=300] - Minimum duration (ms) above threshold to trigger interrupt.
     */
    constructor(canvas, options = {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('AudioVisualizer requires a valid HTMLCanvasElement.');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fftSize = options.fftSize || 256;
        this.smoothingTimeConstant = options.smoothingTimeConstant || 0.8;
        this.waveColor = options.waveColor || '#6366f1';
        this.interruptThreshold = options.interruptThreshold || 0.05;
        this.interruptDuration = options.interruptDuration || 300;

        /** @type {AudioContext|null} */
        this._audioContext = null;

        /** @type {AnalyserNode|null} */
        this._analyser = null;

        /** @type {MediaStream|null} */
        this._stream = null;

        /** @type {MediaStreamSource|null} */
        this._source = null;

        /** @type {Uint8Array|null} */
        this._frequencyData = null;

        /** @type {Uint8Array|null} */
        this._timeDomainData = null;

        /** @type {boolean} */
        this._isActive = false;

        /** @type {number} */
        this._animationId = null;

        /** @type {number} Current volume level (0-1) */
        this._volume = 0;

        /** @type {number} Smoothed volume for display */
        this._smoothVolume = 0;

        /** @type {number} Timestamp when volume first exceeded threshold */
        this._interruptStart = 0;

        /** @type {boolean} Whether interrupt has been triggered */
        this._interruptTriggered = false;

        /** @type {Function|null} Callback when voice interrupt is detected */
        this._onInterrupt = null;

        /** @type {Function|null} Callback with volume updates */
        this._onVolumeChange = null;

        // Setup canvas
        this._setupCanvas();
    }

    /**
     * Sets up the canvas dimensions for proper rendering.
     * @private
     */
    _setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this._displayWidth = rect.width;
        this._displayHeight = rect.height;
    }

    /**
     * Sets the callback for voice interrupt detection.
     * @param {Function} callback - Called when voice interrupt is detected.
     */
    onInterrupt(callback) {
        this._onInterrupt = callback;
    }

    /**
     * Sets the callback for volume change updates.
     * @param {Function} callback - Called with current volume (0-1).
     */
    onVolumeChange(callback) {
        this._onVolumeChange = callback;
    }

    /**
     * Updates the interrupt threshold.
     * @param {number} threshold - New threshold value (0-1).
     */
    setInterruptThreshold(threshold) {
        this.interruptThreshold = Math.max(0.01, Math.min(1, threshold));
    }

    /**
     * Updates the waveform color.
     * @param {string} color - CSS color string.
     */
    setWaveColor(color) {
        this.waveColor = color;
    }

    /**
     * Gets the current volume level.
     * @returns {number} Volume level (0-1).
     */
    getVolume() {
        return this._smoothVolume;
    }

    /**
     * Gets the raw (unsmoothed) volume level.
     * @returns {number} Raw volume level (0-1).
     */
    getRawVolume() {
        return this._volume;
    }

    /**
     * Initializes the audio context and analyser node.
     * @private
     * @returns {Promise<boolean>} Whether initialization was successful.
     */
    async _initAudioContext() {
        try {
            if (!this._audioContext) {
                this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (this._audioContext.state === 'suspended') {
                await this._audioContext.resume();
            }

            if (!this._analyser) {
                this._analyser = this._audioContext.createAnalyser();
                this._analyser.fftSize = this.fftSize;
                this._analyser.smoothingTimeConstant = this.smoothingTimeConstant;

                const bufferLength = this._analyser.frequencyBinCount;
                this._frequencyData = new Uint8Array(bufferLength);
                this._timeDomainData = new Uint8Array(bufferLength);
            }

            return true;
        } catch (error) {
            console.error('[AudioVisualizer] Failed to init AudioContext:', error);
            return false;
        }
    }

    /**
     * Connects to a MediaStream for analysis (e.g., microphone input).
     * @param {MediaStream} stream - The media stream to analyze.
     * @returns {Promise<boolean>}
     */
    async connectStream(stream) {
        const initialized = await this._initAudioContext();
        if (!initialized) return false;

        try {
            // Disconnect previous source if any
            if (this._source) {
                this._source.disconnect();
            }

            this._stream = stream;
            this._source = this._audioContext.createMediaStreamSource(stream);
            this._source.connect(this._analyser);

            this._isActive = true;
            this._interruptTriggered = false;
            this._interruptStart = 0;
            this._startVisualization();
            return true;
        } catch (error) {
            console.error('[AudioVisualizer] Failed to connect stream:', error);
            return false;
        }
    }

    /**
     * Connects to the audio output for TTS visualization.
     * Creates a MediaElementSource from an audio element.
     * @param {HTMLAudioElement} audioElement - The audio element playing TTS.
     * @returns {Promise<boolean>}
     */
    async connectAudioElement(audioElement) {
        const initialized = await this._initAudioContext();
        if (!initialized) return false;

        try {
            if (this._source) {
                this._source.disconnect();
            }

            this._source = this._audioContext.createMediaElementSource(audioElement);
            this._source.connect(this._analyser);
            // Also connect to destination so we can hear it
            this._analyser.connect(this._audioContext.destination);

            this._isActive = true;
            this._startVisualization();
            return true;
        } catch (error) {
            console.error('[AudioVisualizer] Failed to connect audio element:', error);
            return false;
        }
    }

    /**
     * Starts the visualization loop.
     * @private
     */
    _startVisualization() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
        this._visualize();
    }

    /**
     * Main visualization loop. Reads frequency data and renders waveform.
     * Also checks for voice interrupt conditions.
     * @private
     */
    _visualize() {
        if (!this._isActive || !this._analyser) return;

        this._analyser.getByteFrequencyData(this._frequencyData);
        this._analyser.getByteTimeDomainData(this._timeDomainData);

        // Calculate volume (RMS of frequency data)
        this._volume = this._calculateVolume();

        // Smooth the volume for display
        this._smoothVolume += (this._volume - this._smoothVolume) * 0.3;

        // Check for voice interrupt
        this._checkInterrupt();

        // Notify volume change
        if (this._onVolumeChange) {
            this._onVolumeChange(this._smoothVolume);
        }

        // Draw visualization
        this._drawWaveform();

        this._animationId = requestAnimationFrame(() => this._visualize());
    }

    /**
     * Calculates the current volume level from frequency data.
     * Uses RMS (Root Mean Square) of the frequency amplitudes.
     * @returns {number} Volume level (0-1).
     * @private
     */
    _calculateVolume() {
        if (!this._frequencyData) return 0;

        let sum = 0;
        const len = this._frequencyData.length;
        for (let i = 0; i < len; i++) {
            const val = this._frequencyData[i] / 255;
            sum += val * val;
        }
        return Math.sqrt(sum / len);
    }

    /**
     * Checks if the volume exceeds the interrupt threshold for long enough
     * to trigger a voice interrupt.
     * @private
     */
    _checkInterrupt() {
        if (this._interruptTriggered) return;

        const now = performance.now();

        if (this._volume > this.interruptThreshold) {
            if (this._interruptStart === 0) {
                this._interruptStart = now;
            } else if (now - this._interruptStart >= this.interruptDuration) {
                this._interruptTriggered = true;
                if (this._onInterrupt) {
                    this._onInterrupt(this._volume);
                }
            }
        } else {
            this._interruptStart = 0;
        }
    }

    /**
     * Resets the interrupt state, allowing new interrupts to be detected.
     */
    resetInterrupt() {
        this._interruptTriggered = false;
        this._interruptStart = 0;
    }

    /**
     * Draws the frequency waveform on the canvas.
     * @private
     */
    _drawWaveform() {
        const ctx = this.ctx;
        const width = this._displayWidth;
        const height = this._displayHeight;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!this._frequencyData || this._smoothVolume < 0.005) {
            // Draw a flat line when silent
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.strokeStyle = this._colorWithAlpha(this.waveColor, 0.2);
            ctx.lineWidth = 1;
            ctx.stroke();
            return;
        }

        const bufferLength = this._frequencyData.length;
        const barWidth = Math.max(1, (width / bufferLength) * 2);
        const gap = Math.max(0.5, barWidth * 0.3);

        // Draw frequency bars
        for (let i = 0; i < bufferLength; i++) {
            const value = this._frequencyData[i] / 255;
            const barHeight = value * height * 0.8;
            const x = (i / bufferLength) * width;

            // Color gradient based on frequency
            const alpha = 0.3 + value * 0.7;
            ctx.fillStyle = this._colorWithAlpha(this.waveColor, alpha);

            // Draw bar from center (mirrored)
            const centerY = height / 2;
            ctx.fillRect(
                x,
                centerY - barHeight / 2,
                Math.max(1, barWidth - gap),
                barHeight
            );
        }

        // Draw a subtle center line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = this._colorWithAlpha(this.waveColor, 0.15);
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    /**
     * Draws a time-domain waveform (oscilloscope style).
     * Alternative visualization method.
     * @private
     */
    _drawTimeDomain() {
        const ctx = this.ctx;
        const width = this._displayWidth;
        const height = this._displayHeight;

        ctx.clearRect(0, 0, width, height);

        if (!this._timeDomainData) return;

        ctx.beginPath();
        const bufferLength = this._timeDomainData.length;
        const sliceWidth = width / bufferLength;

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = this._timeDomainData[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.strokeStyle = this.waveColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Converts a hex color to rgba with specified alpha.
     * @param {string} hex - Hex color string.
     * @param {number} alpha - Alpha value (0-1).
     * @returns {string} RGBA color string.
     * @private
     */
    _colorWithAlpha(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    }

    /**
     * Stops visualization and disconnects the audio source.
     */
    stop() {
        this._isActive = false;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        if (this._source) {
            try {
                this._source.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }
            this._source = null;
        }

        this._stream = null;
        this._volume = 0;
        this._smoothVolume = 0;
        this._interruptTriggered = false;
        this._interruptStart = 0;

        // Clear canvas
        this.ctx.clearRect(0, 0, this._displayWidth, this._displayHeight);

        // Draw flat line
        this.ctx.beginPath();
        this.ctx.moveTo(0, this._displayHeight / 2);
        this.ctx.lineTo(this._displayWidth, this._displayHeight / 2);
        this.ctx.strokeStyle = this._colorWithAlpha(this.waveColor, 0.2);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    /**
     * Completely destroys the visualizer and releases all resources.
     */
    destroy() {
        this.stop();

        if (this._analyser) {
            try {
                this._analyser.disconnect();
            } catch (e) {
                // Ignore
            }
            this._analyser = null;
        }

        if (this._audioContext) {
            try {
                this._audioContext.close();
            } catch (e) {
                // Ignore
            }
            this._audioContext = null;
        }

        this._frequencyData = null;
        this._timeDomainData = null;
    }

    /**
     * Checks if the visualizer is currently active.
     * @returns {boolean}
     */
    isActive() {
        return this._isActive;
    }
}

// Export for use in other modules
window.AudioVisualizer = AudioVisualizer;
