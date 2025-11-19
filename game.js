// VERSION 1 - Player basique qui peut bouger

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }
    
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
}

class Player {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.size = 20;
        this.color = '#00ff88';
        this.moveSpeed = 300;
    }
    
    update(dt, keys) {
        // Movement
        this.vel.x = 0;
        if (keys['ArrowLeft'] || keys['a']) {
            this.vel.x = -this.moveSpeed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.vel.x = this.moveSpeed;
        }
        
        // Update position
        this.pos.x += this.vel.x * dt;
        
        // Keep in bounds
        this.pos.x = Math.max(this.size/2, Math.min(800 - this.size/2, this.pos.x));
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size);
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = new Player(400, 300);
        this.keys = {};
        this.score = 0;
        
        this.setupInput();
        this.lastTime = performance.now();
        this.run();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
    }
    
    update(dt) {
        this.player.update(dt, this.keys);
        document.getElementById('score').textContent = this.score;
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, 800, 600);
        
        this.player.draw(this.ctx);
    }
    
    run() {
        const currentTime = performance.now();
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(() => this.run());
    }
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});