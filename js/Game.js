import { Vector2D } from './utils/Vector2D.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Coin } from './entities/Coin.js';
import { Platform } from './entities/Platform.js';
import { Particle } from './entities/Particle.js';

// Main game manager class
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.player = new Player(100, 200);
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        this.keys = {};
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 4;
        this.maxEnemies = 8;
        
        this.coinSpawnTimer = 0;
        this.coinSpawnInterval = 5;
        
        this.lastTime = performance.now();
        
        this.createPlatforms();
        this.spawnInitialEnemies();
        this.spawnInitialCoins();
        this.setupInput();
        this.run();
    }
    
    createPlatforms() {
        this.platforms = [];
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
        if (this.enemies.length >= this.maxEnemies) return;
        
        const chaserChance = Math.min(0.2 + (this.score / 1000) * 0.15, 0.5);
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
    
    spawnNewCoinGroup() {
        const numCoins = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numCoins; i++) {
            if (Math.random() > 0.5) {
                const x = 100 + Math.random() * 600;
                const y = 100 + Math.random() * 300;
                this.coins.push(new Coin(x, y));
            } else {
                const platform = this.platforms[1 + Math.floor(Math.random() * (this.platforms.length - 1))];
                const x = platform.x + 30 + Math.random() * (platform.width - 60);
                const y = platform.y - 20;
                this.coins.push(new Coin(x, y));
            }
        }
    }
    
    update(dt) {
        dt = Math.min(dt, 0.05);
        
        if (this.gameOver) {
            if (this.keys['r'] || this.keys['R']) {
                this.reset();
            }
            return;
        }
        
        // Spawn enemies
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.spawnNewEnemy();
            this.enemySpawnInterval = Math.max(2, 4 - (this.score / 1500));
            this.maxEnemies = Math.min(12, 8 + Math.floor(this.score / 600));
        }
        
        // Spawn coins
        this.coinSpawnTimer += dt;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnNewCoinGroup();
        }
        
        const playerDied = this.player.update(dt, this.keys, this.platforms);
        if (playerDied) {
            this.playerHit();
        }
        
        this.enemies.forEach(enemy => enemy.update(dt, this.player));
        this.enemies = this.enemies.filter(e => !e.dead);
        
        this.coins.forEach(coin => coin.update(dt));
        
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => !p.isDead());
        
        this.checkCollisions();
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    checkCollisions() {
        // Coin collection
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (this.rectCollision(this.player.getBounds(), this.coins[i].getBounds())) {
                this.score += 50;
                this.createCoinExplosion(this.coins[i].pos.x, this.coins[i].pos.y);
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
        
        // Stomp enemies
        if (this.player.vel.y > 0) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (this.rectCollision(playerBounds, enemy.getBounds())) {
                    if (this.player.pos.y < enemy.pos.y - 5) {
                        this.score += enemy.scoreValue;
                        this.player.vel.y = -350;
                        this.createExplosion(enemy.pos.x, enemy.pos.y, enemy.color);
                        this.enemies.splice(i, 1);
                    }
                }
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
        if (this.player.invincible) return;
        
        this.lives--;
        this.player.invincible = true;
        this.player.invincibleTimer = 2;
        this.createExplosion(this.player.pos.x, this.player.pos.y, '#ff3366');
        
        if (this.lives <= 0) {
            this.gameOver = true;
        } else {
            this.player.pos = new Vector2D(100, 200);
            this.player.vel = new Vector2D(0, 0);
        }
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 100;
            const size = Math.random() * 4 + 2;
            this.particles.push(new Particle(x, y, vx, vy, color, size, 0.8));
        }
    }
    
    createCoinExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 150 + 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 100;
            const size = Math.random() * 3 + 2;
            this.particles.push(new Particle(x, y, vx, vy, '#ffdd00', size, 0.6));
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.platforms.forEach(p => p.draw(this.ctx));
        this.coins.forEach(c => c.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.player.draw(this.ctx);
        
        if (this.gameOver) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ff3366';
        this.ctx.font = 'bold 72px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('GAME OVER', 400, 250);
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '28px Courier New';
        this.ctx.fillText('Final Score: ' + this.score, 400, 310);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('Press R to Restart', 400, 420);
        this.ctx.restore();
    }
}

    reset() {
        this.player = new Player(100, 200);
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 4;
        this.maxEnemies = 8;
        this.coinSpawnTimer = 0;
        this.createPlatforms();
        this.spawnInitialEnemies();
        this.spawnInitialCoins();
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