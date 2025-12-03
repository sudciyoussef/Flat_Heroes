// VERSION 4 - Ajout des pièces à collecter

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }
    
    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }
    
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
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

class Coin {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.radius = 8;
        this.color = '#ffdd00';
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    update(dt) {
        // Simple update for now
    }
    
    draw(ctx) {
        ctx.save();
        
        const bobY = Math.sin(Date.now() * 0.003 + this.bobOffset) * 6;
        ctx.translate(this.pos.x, this.pos.y + bobY);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff8aa';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
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
        this.invincible = false;
        this.invincibleTimer = 0;
    }
    
    update(dt, keys, platforms) {
        this.vel.x = 0;
        if (keys['ArrowLeft'] || keys['a']) {
            this.vel.x = -this.moveSpeed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.vel.x = this.moveSpeed;
        }
        
        if (keys[' '] && this.onGround) {
            this.vel.y = this.jumpForce;
            this.onGround = false;
        }
        
        this.vel.y += this.gravity * dt;
        
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        
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
        
        this.pos.x = Math.max(this.size/2, Math.min(800 - this.size/2, this.pos.x));
        
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        if (this.pos.y > 700) {
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        
        if (this.invincible) {
            const flash = Math.floor(Date.now() / 100) % 2;
            if (flash === 0) {
                ctx.restore();
                return;
            }
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size);
        
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

class Enemy {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.size = 18;
        this.color = '#ff6600';
        this.speed = 120;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.changeTimer = 0;
        this.changeInterval = 1 + Math.random() * 2;
        
        this.vel = new Vector2D(
            Math.cos(this.wanderAngle) * this.speed,
            Math.sin(this.wanderAngle) * this.speed
        );
    }
    
    update(dt) {
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
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        
        if (this.vel.magnitude() > 10) {
            const angle = Math.atan2(this.vel.y, this.vel.x);
            ctx.rotate(angle);
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(-this.size/2, -this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.closePath();
        ctx.fill();
        
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

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = new Player(100, 200);
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.keys = {};
        this.score = 0;
        this.lives = 3;
        
        this.createPlatforms();
        this.spawnInitialEnemies();
        this.spawnInitialCoins();
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
    
    spawnInitialEnemies() {
        this.enemies.push(new Enemy(200, 150));
        this.enemies.push(new Enemy(600, 200));
    }
    
    spawnInitialCoins() {
        this.coins.push(new Coin(250, 200));
        this.coins.push(new Coin(400, 150));
        this.coins.push(new Coin(600, 220));
        
        this.coins.push(new Coin(200, 430));
        this.coins.push(new Coin(280, 430));
        this.coins.push(new Coin(560, 430));
        this.coins.push(new Coin(390, 210));
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
    
    checkCollisions() {
        // Coin collection
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (this.rectCollision(this.player.getBounds(), this.coins[i].getBounds())) {
                this.score += 50;
                this.coins.splice(i, 1);
            }
        }
        
        if (this.player.invincible) return;
        
        // Enemy collision
        const playerBounds = this.player.getBounds();
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.rectCollision(playerBounds, this.enemies[i].getBounds())) {
                this.playerHit();
                break;
            }
        }
    }
    
    rectCollision(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }
    
    playerHit() {
        this.lives--;
        this.player.invincible = true;
        this.player.invincibleTimer = 2;
        
        if (this.lives <= 0) {
            this.resetGame();
        } else {
            this.player.pos = new Vector2D(100, 200);
            this.player.vel = new Vector2D(0, 0);
        }
    }
    
    resetGame() {
        this.lives = 3;
        this.score = 0;
        this.player = new Player(100, 200);
        this.enemies = [];
        this.coins = [];
        this.spawnInitialEnemies();
        this.spawnInitialCoins();
    }
    
    update(dt) {
        const playerDied = this.player.update(dt, this.keys, this.platforms);
        if (playerDied) {
            this.playerHit();
        }
        
        this.enemies.forEach(enemy => enemy.update(dt));
        this.coins.forEach(coin => coin.update(dt));
        
        this.checkCollisions();
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, 800, 600);
        
        this.platforms.forEach(p => p.draw(this.ctx));
        this.coins.forEach(c => c.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
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