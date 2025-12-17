import { Vector2D } from '../utils/Vector2D.js';

// Coin class - collectible gold coins
export class Coin {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.radius = 8;
        this.color = '#ffdd00';
        this.collected = false;
        this.rotation = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.sparkleTimer = 0;
    }
    
    update(dt) {
        this.rotation += dt * 4;
        this.sparkleTimer += dt;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Bobbing animation
        const bobY = Math.sin(Date.now() * 0.003 + this.bobOffset) * 6;
        ctx.translate(this.pos.x, this.pos.y + bobY);
        
        // Draw coin
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff8aa';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#cc9900';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Sparkle effect
        if (Math.sin(this.sparkleTimer * 5) > 0.8) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;
            const sparkleSize = this.radius * 0.4;
            ctx.beginPath();
            ctx.moveTo(-sparkleSize, 0);
            ctx.lineTo(sparkleSize, 0);
            ctx.moveTo(0, -sparkleSize);
            ctx.lineTo(0, sparkleSize);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.pos.x - this.radius,
            y: this.pos.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}