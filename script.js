
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        
        // UI Elements
        const startScreen = document.getElementById('start-screen');
        const settingsScreen = document.getElementById('settings-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const levelUpScreen = document.getElementById('level-up-screen');
        const hud = document.getElementById('hud');
        
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const livesElement = document.getElementById('lives');
        const finalScoreElement = document.getElementById('final-score');
        
        const startBtn = document.getElementById('start-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        const restartBtn = document.getElementById('restart-btn');
        const styleOptionsContainer = document.getElementById('style-options');
        const colorOptionsContainer = document.getElementById('color-options');

        // Game State
        let gameState = 'START'; // START, SETTINGS, PLAYING, GAMEOVER, LEVELUP
        let animationId;
        let currentLevel = 1;
        
        // Dimensions
        let width, height;
        
        // Mouse tracking
        const mouse = { x: 0, y: 0 };
        
        // Palettes & Styles
        const selectableColors = [
            '#fbbf24', // Amber
            '#ef4444', // Red
            '#ec4899', // Pink
            '#a855f7', // Purple
            '#3b82f6', // Blue
            '#0ea5e9', // Sky
            '#10b981', // Emerald
            '#ffffff'  // White
        ];

        const colors = [
            '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', 
            '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', 
            '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'
        ];

        const styles = ['Sun', 'Neon', 'Classic', 'Target'];

        // Player config
        let baseScale = 1;
        let PLAYER_INITIAL_RADIUS = 20;
        let LEVEL_UP_RADIUS = 250;
        const INITIAL_LIVES = 3;
        
        let player = {
            x: 0,
            y: 0,
            radius: PLAYER_INITIAL_RADIUS,
            color: '#fbbf24', // Default amber
            style: 'Sun',
            velocity: { x: 0, y: 0 },
            speed: 15,
            lives: INITIAL_LIVES,
            score: 0,
            targetRadius: PLAYER_INITIAL_RADIUS,
            invulnerableTime: 0,
            powerupTime: 0
        };

        // Entities
        let enemies = [];
        let powerups = [];
        const MAX_ENEMIES = 40;

        // Init UI Options
        function initSettingsUI() {
            // Populate Styles
            styles.forEach(style => {
                const card = document.createElement('div');
                card.className = `style-card ${player.style === style ? 'selected' : ''}`;
                card.innerText = style;
                card.addEventListener('click', () => {
                    player.style = style;
                    document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    updatePreview();
                });
                styleOptionsContainer.appendChild(card);
            });

            // Populate Colors
            selectableColors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = `color-swatch ${player.color === color ? 'selected' : ''}`;
                swatch.style.backgroundColor = color;
                swatch.addEventListener('click', () => {
                    player.color = color;
                    document.querySelectorAll('.color-swatch').forEach(c => c.classList.remove('selected'));
                    swatch.classList.add('selected');
                    updatePreview();
                });
                colorOptionsContainer.appendChild(swatch);
            });
        }
        initSettingsUI();

        const previewCanvas = document.getElementById('previewCanvas');
        const previewCtx = previewCanvas.getContext('2d', { alpha: true });

        function updatePreview() {
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            drawPlayer(previewCtx, previewCanvas.width / 2, previewCanvas.height / 2, 50, player.style, player.color, false);
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            
            baseScale = Math.min(width, height) / 800;
            PLAYER_INITIAL_RADIUS = 20 * baseScale;
            LEVEL_UP_RADIUS = 250 * baseScale;
            
            if (gameState === 'START' || gameState === 'SETTINGS') {
                player.x = width / 2;
                player.y = height / 2;
                player.radius = PLAYER_INITIAL_RADIUS;
                player.targetRadius = PLAYER_INITIAL_RADIUS;
            }
        }

        window.addEventListener('resize', resize);
        
        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        let touchStartX = 0;
        let touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            // Snap target to player so they don't jump around, acting like a virtual joystick
            mouse.x = player.x;
            mouse.y = player.y;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const dx = currentX - touchStartX;
            const dy = currentY - touchStartY;
            
            mouse.x += dx * 1.5; // Multiply drag by 1.5 for better sensitivity on mobile
            mouse.y += dy * 1.5;
            
            // Keep virtual target bounded
            mouse.x = Math.max(0, Math.min(width, mouse.x));
            mouse.y = Math.max(0, Math.min(height, mouse.y));
            
            touchStartX = currentX;
            touchStartY = currentY;
        }, { passive: false });

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);
        
        settingsBtn.addEventListener('click', () => {
            startScreen.classList.remove('active');
            updatePreview();
            setTimeout(() => { 
                startScreen.style.display = 'none';
                settingsScreen.style.display = 'flex';
                setTimeout(() => settingsScreen.classList.add('active'), 10);
            }, 500);
            gameState = 'SETTINGS';
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsScreen.classList.remove('active');
            setTimeout(() => { 
                settingsScreen.style.display = 'none';
                startScreen.style.display = 'flex';
                setTimeout(() => startScreen.classList.add('active'), 10);
            }, 500);
            gameState = 'START';
        });

        function initPlayer() {
            player.x = width / 2;
            player.y = height / 2;
            player.radius = PLAYER_INITIAL_RADIUS;
            player.targetRadius = PLAYER_INITIAL_RADIUS;
            player.velocity = { x: 0, y: 0 };
            player.invulnerableTime = 120; // Frames
            player.powerupTime = 0;
            mouse.x = width / 2;
            mouse.y = height / 2;
        }

        function startGame() {
            startScreen.classList.remove('active');
            startScreen.style.display = 'none';
            gameOverScreen.classList.remove('active');
            setTimeout(() => { gameOverScreen.style.display = 'none'; }, 500);
            
            hud.style.opacity = '1';
            
            player.lives = INITIAL_LIVES;
            player.score = 0;
            currentLevel = 1;
            levelElement.innerText = currentLevel;
            powerups = [];
            initPlayer();
            
            enemies = [];
            for (let i = 0; i < MAX_ENEMIES; i++) {
                spawnEnemy();
            }
            
            updateHUD();
            gameState = 'PLAYING';
            if (!animationId) {
                loop();
            }
        }

        function gameOver() {
            gameState = 'GAMEOVER';
            hud.style.opacity = '0';
            finalScoreElement.innerText = Math.floor(player.score);
            gameOverScreen.style.display = 'flex';
            // small delay to allow display flex to apply before opacity transition
            setTimeout(() => {
                gameOverScreen.classList.add('active');
            }, 10);
        }

        function updateHUD() {
            scoreElement.innerText = Math.floor(player.score);
            let heartsHTML = '';
            for (let i = 0; i < player.lives; i++) {
                heartsHTML += '<span class="heart">♥</span>';
            }
            livesElement.innerHTML = heartsHTML;
        }

        function getRandomColor() {
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function spawnEnemy(forceSize = null) {
            let radius;
            if (forceSize === 'small') {
                radius = Math.random() * (player.radius * 0.8) + (5 * baseScale);
            } else if (forceSize === 'large') {
                radius = player.radius + Math.random() * (30 * baseScale) + (10 * baseScale);
            } else {
                // Mix of sizes, scaled around current player size
                const rand = Math.random();
                if (rand < 0.6) {
                    radius = Math.random() * (player.radius - 5 * baseScale) + (5 * baseScale); // Smaller
                } else if (rand < 0.9) {
                    radius = player.radius + Math.random() * (20 * baseScale) + (5 * baseScale); // Slightly larger
                } else {
                    radius = player.radius + Math.random() * (50 * baseScale) + (20 * baseScale); // Much larger
                }
            }
            
            radius = Math.max(5 * baseScale, radius); // Min radius

            let x, y;
            // Spawn outside player safe zone
            do {
                x = Math.random() * width;
                y = Math.random() * height;
            } while (Math.hypot(x - player.x, y - player.y) < player.radius + radius + (100 * baseScale));

            const baseSpeed = (Math.random() * 2 + 0.5) * ((30 * baseScale) / radius); // Smaller = faster
            const speed = baseSpeed * (1 + (currentLevel - 1) * 0.2); // +20% speed per level
            const angle = Math.random() * Math.PI * 2;

            enemies.push({
                x, y, radius,
                color: getRandomColor(),
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                }
            });
        }

        function spawnPowerup() {
            if (powerups.length > 0) return; // Only one at a time
            
            const radius = 15 * baseScale; // smaller than player's initial 20 so they can eat it right away
            let x, y;
            do {
                x = Math.random() * width;
                y = Math.random() * height;
            } while (Math.hypot(x - player.x, y - player.y) < player.radius + radius + (100 * baseScale));

            const speed = 4 * baseScale;
            const angle = Math.random() * Math.PI * 2;

            powerups.push({
                x, y, radius,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                timeToLive: 600 // 10 seconds before it disappears
            });
        }

        function lerp(start, end, amt) {
            return (1 - amt) * start + amt * end;
        }

        function hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Generate a lighter version of a hex color for highlights
        function getLighterColor(hex) {
            return '#ffffff'; // Simplified for this context, using white for highlights
        }

        function update() {
            // Always run smooth radius change
            player.radius = lerp(player.radius, player.targetRadius, 0.1);

            if (gameState === 'LEVELUP') {
                // Smoothly move player to center
                player.x = lerp(player.x, width / 2, 0.05);
                player.y = lerp(player.y, height / 2, 0.05);
                
                // Enemies fly outward off screen
                enemies.forEach(enemy => {
                    const dx = enemy.x - width / 2;
                    const dy = enemy.y - height / 2;
                    const dist = Math.hypot(dx, dy) || 1;
                    enemy.x += (dx / dist) * 15;
                    enemy.y += (dy / dist) * 15;
                });
                return; // Skip gameplay logic
            }

            if (gameState !== 'PLAYING') return;

            // Player movement
            const dx = mouse.x - player.x;
            const dy = mouse.y - player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 0) {
                // Constant movement speed regardless of size
                const currentSpeed = player.speed;
                const moveDist = Math.min(dist, currentSpeed);
                player.x += (dx / dist) * moveDist;
                player.y += (dy / dist) * moveDist;
            }

            // Keep player in bounds
            player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

            if (player.invulnerableTime > 0) {
                player.invulnerableTime--;
            }

            if (player.powerupTime > 0) {
                player.powerupTime--;
            }

            // Occasional powerup spawn
            if (Math.random() < 0.001) { // roughly every 16 seconds
                spawnPowerup();
            }

            // Update powerups
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                p.timeToLive--;
                if (p.timeToLive <= 0) {
                    powerups.splice(i, 1);
                    continue;
                }
                
                // Movement
                p.x += p.velocity.x;
                p.y += p.velocity.y;
                
                // Bounce off walls
                if (p.x - p.radius < 0 || p.x + p.radius > width) {
                    p.velocity.x *= -1;
                    p.x = Math.max(p.radius, Math.min(width - p.radius, p.x));
                }
                if (p.y - p.radius < 0 || p.y + p.radius > height) {
                    p.velocity.y *= -1;
                    p.y = Math.max(p.radius, Math.min(height - p.radius, p.y));
                }
                
                // Collision with player
                const distToPlayer = Math.hypot(player.x - p.x, player.y - p.y);
                if (distToPlayer < player.radius + p.radius) {
                    if (player.radius > p.radius) {
                        // Eat powerup
                        player.powerupTime = 300; // 5 seconds
                        powerups.splice(i, 1);
                    } else {
                        // Bounce off player if smaller
                        const angle = Math.atan2(p.y - player.y, p.x - player.x);
                        p.velocity.x = Math.cos(angle) * 4;
                        p.velocity.y = Math.sin(angle) * 4;
                    }
                }
            }

            // Ensure there are always smaller balls to eat
            let smallerCount = enemies.filter(e => e.radius < player.radius).length;
            if (smallerCount < 10 && enemies.length < MAX_ENEMIES + 10) {
                spawnEnemy('small');
            }

            // Maintain max enemies
            while (enemies.length < MAX_ENEMIES) {
                spawnEnemy();
            }

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.x += enemy.velocity.x;
                enemy.y += enemy.velocity.y;

                // Bounce off walls
                if (enemy.x - enemy.radius < 0 || enemy.x + enemy.radius > width) {
                    enemy.velocity.x *= -1;
                    enemy.x = Math.max(enemy.radius, Math.min(width - enemy.radius, enemy.x));
                }
                if (enemy.y - enemy.radius < 0 || enemy.y + enemy.radius > height) {
                    enemy.velocity.y *= -1;
                    enemy.y = Math.max(enemy.radius, Math.min(height - enemy.radius, enemy.y));
                }

                // Collision detection
                const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                if (distToPlayer < player.radius + enemy.radius) {
                    if (player.powerupTime > 0 || player.radius > enemy.radius * 1.05) { // Need to be 5% bigger to eat safely
                        // Eat enemy
                        const playerArea = Math.PI * player.radius * player.radius;
                        const enemyArea = Math.PI * enemy.radius * enemy.radius;
                        player.targetRadius = Math.sqrt((playerArea + enemyArea) / Math.PI); // Gain 100% of area
                        player.score += Math.floor(enemy.radius);
                        enemies.splice(i, 1);
                        updateHUD();
                    } else if (enemy.radius > player.radius * 1.05 && player.invulnerableTime <= 0) {
                        // Eaten by enemy
                        player.lives--;
                        updateHUD();
                        if (player.lives <= 0) {
                            gameOver();
                        } else {
                            initPlayer();
                        }
                    }
                }
            }
            
            // Check Level Up
            if (player.radius >= LEVEL_UP_RADIUS) {
                levelUp();
            }
        }

        function levelUp() {
            gameState = 'LEVELUP';
            currentLevel++;
            levelElement.innerText = currentLevel;
            
            // Set player target radius to shrink smoothly
            player.targetRadius = PLAYER_INITIAL_RADIUS;
            player.invulnerableTime = 180;
            
            // Show level up screen
            levelUpScreen.style.display = 'flex';
            setTimeout(() => { levelUpScreen.classList.add('active'); }, 10);
            
            // After 1.5 seconds, the old enemies are off-screen.
            // Hide overlay, spawn new enemies, and resume playing.
            setTimeout(() => {
                enemies = [];
                for (let i = 0; i < MAX_ENEMIES; i++) {
                    spawnEnemy();
                }
                
                levelUpScreen.classList.remove('active');
                setTimeout(() => {
                    levelUpScreen.style.display = 'none';
                    gameState = 'PLAYING';
                    // Snap player perfectly to center just in case
                    player.x = width / 2;
                    player.y = height / 2;
                    mouse.x = width / 2;
                    mouse.y = height / 2;
                }, 500);
            }, 1500);
        }

        function drawGrid() {
            const gridSize = 50;
            const offsetX = player.x % gridSize;
            const offsetY = player.y % gridSize;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            for (let x = -offsetX; x < width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = -offsetY; y < height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        function draw() {
            // Dark background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);
            
            drawGrid();

            // Draw enemies
            enemies.forEach(enemy => {
                ctx.save();
                
                // Aura logic
                const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                const proximityThreshold = player.radius + enemy.radius + 150;
                
                if (dist < proximityThreshold) {
                    if (enemy.radius > player.radius * 1.05) {
                        ctx.shadowBlur = 40;
                        ctx.shadowColor = '#ef4444'; // Red
                    } else if (player.radius > enemy.radius * 1.05) {
                        ctx.shadowBlur = 40;
                        ctx.shadowColor = '#10b981'; // Green
                    }
                }

                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.fillStyle = enemy.color;
                ctx.fill();
                ctx.closePath();
                
                // Reset shadow before drawing inner highlight
                ctx.shadowBlur = 0;
                
                // Inner glow / highlight
                ctx.beginPath();
                ctx.arc(enemy.x - enemy.radius*0.3, enemy.y - enemy.radius*0.3, enemy.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
                ctx.closePath();
                
                ctx.restore();
            });

            // Draw powerups
            powerups.forEach(p => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                
                // Cycling color for a cartoony rainbow look
                const hue = (Date.now() / 5) % 360;
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                ctx.fill();
                ctx.closePath();
                
                // Inner glow / highlight matching the other cartoony balls
                ctx.beginPath();
                ctx.arc(p.x - p.radius*0.3, p.y - p.radius*0.3, p.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fill();
                ctx.closePath();
                
                // Dark border
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.stroke();
                ctx.closePath();
                
                ctx.restore();
            });

            if (gameState === 'PLAYING' || gameState === 'LEVELUP') {
                drawPlayer(ctx, player.x, player.y, player.radius, player.style, player.color, player.invulnerableTime > 0, player.powerupTime > 0);
            }
        }

        function drawPlayer(context, px, py, pr, style, color, isBlinking, isPoweredUp = false) {
            context.save();
            if (isBlinking) {
                context.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3; // Blink
            }
            
            if (isPoweredUp) {
                // Rainbow effect
                const hue = (Date.now() / 5) % 360;
                color = `hsl(${hue}, 100%, 50%)`;
                style = 'Sun'; // Force 'Sun' style for max visibility
            }
            
            if (style === 'Sun') {
                // Outer glow
                context.shadowBlur = 20;
                context.shadowColor = color;
                
                context.beginPath();
                context.arc(px, py, pr, 0, Math.PI * 2);
                
                // Vibrant gradient for player
                const gradient = context.createRadialGradient(px, py, 0, px, py, pr);
                gradient.addColorStop(0, '#ffffff'); 
                gradient.addColorStop(0.5, color);
                gradient.addColorStop(1, color);
                
                context.fillStyle = gradient;
                context.fill();
                
                // Inner core
                context.beginPath();
                context.arc(px, py, pr * 0.4, 0, Math.PI * 2);
                context.fillStyle = '#ffffff';
                context.shadowBlur = 10;
                context.shadowColor = '#ffffff';
                context.fill();
                
                // Player border
                context.lineWidth = 4;
                context.strokeStyle = 'rgba(255,255,255,0.8)';
                context.stroke();
                context.closePath();

            } else if (style === 'Neon') {
                context.beginPath();
                context.arc(px, py, pr, 0, Math.PI * 2);
                context.fillStyle = '#0f172a'; // Match background
                context.fill();
                
                context.shadowBlur = 15;
                context.shadowColor = color;
                context.lineWidth = 8;
                context.strokeStyle = color;
                context.stroke();
                
                context.shadowBlur = 30;
                context.stroke(); // Double stroke for more glow
                context.closePath();

            } else if (style === 'Classic') {
                context.beginPath();
                context.arc(px, py, pr, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
                context.closePath();
                
                // Subtle highlight
                context.beginPath();
                context.arc(px - pr*0.3, py - pr*0.3, pr * 0.2, 0, Math.PI * 2);
                context.fillStyle = 'rgba(255,255,255,0.4)';
                context.fill();
                context.closePath();
                
                // Dark border
                context.beginPath();
                context.arc(px, py, pr, 0, Math.PI * 2);
                context.lineWidth = 3;
                context.strokeStyle = 'rgba(0,0,0,0.3)';
                context.stroke();
                context.closePath();

            } else if (style === 'Target') {
                context.beginPath();
                context.arc(px, py, pr, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
                
                context.beginPath();
                context.arc(px, py, pr * 0.6, 0, Math.PI * 2);
                context.fillStyle = '#ffffff';
                context.fill();
                
                context.beginPath();
                context.arc(px, py, pr * 0.2, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
                context.closePath();
            }
            
            context.restore();
        }

        function loop() {
            update();
            draw();
            animationId = requestAnimationFrame(loop);
        }

        // Init
        resize();
        if (!animationId) {
            loop(); // Start loop immediately to render background and settings preview
        }
    