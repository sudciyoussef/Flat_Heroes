import { Vector2D } from '../utils/Vector2D.js';

// Player class - the character controlled by the player
export class Player {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.size = 20;
        this.color = '#00ff88';
        this.moveSpeed = 300;
        this.jumpForce = -550;
        this.gravity = 1200;
        this.maxFallSpeed = 600;
        this.onGround = false;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.trail = [];
    }
    
    update(dt, keys, platforms) {
        // Horizontal movement
        this.vel.x = 0;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vel.x = -this.moveSpeed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vel.x = this.moveSpeed;
        }
        
        // Jump
        if ((keys[' '] || keys['w'] || keys['W'] || keys['ArrowUp']) && this.jumpCount < this.maxJumps) {
            if (!this.jumpPressed) {
                this.vel.y = this.jumpForce;
                this.jumpCount++;
                this.onGround = false;
                this.jumpPressed = true;
            }
        } else {
            this.jumpPressed = false;
        }
        
        // Gravity
        if (!this.onGround) {
            this.vel.y += this.gravity * dt;
            this.vel.y = Math.min(this.vel.y, this.maxFallSpeed);
        }
        
        // Update position
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        
        // Platform collision
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.checkPlatformCollision(platform)) {
                this.onGround = true;
                this.jumpCount = 0;
            }
        });
        
        // Screen boundaries
        if (this.pos.x - this.size/2 < 0) {
            this.pos.x = this.size/2;
        }
        if (this.pos.x + this.size/2 > 800) {
            this.pos.x = 800 - this.size/2;
        }
        
        // Death if fall off
        if (this.pos.y > 700) {
            return true;
        }
        
        // Invincibility
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        // Trail effect
        if (Math.abs(this.vel.x) > 50 || Math.abs(this.vel.y) > 50) {
            this.trail.unshift({x: this.pos.x, y: this.pos.y, alpha: 1});
        }
        if (this.trail.length > 8) this.trail.pop();
        this.trail.forEach(t => t.alpha *= 0.85);
        
        return false;
    }
    
    checkPlatformCollision(platform) {
        const playerBounds = this.getBounds();
        const platBounds = platform.getBounds();
        
        if (this.vel.y < 0) return false;
        
        if (playerBounds.x + playerBounds.width > platBounds.x &&
            playerBounds.x < platBounds.x + platBounds.width) {
            
            const playerBottom = playerBounds.y + playerBounds.height;
            const prevPlayerBottom = playerBottom - this.vel.y * (1/60);
            
            if (prevPlayerBottom <= platBounds.y && playerBottom >= platBounds.y) {
                this.pos.y = platBounds.y - this.size/2;
                this.vel.y = 0;
                return true;
            }
        }
        return false;
    }
    
    draw(ctx) {
        // Draw trail
        this.trail.forEach((t, i) => {
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.4;
            ctx.fillStyle = this.color;
            const s = this.size * 0.8;
            ctx.fillRect(
                Math.floor(t.x - s/2), 
                Math.floor(t.y - s/2), 
                s, 
                s
            );
            ctx.restore();
        });
        
        ctx.save();
        
        // Flash when invincible
        if (this.invincible) {
            const flash = Math.floor(Date.now() / 100) % 2;
            if (flash === 0) {
                ctx.restore();
                return;
            }
        }
        
        ctx.translate(Math.floor(this.pos.x), Math.floor(this.pos.y));
        
        // Squash and stretch
        let scaleX = 1;
        let scaleY = 1;
        if (!this.onGround && this.vel.y > 100) {
            scaleY = 0.9;
            scaleX = 1.1;
        } else if (!this.onGround && this.vel.y < -100) {
            scaleY = 1.1;
            scaleX = 0.9;
        }
        
        ctx.scale(scaleX, scaleY);
        
        // Draw player
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Draw eye
        ctx.fillStyle = '#1a1a1a';
        const eyeOffset = this.vel.x > 0 ? 3 : this.vel.x < 0 ? -3 : 0;
        ctx.fillRect(eyeOffset - 2, -3, 4, 4);
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.pos.x - this.size/2,
            y: this.pos.y - this.size/2,
            width: this.size,
            height: this.size
        };
    }
}