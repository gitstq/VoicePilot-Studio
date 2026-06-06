/**
 * @fileoverview AvatarEngine - Virtual avatar animation engine for VoicePilot Studio.
 * Renders a minimalist animated character on a Canvas 2D context.
 * Supports idle breathing, listening pulse, speaking wave, and thinking spin animations.
 * Includes mouth sync, eye blink, and expression switching.
 */

'use strict';

/**
 * AvatarEngine renders and animates a virtual avatar character on a canvas.
 * The avatar is a minimalist circular face with expressive eyes and mouth.
 */
class AvatarEngine {
    /**
     * Avatar states enumeration.
     * @enum {string}
     */
    static States = {
        IDLE: 'idle',
        LISTENING: 'listening',
        SPEAKING: 'speaking',
        THINKING: 'thinking'
    };

    /**
     * Expression types enumeration.
     * @enum {string}
     */
    static Expressions = {
        NEUTRAL: 'neutral',
        HAPPY: 'happy',
        SURPRISED: 'surprised',
        THINKING: 'thinking'
    };

    /**
     * Creates an AvatarEngine instance.
     * @param {HTMLCanvasElement} canvas - The canvas element to render on.
     * @param {Object} [options] - Configuration options.
     * @param {string} [options.primaryColor='#6366f1'] - Primary color for the avatar.
     * @param {string} [options.secondaryColor='#818cf8'] - Secondary/accent color.
     * @param {string} [options.bgColor='transparent'] - Background color.
     * @param {string} [options.style='circle'] - Avatar shape ('circle'|'rounded').
     * @param {number} [options.size=280] - Canvas size in pixels.
     */
    constructor(canvas, options = {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('AvatarEngine requires a valid HTMLCanvasElement.');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.primaryColor = options.primaryColor || '#6366f1';
        this.secondaryColor = options.secondaryColor || '#818cf8';
        this.bgColor = options.bgColor || 'transparent';
        this.style = options.style || 'circle';

        this._state = AvatarEngine.States.IDLE;
        this._expression = AvatarEngine.Expressions.NEUTRAL;
        this._time = 0;
        this._animationId = null;
        this._isRunning = false;

        // Blink state
        this._blinkTimer = 0;
        this._blinkInterval = 3 + Math.random() * 2; // 3-5 seconds
        this._isBlinking = false;
        this._blinkDuration = 0.15;

        // Mouth animation
        this._mouthOpenness = 0; // 0 = closed, 1 = fully open
        this._targetMouthOpenness = 0;

        // Audio data for mouth sync
        this._audioLevel = 0;

        // Wave animation phase
        this._wavePhase = 0;

        // Thinking rotation
        this._thinkRotation = 0;

        // Breathing animation
        this._breathScale = 1;
        this._breathPhase = 0;

        // Pulse animation (listening)
        this._pulseScale = 1;
        this._pulsePhase = 0;

        // Particle effects
        this._particles = [];

        this._resize(options.size || 280);
    }

    /**
     * Resizes the canvas to the specified size.
     * @param {number} size - New canvas size in pixels.
     */
    _resize(size) {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        this.ctx.scale(dpr, dpr);
        this._size = size;
        this._center = size / 2;
        this._radius = size * 0.35;
    }

    /**
     * Gets the current avatar state.
     * @returns {string}
     */
    getState() {
        return this._state;
    }

    /**
     * Gets the current expression.
     * @returns {string}
     */
    getExpression() {
        return this._expression;
    }

    /**
     * Sets the avatar state, triggering the corresponding animation.
     * @param {string} state - One of AvatarEngine.States values.
     */
    setState(state) {
        if (Object.values(AvatarEngine.States).includes(state)) {
            this._state = state;
            this._particles = [];
        }
    }

    /**
     * Sets the facial expression.
     * @param {string} expression - One of AvatarEngine.Expressions values.
     */
    setExpression(expression) {
        if (Object.values(AvatarEngine.Expressions).includes(expression)) {
            this._expression = expression;
        }
    }

    /**
     * Updates the audio level for mouth sync animation.
     * Should be called with values from 0 to 1 during TTS playback.
     * @param {number} level - Audio amplitude level (0-1).
     */
    setAudioLevel(level) {
        this._audioLevel = Math.max(0, Math.min(1, level));
        if (this._state === AvatarEngine.States.SPEAKING) {
            this._targetMouthOpenness = this._audioLevel * 0.8;
        }
    }

    /**
     * Updates the primary color.
     * @param {string} color - CSS color string.
     */
    setColor(color) {
        this.primaryColor = color;
    }

    /**
     * Updates the avatar size and resizes the canvas.
     * @param {number} size - New size in pixels.
     */
    setSize(size) {
        this._resize(size);
    }

    /**
     * Starts the animation loop.
     */
    start() {
        if (this._isRunning) return;
        this._isRunning = true;
        this._lastTimestamp = performance.now();
        this._animate();
    }

    /**
     * Stops the animation loop.
     */
    stop() {
        this._isRunning = false;
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
    }

    /**
     * Main animation loop.
     * @private
     */
    _animate() {
        if (!this._isRunning) return;

        const now = performance.now();
        const dt = (now - this._lastTimestamp) / 1000; // Delta time in seconds
        this._lastTimestamp = now;
        this._time += dt;

        this._update(dt);
        this._draw();

        this._animationId = requestAnimationFrame(() => this._animate());
    }

    /**
     * Updates animation state based on delta time.
     * @param {number} dt - Delta time in seconds.
     * @private
     */
    _update(dt) {
        // Update blink timer
        this._blinkTimer += dt;
        if (this._blinkTimer >= this._blinkInterval && !this._isBlinking) {
            this._isBlinking = true;
            this._blinkTimer = 0;
        }
        if (this._isBlinking && this._blinkTimer >= this._blinkDuration) {
            this._isBlinking = false;
            this._blinkTimer = 0;
            this._blinkInterval = 3 + Math.random() * 2;
        }

        // Smooth mouth animation
        this._mouthOpenness += (this._targetMouthOpenness - this._mouthOpenness) * Math.min(1, dt * 12);

        // State-specific updates
        switch (this._state) {
            case AvatarEngine.States.IDLE:
                this._updateIdle(dt);
                break;
            case AvatarEngine.States.LISTENING:
                this._updateListening(dt);
                break;
            case AvatarEngine.States.SPEAKING:
                this._updateSpeaking(dt);
                break;
            case AvatarEngine.States.THINKING:
                this._updateThinking(dt);
                break;
        }

        // Update particles
        this._updateParticles(dt);
    }

    /**
     * Updates idle state animation (breathing).
     * @param {number} dt - Delta time.
     * @private
     */
    _updateIdle(dt) {
        this._breathPhase += dt * 1.5;
        this._breathScale = 1 + Math.sin(this._breathPhase) * 0.02;
        this._pulseScale = 1;
        this._targetMouthOpenness = 0;
        this._thinkRotation *= 0.95;
    }

    /**
     * Updates listening state animation (pulse).
     * @param {number} dt - Delta time.
     * @private
     */
    _updateListening(dt) {
        this._pulsePhase += dt * 3;
        this._pulseScale = 1 + Math.sin(this._pulsePhase) * 0.04;
        this._breathScale = this._pulseScale;
        this._targetMouthOpenness = 0.1;

        // Spawn listening particles occasionally
        if (Math.random() < dt * 2) {
            this._spawnParticle('listen');
        }
    }

    /**
     * Updates speaking state animation (wave).
     * @param {number} dt - Delta time.
     * @private
     */
    _updateSpeaking(dt) {
        this._wavePhase += dt * 8;
        this._breathScale = 1 + Math.sin(this._wavePhase * 0.5) * 0.015;
        this._pulseScale = 1;
        this._targetMouthOpenness = this._audioLevel * 0.8;

        // Spawn speaking particles
        if (Math.random() < dt * 3) {
            this._spawnParticle('speak');
        }
    }

    /**
     * Updates thinking state animation (rotation).
     * @param {number} dt - Delta time.
     * @private
     */
    _updateThinking(dt) {
        this._thinkRotation += dt * 1.2;
        this._breathScale = 1 + Math.sin(this._time * 2) * 0.01;
        this._pulseScale = 1;
        this._targetMouthOpenness = 0.05;

        // Spawn thinking particles
        if (Math.random() < dt * 1.5) {
            this._spawnParticle('think');
        }
    }

    /**
     * Spawns a particle effect.
     * @param {string} type - Particle type ('listen'|'speak'|'think').
     * @private
     */
    _spawnParticle(type) {
        const angle = Math.random() * Math.PI * 2;
        const dist = this._radius + 10;
        this._particles.push({
            x: this._center + Math.cos(angle) * dist,
            y: this._center + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (20 + Math.random() * 20),
            vy: Math.sin(angle) * (20 + Math.random() * 20),
            life: 1,
            maxLife: 0.8 + Math.random() * 0.4,
            size: 2 + Math.random() * 3,
            type
        });
    }

    /**
     * Updates all active particles.
     * @param {number} dt - Delta time.
     * @private
     */
    _updateParticles(dt) {
        for (let i = this._particles.length - 1; i >= 0; i--) {
            const p = this._particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt / p.maxLife;
            if (p.life <= 0) {
                this._particles.splice(i, 1);
            }
        }
    }

    /**
     * Draws the complete avatar frame.
     * @private
     */
    _draw() {
        const ctx = this.ctx;
        const size = this._size;
        const center = this._center;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw background glow
        this._drawBackgroundGlow(ctx, center);

        // Save context for transformations
        ctx.save();
        ctx.translate(center, center);
        ctx.scale(this._breathScale, this._breathScale);

        // Draw body
        this._drawBody(ctx);

        // Draw face features
        this._drawEyes(ctx);
        this._drawMouth(ctx);

        // Restore context
        ctx.restore();

        // Draw particles (outside the body transform)
        this._drawParticles(ctx);
    }

    /**
     * Draws the background glow effect.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} center - Center coordinate.
     * @private
     */
    _drawBackgroundGlow(ctx, center) {
        const glowRadius = this._radius * 1.5;
        const gradient = ctx.createRadialGradient(
            center, center, this._radius * 0.5,
            center, center, glowRadius
        );

        let alpha = 0.08;
        if (this._state === AvatarEngine.States.LISTENING) alpha = 0.15;
        if (this._state === AvatarEngine.States.SPEAKING) alpha = 0.12;
        if (this._state === AvatarEngine.States.THINKING) alpha = 0.1;

        gradient.addColorStop(0, this._colorWithAlpha(this.primaryColor, alpha));
        gradient.addColorStop(1, this._colorWithAlpha(this.primaryColor, 0));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this._size, this._size);
    }

    /**
     * Draws the avatar body (main circle/rounded shape).
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */
    _drawBody(ctx) {
        const r = this._radius;

        // Outer ring (subtle)
        ctx.beginPath();
        ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = this._colorWithAlpha(this.primaryColor, 0.2);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Main body fill
        const bodyGradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        bodyGradient.addColorStop(0, this._colorWithAlpha(this.primaryColor, 0.25));
        bodyGradient.addColorStop(1, this._colorWithAlpha(this.primaryColor, 0.1));

        ctx.beginPath();
        if (this.style === 'rounded') {
            this._drawRoundedRect(ctx, -r, -r, r * 2, r * 2, r * 0.2);
        } else {
            ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = bodyGradient;
        ctx.fill();

        // Border
        ctx.beginPath();
        if (this.style === 'rounded') {
            this._drawRoundedRect(ctx, -r, -r, r * 2, r * 2, r * 0.2);
        } else {
            ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.strokeStyle = this._colorWithAlpha(this.primaryColor, 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draws the eyes.
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */
    _drawEyes(ctx) {
        const eyeSpacing = this._radius * 0.35;
        const eyeY = -this._radius * 0.1;
        const eyeRadius = this._radius * 0.1;

        // Apply thinking rotation to eyes
        if (this._state === AvatarEngine.States.THINKING) {
            const offsetX = Math.sin(this._thinkRotation) * 3;
            this._drawSingleEye(ctx, -eyeSpacing + offsetX, eyeY, eyeRadius);
            this._drawSingleEye(ctx, eyeSpacing + offsetX, eyeY, eyeRadius);
        } else {
            this._drawSingleEye(ctx, -eyeSpacing, eyeY, eyeRadius);
            this._drawSingleEye(ctx, eyeSpacing, eyeY, eyeRadius);
        }
    }

    /**
     * Draws a single eye with blink animation.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - Eye center X.
     * @param {number} y - Eye center Y.
     * @param {number} r - Eye radius.
     * @private
     */
    _drawSingleEye(ctx, x, y, r) {
        if (this._isBlinking) {
            // Blink: draw a horizontal line instead
            ctx.beginPath();
            ctx.moveTo(x - r, y);
            ctx.lineTo(x + r, y);
            ctx.strokeStyle = this.primaryColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
            return;
        }

        // Eye expression variations
        switch (this._expression) {
            case AvatarEngine.Expressions.HAPPY:
                // Happy: slightly squinted (arc)
                ctx.beginPath();
                ctx.arc(x, y + r * 0.3, r, Math.PI, 0);
                ctx.strokeStyle = this.primaryColor;
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.stroke();
                break;

            case AvatarEngine.Expressions.SURPRISED:
                // Surprised: larger eyes
                ctx.beginPath();
                ctx.arc(x, y, r * 1.3, 0, Math.PI * 2);
                ctx.fillStyle = this.primaryColor;
                ctx.fill();
                // Inner highlight
                ctx.beginPath();
                ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fill();
                break;

            case AvatarEngine.Expressions.THINKING:
                // Thinking: one eye slightly smaller, looking up
                const scale = x < 0 ? 0.8 : 1;
                ctx.beginPath();
                ctx.arc(x, y - r * 0.2, r * scale, 0, Math.PI * 2);
                ctx.fillStyle = this.primaryColor;
                ctx.fill();
                break;

            default:
                // Neutral: round eyes
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = this.primaryColor;
                ctx.fill();
                // Inner highlight
                ctx.beginPath();
                ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fill();
                break;
        }
    }

    /**
     * Draws the mouth with animation.
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */
    _drawMouth(ctx) {
        const mouthY = this._radius * 0.3;
        const mouthWidth = this._radius * 0.3;
        const openness = this._mouthOpenness;

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (this._expression) {
            case AvatarEngine.Expressions.HAPPY:
                // Happy smile
                ctx.moveTo(-mouthWidth, mouthY);
                ctx.quadraticCurveTo(0, mouthY + mouthWidth * 0.8 + openness * 10, mouthWidth, mouthY);
                if (openness > 0.1) {
                    ctx.quadraticCurveTo(0, mouthY + mouthWidth * 0.3, -mouthWidth, mouthY);
                    ctx.fillStyle = this._colorWithAlpha(this.primaryColor, 0.3);
                    ctx.fill();
                }
                ctx.strokeStyle = this.primaryColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                break;

            case AvatarEngine.Expressions.SURPRISED:
                // Surprised: O shape
                const ovalH = Math.max(4, openness * 15 + 5);
                ctx.ellipse(0, mouthY + 5, mouthWidth * 0.4, ovalH, 0, 0, Math.PI * 2);
                ctx.strokeStyle = this.primaryColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                if (openness > 0.2) {
                    ctx.fillStyle = this._colorWithAlpha(this.primaryColor, 0.2);
                    ctx.fill();
                }
                break;

            case AvatarEngine.Expressions.THINKING:
                // Thinking: wavy line
                ctx.moveTo(-mouthWidth * 0.6, mouthY);
                ctx.bezierCurveTo(
                    -mouthWidth * 0.2, mouthY - 5,
                    mouthWidth * 0.2, mouthY + 5,
                    mouthWidth * 0.6, mouthY
                );
                ctx.strokeStyle = this.primaryColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            default:
                // Neutral: simple curve that opens when speaking
                if (openness > 0.05) {
                    // Open mouth
                    ctx.ellipse(0, mouthY + 2, mouthWidth * 0.5, Math.max(2, openness * 12), 0, 0, Math.PI * 2);
                    ctx.fillStyle = this._colorWithAlpha(this.primaryColor, 0.25);
                    ctx.fill();
                    ctx.strokeStyle = this.primaryColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    // Closed mouth - slight smile
                    ctx.moveTo(-mouthWidth * 0.5, mouthY);
                    ctx.quadraticCurveTo(0, mouthY + 6, mouthWidth * 0.5, mouthY);
                    ctx.strokeStyle = this.primaryColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                break;
        }
    }

    /**
     * Draws all active particles.
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */
    _drawParticles(ctx) {
        for (const p of this._particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = this._colorWithAlpha(this.primaryColor, p.life * 0.5);
            ctx.fill();
        }
    }

    /**
     * Draws a rounded rectangle path.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {number} w - Width.
     * @param {number} h - Height.
     * @param {number} r - Border radius.
     * @private
     */
    _drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /**
     * Converts a hex color to rgba with specified alpha.
     * @param {string} hex - Hex color string (e.g., '#6366f1').
     * @param {number} alpha - Alpha value (0-1).
     * @returns {string} RGBA color string.
     * @private
     */
    _colorWithAlpha(hex, alpha) {
        // Parse hex color
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
}

// Export for use in other modules
window.AvatarEngine = AvatarEngine;
