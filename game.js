// VERSION 5 - Ajout des Chasers + Amélioration des pièces

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
    
    divide(scalar) {
        if (scalar === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / scalar, this.y / scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return this.divide(mag);
    }
    
    limit(max) {
        if (this.magnitude() > max) {
            return this.normalize().multiply(max);
        }
        return new Vector2D(this.x, this.y);
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
        this.sparkleTimer = 0;
    }
    
    update(dt) {
        this.sparkleTimer += dt;
    }
    
    draw(ctx) {
        ctx.save();
        
        const bobY = Math.sin(Date.now() * 0.003 + this.bobOffset) * 6;
        ctx.translate(this.pos.x, this.pos.y + bobY);
        
        // Outer circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = '#fff8aa';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#cc9900';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Sparkle
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

class Player {
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
    }
    
    update(dt, keys, platforms) {
        this.vel.x = 0;
        if (keys['ArrowLeft'] || keys['a']) {
            this.vel.x = -this.moveSpeed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.vel.x = this.moveSpeed;
        }
        
        if ((keys[' '] || keys['w'] || keys['ArrowUp']) && this.jumpCount < this.maxJumps) {
            if (!this.jumpPressed) {
                this.vel.y = this.jumpForce;
                this.jumpCount++;
                this.onGround = false;
                this.jumpPressed = true;
            }
        } else {
            this.jumpPressed = false;
        }
        
        this.vel.y += this.gravity * dt;
        this.vel.y = Math.min(this.vel.y, this.maxFallSpeed);
        
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
                    this.jumpCount = 0;
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
    constructor(x, y, type) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.type = type;
        this.size = 18;
        
        if (type === 'wanderer') {
            this.color = '#ff6600';
            this.speed = 120;
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.changeTimer = 0;
            this.changeInterval = 1 + Math.random() * 2;
            
            this.vel = new Vector2D(
                Math.cos(this.wanderAngle) * this.speed,
                Math.sin(this.wanderAngle) * this.speed
            );
        } else if (type === 'chaser') {
            this.color = '#ff0066';
            this.speed = 150;
            this.maxSpeed = 200;
        }
    }
    
    update(dt, player) {
        if (this.type === 'wanderer') {
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
        } else if (this.type === 'chaser') {
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
        ctx.translate(this.pos.x, this.pos.y);
        
        if (this.vel.magnitude() > 10) {
            const angle = Math.atan2(this.vel.y, this.vel.x);
            ctx.rotate(angle);
        }
        
        ctx.fillStyle = this.color;
        
        if (this.type === 'wanderer') {
            ctx.beginPath();
            ctx.moveTo(this.size/2, 0);
            ctx.lineTo(-this.size/2, -this.size/2);
            ctx.lineTo(-this.size/2, this.size/2);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'chaser') {
            ctx.save();
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
            
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
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 5;
        
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
        this.platforms.push(new Platform(50, 340, 100, 20));
        this.platforms.push(new Platform(650, 340, 100, 20));
    }
    
    spawnInitialEnemies() {
        this.enemies.push(new Enemy(200, 150, 'wanderer'));
        this.enemies.push(new Enemy(600, 200, 'wanderer'));
    }
    
    spawnInitialCoins() {
        this.coins.push(new Coin(250, 200));
        this.coins.push(new Coin(400, 150));
        this.coins.push(new Coin(600, 220));
        
        this.coins.push(new Coin(200, 430));
        this.coins.push(new Coin(280, 430));
        this.coins.push(new Coin(560, 430));
        this.coins.push(new Coin(290, 320));
        this.coins.push(new Coin(500, 320));
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
    
    spawnNewEnemy() {
        if (this.enemies.length >= 8) return;
        
        const chaserChance = Math.min(0.3 + (this.score / 1000) * 0.1, 0.5);
        const type = Math.random() < chaserChance ? 'chaser' : 'wanderer';
        
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        if (side === 0) {
            x = Math.random() * 800;
            y = -30;
        } else if (side === 1) {
            x = 830;
            y = Math.random() * 600;
        } else if (side === 2) {
            x = Math.random() * 800;
            y = 630;
        } else {
            x = -30;
            y = Math.random() * 600;
        }
        
        this.enemies.push(new Enemy(x, y, type));
    }
    
    checkCollisions() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (this.rectCollision(this.player.getBounds(), this.coins[i].getBounds())) {
                this.score += 50;
                this.coins.splice(i, 1);
            }
        }
        
        if (this.player.invincible) return;
        
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
        
        this.enemies.forEach(enemy => enemy.update(dt, this.player));
        this.coins.forEach(coin => coin.update(dt));
        
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.spawnNewEnemy();
        }
        
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