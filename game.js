// VERSION 2 - Ajout plateformes, gravité et saut

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

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Player {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.size = 20;
        this.color = '#00ff88';
        this.moveSpeed = 300;
        this.jumpForce = -550;
        this.gravity = 1200;
        this.onGround = false;
    }
    
    update(dt, keys, platforms) {
        // Horizontal movement
        this.vel.x = 0;
        if (keys['ArrowLeft'] || keys['a']) {
            this.vel.x = -this.moveSpeed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.vel.x = this.moveSpeed;
        }
        
        // Jump
        if (keys[' '] && this.onGround) {
            this.vel.y = this.jumpForce;
            this.onGround = false;
        }
        
        // Apply gravity
        this.vel.y += this.gravity * dt;
        
        // Update position
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        
        // Platform collision
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.vel.y > 0 &&
                this.pos.x + this.size/2 > platform.x &&
                this.pos.x - this.size/2 < platform.x + platform.width) {
                
                const playerBottom = this.pos.y + this.size/2;
                if (playerBottom > platform.y && playerBottom < platform.y + 20) {
                    this.pos.y = platform.y - this.size/2;
                    this.vel.y = 0;
                    this.onGround = true;
                }
            }
        });
        
        // Boundaries
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
        this.player = new Player(100, 200);
        this.platforms = [];
        this.keys = {};
        this.score = 0;
        
        this.createPlatforms();
        this.setupInput();
        this.lastTime = performance.now();
        this.run();
    }
    
    createPlatforms() {
        this.platforms.push(new Platform(0, 560, 800, 40));
        this.platforms.push(new Platform(150, 450, 150, 20));
        this.platforms.push(new Platform(500, 450, 150, 20));
        this.platforms.push(new Platform(250, 340, 120, 20));
        this.platforms.push(new Platform(430, 340, 120, 20));
        this.platforms.push(new Platform(350, 230, 100, 20));
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
        this.player.update(dt, this.keys, this.platforms);
        document.getElementById('score').textContent = this.score;
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, 800, 600);
        
        this.platforms.forEach(p => p.draw(this.ctx));
        this.player.draw(this.ctx);
    }
    
    run() {
        const currentTime = performance.now();
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(Math.min(dt, 0.05));
        this.draw();
        
        requestAnimationFrame(() => this.run());
    }
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});