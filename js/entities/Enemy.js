import { Vector2D } from '../utils/Vector2D.js';

// Enemy class - flying enemies (wanderer or chaser)
export class Enemy {
    constructor(x, y, type) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.type = type;
        this.size = 18;
        this.dead = false;
        
        if (type === 'wanderer') {
            this.color = '#ff6600';
            this.speed = 120;
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.changeTimer = 0;
            this.changeInterval = 1 + Math.random() * 2;
            this.scoreValue = 100;
            
            this.vel = new Vector2D(
                Math.cos(this.wanderAngle) * this.speed,
                Math.sin(this.wanderAngle) * this.speed
            );
        } else if (type === 'chaser') {
            this.color = '#ff0066';
            this.speed = 150;
            this.maxSpeed = 200;
            this.scoreValue = 200;
        }
    }
    
    update(dt, player) {
        if (this.type === 'wanderer') {
            // Random movement
            this.changeTimer += dt;
            if (this.changeTimer >= this.changeInterval) {
                this.changeTimer = 0;
                this.changeInterval = 1 + Math.random() * 2;
                
                this.wanderAngle = Math.random() * Math.PI * 2;
                this.vel = new Vector2D(
                    Math.cos(this.wanderAngle) * this.speed,
                    Math.sin(this.wanderAngle) * this.speed
                );
            }
            
            this.pos = this.pos.add(this.vel.multiply(dt));
            
            // Bounce off edges
            if (this.pos.x < 30) {
                this.pos.x = 30;
                this.vel.x = Math.abs(this.vel.x);
            }
            if (this.pos.x > 770) {
                this.pos.x = 770;
                this.vel.x = -Math.abs(this.vel.x);
            }
            if (this.pos.y < 30) {
                this.pos.y = 30;
                this.vel.y = Math.abs(this.vel.y);
            }
            if (this.pos.y > 570) {
                this.pos.y = 570;
                this.vel.y = -Math.abs(this.vel.y);
            }
            
        } else if (this.type === 'chaser') {
            // Chase player
            const toPlayer = player.pos.subtract(this.pos);
            const distance = toPlayer.magnitude();
            
            if (distance > 10) {
                const desired = toPlayer.normalize().multiply(this.speed);
                const steer = desired.subtract(this.vel);
                
                this.vel = this.vel.add(steer.multiply(dt * 3));
                this.vel = this.vel.limit(this.maxSpeed);
            }
            
            this.pos = this.pos.add(this.vel.multiply(dt));
            
            this.pos.x = Math.max(30, Math.min(770, this.pos.x));
            this.pos.y = Math.max(30, Math.min(570, this.pos.y));
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(Math.floor(this.pos.x), Math.floor(this.pos.y));
        
        if (this.vel.magnitude() > 10) {
            const angle = Math.atan2(this.vel.y, this.vel.x);
            ctx.rotate(angle);
        }
        
        ctx.fillStyle = this.color;
        
        if (this.type === 'wanderer') {
            // Draw triangle
            ctx.beginPath();
            ctx.moveTo(this.size/2, 0);
            ctx.lineTo(-this.size/2, -this.size/2);
            ctx.lineTo(-this.size/2, this.size/2);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'chaser') {
            // Draw diamond
            ctx.save();
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
            
            // Draw arrow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(this.size/2 - 2, 0);
            ctx.lineTo(this.size/2 - 8, -4);
            ctx.lineTo(this.size/2 - 8, 4);
            ctx.closePath();
            ctx.fill();
        }
        
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