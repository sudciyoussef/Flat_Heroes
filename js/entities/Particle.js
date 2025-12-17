import { Vector2D } from '../utils/Vector2D.js';

// Particle class for visual effects
export class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(vx, vy);
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = 800;
    }
    
    update(dt) {
        this.vel.y += this.gravity * dt;
        this.pos = this.pos.add(this.vel.multiply(dt));
        this.life -= dt;
        this.vel.x *= 0.98;
    }
    
    draw(ctx) {
        ctx.save();
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.floor(this.pos.x - this.size/2), 
            Math.floor(this.pos.y - this.size/2), 
            this.size, 
            this.size
        );
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}