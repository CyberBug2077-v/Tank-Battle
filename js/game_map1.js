// define player

// set tank attributes
import { TANK_COLORS, TANK_DIRECTIONS, MOVES, TANK_SPEED, BULLET_SPEED, STAR_SPEED, BOMB_SPEED, DELAY_SHOOT, InputFlags } from './common.js';


// create game scene
export class TankBattle_MAP1 extends Phaser.Scene {
    sounds = {};
    constructor() {
        super('TankBattle_MAP1');
    }

    initGame() {
        this.gameWidth = 720;
        this.gemeHeight = 720;
        this.isGameRunning = true;

        this.player = null;
        this.tanks = new Phaser.Structs.List();
        this.bricks = null;
        this.collisions = null;
        this.players = null;
        this.enemies = null;
        this.bullets = null;
        this.stars = null;
        this.bombs = null;
        this.score = 0;
        this.cursorKeys = null;

        this.playerName = this.registry.get('playerName');
        console.log(this.playerName);
        let playerNameText = this.add.text(20, 50, `player: ${this.playerName}`, {
            fontSize: '24px',
            fill: '#FFFFFF', 
            fontFamily: 'Arial', 
            stroke: '#000',
            strokeThickness: 4
        });
        playerNameText.setDepth(10);
        let textStyle = {
            fontSize: '24px',
            fill: '#FFFFFF', 
            fontFamily: 'Arial', 
            stroke: '#000',
            strokeThickness: 4
        };
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, textStyle);
        this.scoreText.setY(playerNameText.height);
        this.scoreText.setDepth(10);
        
        this.sounds.brickExp = this.sound.add('brick_exp', {volume: 0.3});
        this.sounds.tankExp = this.sound.add('tank_exp', {volume: 0.4});
        this.sounds.bgm = this.sound.add('game_bgm', {
            volume: 0.6,
            loop: true,
        });
        this.sounds.fire = this.sound.add('tank_fire', {volume: 0.4});
        this.sounds.starSp = this.sound.add('star_spawn', {volume: 0.5});
        this.sounds.bombSp = this.sound.add('bomb_spawn', {volume: 0.6});
        this.sounds.bgm.play();

        let backButton = this.add.image(this.gameWidth - 40, 30, 'back').setDisplaySize(40, 25);
        backButton.setInteractive();
        backButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('MenuScene');
            this.scene.stop('TankBattle_MAP1');
        });
        backButton.setDepth(10);
    }

    preload() {
        //Tilemap
        this.load.tilemapTiledJSON('map', 'assets/maps/map1/map1_tiled.json');
        this.load.image('map1_tileimg', 'assets/maps/map1/map1(FIT).png');

        // sprites
        const spriteConfig = {frameWidth: 32, frameHeight: 27};
        TANK_COLORS.forEach((color) => {
            this.load.spritesheet('tank_' + color, 'assets/animation/tanks/tanks_' + color + '.png',
            spriteConfig
            );
        });
        this.load.image('bullet', 'assets/imgs/in_game/bullet.png');
        this.load.spritesheet('big_exp', 'assets/animation/explosions/big_exp.png',
            { frameWidth: 56, frameHeight: 47 }
        );
        this.load.spritesheet('brick', 'assets/imgs/in_game/brick.png', 
            { frameWidth: 24, frameHeight: 24 }
        );
        this.load.spritesheet('brick_explosion', 'assets/animation/explosions/explosion1.png', 
            { frameWidth: 32, frameHeight: 28 }
        );
        this.load.spritesheet('bullet_spark', 'assets/animation/explosions/explosion2.png',
            { frameWidth: 20, frameHeight: 22 }
        );
        this.load.spritesheet('tank_explosion', 'assets/animation/explosions/explosion3.png',
            { frameWidth: 43, frameHeight: 42 }
        );
        this.load.spritesheet('spawn', 'assets/animation/spawn/spawn.png', 
            {frameWidth: 24, frameHeight: 24 }
        );
        this.load.spritesheet('brick_piece', 'assets/imgs/in_game/brick.png', 
            { frameWidth: 4, frameHeight: 4 }
        );
        this.load.image('star', 'assets/imgs/in_game/star.png');
        this.load.image('bomb', 'assets/imgs/in_game/big_bomb.png');
        this.load.image('back', 'assets/imgs/menu/back.png');
        this.load.audio('brick_exp', 'assets/audios/brick_exp.mp3');
        this.load.audio('tank_exp', 'assets/audios/tank_exp.mp3');
        this.load.audio('tank_fire', 'assets/audios/tank_fire.mp3');
        this.load.audio('game_bgm', 'assets/bgm/game_bgm.mp3');
        this.load.audio('star_spawn', 'assets/audios/star_spawn.mp3');
        this.load.audio('bomb_spawn', 'assets/audios/siren.mp3');

    }

    create() {
        this.initGame();
        // Create map
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('map1(FIT)', 'map1_tileimg');

        //create static blocks
        const worldLayer = map.createLayer('blocks', tileset, 0, 0);
        worldLayer.setCollisionBetween(0, 899, true);
      
        // Create this.bricks
        this.bricks = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        this.collisions = this.physics.add.staticGroup();

        const collObjects = map.getObjectLayer('colls').objects;
        collObjects.forEach((obj) => {
            const collider = this.collisions.create(obj.x + obj.width / 2, obj.y + obj.height / 2);
            collider.isCollider = true;
            collider.setSize(obj.width, obj.height);
            collider.setVisible(false);
        });

        map.getObjectLayer('bricks').objects.forEach((obj) => {
            const brick = this.physics.add.sprite(obj.x, obj.y, 'brick');
            brick.isBrick = true;
            brick.isFull = true;   
            this.bricks.add(brick);
        });

        // this.physics.world.createDebugGraphic();

        

        // Physics
        const physicsConfig = {collideWorldBounds: true};
        this.players = this.physics.add.group(physicsConfig);
        this.enemies = this.physics.add.group(physicsConfig);
        this.bullets = this.physics.add.group(physicsConfig);
        this.stars = this.physics.add.group(physicsConfig);
        this.bombs = this.physics.add.group(physicsConfig);

        // create player tank
        this.spawnPlayer(158, 136, 'yellow');

        // this.collisions
        this.physics.world.on('worldBounds', this.onWorldBounds, this);
        this.physics.add.collider([this.players, this.enemies, this.stars, this.bombs], [worldLayer, this.collisions, this.bricks]);
        this.physics.add.collider(this.bullets, [worldLayer, this.bricks, this.players, this.enemies, this.collisions], this.onBulletCollide, this.onBulletCollideCheck, this);
        this.physics.add.collider([this.players, this.enemies, this.bullets, this.stars, this.bombs], this.collisions, this.onBulletCollide, this.onBulletCollideCheck, this);


        // Animations
        const createTankTurnAnim = (color, key, frames) => {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers('tank_' + color, {
                    frames
                }),
                frameRate: 16,
                duraion: 200
            })
        }
        const createTankAnim = (color, key, frames) => {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers('tank_' + color, {
                    frames
                }),
                frameRate: 16,
                repeat: -1,
            })
        }

        TANK_COLORS.forEach((color) => {
            createTankTurnAnim(color, 
                'tank_' + color + '_left_up',
                [2, 1, 0]
            );
            createTankTurnAnim(color, 
                'tank_' + color + '_right_up',
                [2, 3, 7]
            );
            createTankTurnAnim(color, 
                'tank_' + color + '_left_down',
                [5, 4, 0]
            );
            createTankTurnAnim(color, 
                'tank_' + color + '_right_down',
                [5, 6, 7]
            );
            createTankAnim(color, 
                'tank_' + color + '_up',
                [2]
            );
            createTankAnim(color, 
                'tank_' + color + '_down',
                [5]
            );
            createTankAnim(color, 
                'tank_' + color + '_left',
                [0]
            );
            createTankAnim(color, 
                'tank_' + color + '_right',
                [7]
            );
    
        });


        this.anims.create({
            key: 'bullet',
            frames: this.anims.generateFrameNumbers('bullet_spark', {
                frames: [0, 1, 2, 3] 
            }),
            duration: 100
        });

        this.anims.create({
            key: 'explosion1',
            frames: this.anims.generateFrameNumbers('brick_explosion', {
                frames: [0, 1, 2, 3, 4, 0]
            }),
            duraion: 400
        });

        this.anims.create({
            key: 'explosion2',
            frames: this.anims.generateFrameNumbers('tank_explosion', {
                frames: [0, 1]
            }),
            duration: 400
        });

        this.anims.create({
            key: 'spawn',
            frames: this.anims.generateFrameNumbers('spawn', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 16,
            yoyo: true,
            repeat: -1
        });

        this.anims.create({
            key: 'big_exp',
            frames: this.anims.generateFrameNumbers('big_exp', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 16,
            duration: 400
        })


        // initialize input
        this.cursorKeys = this.input.keyboard.createCursorKeys();


        // Spawn tanks
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                this.spawnTank1();
                this.spawnTank2();
            }
        });

        // Spawn stars
        this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                this.spawnStar();
            }
        });

        // Spawn bombs
        this.time.addEvent({
            delay: 10000,
            loop: true,
            callback: () => {
                this.spawnBomb();
            }
        });
        this.spawnTank1();
        this.spawnTank2();
        this.spawnStar();
        this.spawnBomb();
    }

    update(ts, dt) {
        // Read player input
        this.player.inputFlags.read(this.cursorKeys);

        // Set action for tank
        this.tanks.each((tank) => {
            if (!tank.visible || !tank) return;

            // Read input
            const flags = tank.inputFlags;
            tank.setVelocity(0, 0);
            
            // set velocity from flags
            if (flags.left) tank.body.velocity.x -= TANK_SPEED;
            if (flags.right) tank.body.velocity.x += TANK_SPEED;
            if (!flags.left && !flags.right) {
                if (flags.up) tank.body.velocity.y -= TANK_SPEED;
                if (flags.down) tank.body.velocity.y += TANK_SPEED;
            }

            // Save last direction
            tank.hasStopped = false;
            if (tank.body.velocity.x < 0) tank.lastDir = 'left';
            else if (tank.body.velocity.x > 0) tank.lastDir = 'right';
            else if (tank.body.velocity.y < 0) tank.lastDir = 'up';
            else if (tank.body.velocity.y > 0) tank.lastDir = 'down';
            else tank.hasStopped = true;

            // Animation
            if (!tank.hasStopped) {
                let animKey = tank.texture.key + '_';

                if (tank.lastDir === 'up') {
                    if (tank.body.velocity.x < 0) {
                        animKey += 'left_up';
                    }
                    else if (tank.body.velocity.x > 0) {
                        animKey += 'right_up';
                    }
                    else {
                        animKey += 'up';
                    }
                    tank.play(animKey, true);
                }
                else if (tank.lastDir === 'down') {
                    if (tank.body.velocity.x < 0) {
                        animKey += 'left_down';
                    }
                    else if (tank.body.velocity.x > 0) {
                        animKey += 'right_down';
                    }
                    else {
                        animKey += 'down';
                    }
                    tank.play(animKey, true);
                }
                else if (tank.lastDir === 'left' || tank.lastDir === 'right') {
                    animKey += tank.lastDir;
                    tank.play(animKey, true);
                }

            } else {
                tank.stop();
            }

            // Shoot
            if (!tank.shootTime) tank.shootTime = 0;
            if (flags.shoot && (this.game.getTime() - tank.shootTime > DELAY_SHOOT)
            ) {
                // reset shoot time
                tank.shootTime = this.game.getTime();
                let angle = 0;
                let offX = 0;
                let offY = 0;
                if (tank.lastDir === 'left') {
                    angle = 270; offY = -1;
                }
                else if (tank.lastDir === 'right') {
                    angle = 90; offY = 0;
                }
                else if (tank.lastDir === 'down') {
                    angle = 180; offX = -1;
                }
                this.spawnBullet(
                    tank.x + offX, tank.y + offY, angle,
                    tank.isEnemy, tank
                );
            }

            // Bot step
            if (!tank.nextBotStep) {
                tank.nextBotStep = this.game.getTime();
            }
            if (tank.nextBotStep < this.game.getTime()) {

                tank.nextBotStep = this.game.getTime()
                + Phaser.Math.Between(100, 300);

                // Reset state
                tank.inputFlags.reset();

                // Set moving direction
                this.time.addEvent()
                let dir = MOVES[Phaser.Math.Between(0, 3)];
                tank.inputFlags[dir] = true;

                // shoot 
                tank.inputFlags.shoot = Math.random() < 0.5;
            } else if (tank.hasCollied) {
                // Reset state
                tank.inputFlags.reset();

                // Set moving direction
                this.time.addEvent()
                let dir = MOVES[Phaser.Math.Between(0, 3)];
                tank.inputFlags[dir] = true;
                
                // shoot 
                tank.inputFlags.shoot = Math.random() < 0.5;
            }
        });

        // Set actions for this.stars
        this.stars.children.iterate((star) => {
            if (!star) return;
            const starFlags = star.InputFlags;
            star.setVelocity(0, 0);

            if (starFlags.left) star.body.velocity.x -= STAR_SPEED;
            if (starFlags.right) star.body.velocity.x += STAR_SPEED;
            if (starFlags.up) star.body.velocity.y -= STAR_SPEED;
            if (starFlags.down) star.body.velocity.y += STAR_SPEED;

            if (!star.nextStarStep) {
                star.nextStarStep = this.game.getTime();
            }
            if (star.nextStarStep < this.game.getTime()) {
                star.nextStarStep = this.game.getTime() + Phaser.Math.Between(100, 300);

                star.InputFlags.reset();
                let dir = MOVES[Phaser.Math.Between(0, 3)];
                star.InputFlags[dir] = true;
            }
        });

        // Set action for bombs
        this.bombs.children.iterate((bomb) => {
            if (!bomb) return;
            const flags = bomb.bombFlags;
            bomb.setVelocity(0, 0);

            if (flags.left) bomb.body.velocity.x -= BOMB_SPEED;
            if (flags.right) bomb.body.velocity.x += BOMB_SPEED;
            if (flags.up) bomb.body.velocity.y -= BOMB_SPEED;
            if (flags.down) bomb.body.velocity.y += BOMB_SPEED;

            if (!bomb.nextBombStep)  {
                bomb.nextBombStep = this.game.getTime();
            }

            if (bomb.nextBombStep < this.game.getTime()) {
                bomb.nextBombStep = this.game.getTime() + Phaser.Math.Between(100, 300);

                bomb.bombFlags.reset();
                let dir = MOVES[Phaser.Math.Between(0, 3)];
                bomb.bombFlags[dir] = true;
            }
        });

    }

    spawnPlayer(x, y, color) {
        const tank = this.physics.add.sprite(x, y, 'tank_' + color);
        console.log(tank);
        tank.isPlayer = true;
        tank.setBodySize(13, 13, true);
        tank.setPushable(false);
        tank.setCollideWorldBounds(true);
        tank.inputFlags = new InputFlags();
        tank.on('animationcomplete', function(anim, frame) {
            if (anim.key.endsWith('_left_up')) {
                this.play(this.texture.key + '_left');
            } else if (anim.key.endsWith('_right_up')) {
                this.play(this.texture.key + '_right');
            } else if (anim.key.endsWith('_left_down')) {
                this.play(this.texture.key + '_left');
            } else if (anim.key.endsWith('_right_down')) {
                this.play(this.texture.key + '_right');
            }
        }, );
        this.player = tank;
        this.tanks.add(tank);
        this.players.add(tank);
    }

    spawnStar() {
        if (this.stars.length > 6) return;
        let starX;
        let starY;
        let overlapFound = true;
        while (overlapFound) {
            starX = Phaser.Math.Between(this.player.x - 150, this.player.x + 150);   // Assuming map width is 720
            starY = Phaser.Math.Between(this.player.y - 150, this.player.y + 150);  // Assuming map height is 720
    
            let testStar= this.physics.add.sprite(starX, starY, 'star'); // Create a test tank
            overlapFound = this.physics.overlap(testStar, this.collisions); // Check for overlap with this.collisions
            testStar.destroy(); // Destroy the star
    
            if (!overlapFound) {
                // If no overlap found, break the loop
                break;
            }
        }

        const spawn_s = this.physics.add.sprite(starX, starY, 'spawn');
        spawn_s.play('spawn');
        this.sounds.starSp.play();


        this.time.addEvent({
            delay: 800,
            callback: () => {
                spawn_s.destroy();
                const star = this.physics.add.sprite(starX, starY, 'star');
                star.setBodySize(10, 10, true);
                star.setPushable(false);
                star.setCollideWorldBounds(true);
                star.body.onWorldBounds = true;
                star.isStar = true;
                star.InputFlags = new InputFlags();
                this.physics.add.overlap(this.player, star, this.collectStar, null, this);
                this.stars.add(star);

            }
        });

    }

    collectStar(player, star) {
        star.destroy();
        this.stars.remove(star);
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score); //updata this.score
    }

    clearAllStars() {
        this.stars.getChildren().map(star => {
            this.stars.killAndHide(star);
        });
    }

    spawnBomb() {
        if (this.bombs.length > 0) return; 
        let bombX;
        let bombY;

        let overlapFound = true;
        while (overlapFound) {
            bombX = Phaser.Math.Between(this.player.x - 300, this.player.x + 300);   // Assuming map width is 720
            bombY = Phaser.Math.Between(this.player.y - 300, this.player.y + 300);  // Assuming map height is 720
    
            let testBomb= this.physics.add.sprite(bombX, bombY, 'star'); // Create a test tank
            overlapFound = this.physics.overlap(testBomb, this.collisions); // Check for overlap with this.collisions
            testBomb.destroy(); // Destroy the star
    
            if (!overlapFound) {
                // If no overlap found, break the loop
                break;
            }
        }

        const spawn_b = this.physics.add.sprite(bombX, bombY, 'spawn');
        spawn_b.play('spawn');
        let music = this.sounds.bombSp;
        music.play();
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                music.stop();
            }
        });
        

        this.time.addEvent({
            delay: 800,
            callback: () => {
                spawn_b.destroy();
                const bomb = this.physics.add.sprite(bombX, bombY, 'bomb');
                bomb.setBodySize(12, 12, true);
                bomb.setPushable(false);
                bomb.setCollideWorldBounds(true);
                bomb.body.onWorldBounds = true;
                bomb.isBtar = true;
                bomb.bombFlags = new InputFlags();
                this.physics.add.overlap(this.player, bomb, this.collectBomb, null, this);
                this.bombs.add(bomb);

                this.time.addEvent({
                    delay: 8000,
                    callback: () => {
                        bomb.destroy();
                        this.bombs.remove(bomb);
                    }
                });
            }
        });

    }

    collectBomb(player, bomb) {
        let explosion = this.physics.add.sprite(bomb.x, bomb.y, 'big_exp');
        explosion.play('big_exp');
        this.time.addEvent({
            delay: 300,
            callback: () => {
                explosion.destroy();
                bomb.destroy();
                this.bombs.remove(bomb);
            }
        });

        this.tanks.each((tank) => {
            if (!tank.isPlayer) {
                this.spawnTankExplosion(tank.x, tank.y); 
                this.score += 20;
                this.tanks.remove(tank);
                tank.destroy();
            }
        });

        this.scoreText.setText(`Score: ${this.score}`); 
    }
    
    clearAllBombs() {
        this.bombs.getChildren().map(bomb => {
            this.bombs.killAndHide(bomb);
        });
    }

    spawnBullet(x, y, angle, enemy, shooter) {
        const bullet = this.physics.add.sprite(x, y, 'bullet');
        bullet.isBullet = true;
        bullet.isEnemy = enemy;
        bullet.shooter = shooter;
        bullet.depth = 1;
        this.bullets.add(bullet);

        // Bullet collide with world bound
        bullet.body.onWorldBounds = true;

        // BUllet move
        const rad = Phaser.Math.DegToRad(angle);
        bullet.setAngle(angle);
        bullet.setBodySize(4, 4, true);
        bullet.setVelocity(BULLET_SPEED * Math.sin(rad), -BULLET_SPEED * Math.cos(rad));
    }

    spawnTank1() {
        if (this.tanks.length > 10) return;
        // select spawn point
        let posX1;
        let posY1;
        let overlapFound = true; 
    
        // Keep trying until we find a position without overlap
        while (overlapFound) {
            posX1 = Phaser.Math.Between(this.player.x - 100, this.player.x + 100);   // Assuming map width is 720
            posY1 = Phaser.Math.Between(this.player.y - 100, this.player.y + 100);  // Assuming map height is 720
    
            let testTank = this.physics.add.sprite(posX1, posY1, 'tank_blue'); // Create a test tank
            overlapFound = this.physics.overlap(testTank, this.collisions); // Check for overlap with this.collisions
            testTank.destroy(); // Destroy the test tank
    
            if (!overlapFound) {
                // If no overlap found, break the loop
                break;
            }
        }
        // Spawn animation
        const spawn = this.physics.add.sprite(posX1, posY1, 'spawn');
        spawn.play('spawn');

        // Show tank
        this.time.addEvent({
            delay: 800,
            callback: () => {
                spawn.destroy();

                // Create tank
                const tank = this.physics.add.sprite(
                    posX1, posY1,
                    'tank_blue'
                );
                tank.setBodySize(13, 13, true);
                tank.setPushable(false);
                tank.setCollideWorldBounds(true);
                tank.body.onWorldBounds = true;

                tank.isEnemy = true;
                tank.inputFlags = new InputFlags();
                tank.on('animationcomplete', function(anim, frame) {
                    if (anim.key.endsWith('_left_up')) {
                        this.play(this.texture.key + '_left');
                    } else if (anim.key.endsWith('_right_up')) {
                        this.play(this.texture.key + '_right');
                    } else if (anim.key.endsWith('_left_down')) {
                        this.play(this.texture.key + '_left');
                    } else if (anim.key.endsWith('_right_down')) {
                        this.play(this.texture.key + '_right');
                    }
                }, tank);
                this.physics.add.collider(tank,  this.collisions, () => {
                    tank.hasCollied = true;
                });                
                this.tanks.add(tank);
                this.enemies.add(tank);
            }
        })
    }

    spawnTank2() {
        if (this.tanks.length > 10) return;
        // select spawn point
        let posX2;
        let posY2;
        let overlapFound = true;
    
        // Keep trying until we find a position without overlap
        while (overlapFound) {
            posX2 = Phaser.Math.Between(this.player.x - 100, this.player.x + 100);   // Assuming map width is 720
            posY2 = Phaser.Math.Between(this.player.y - 100, this.player.y + 100); // Assuming map height is 720
    
            let testTank = this.physics.add.sprite(posX2, posY2, 'tank_green'); // Create a test tank
            overlapFound = this.physics.overlap(testTank, this.collisions); // Check for overlap with this.collisions
            testTank.destroy(); // Destroy the test tank
    
            if (!overlapFound) {
                // If no overlap found, break the loop
                break;
            }
        }
        // Spawn animation
        const spawn = this.physics.add.sprite(posX2, posY2, 'spawn');
        spawn.play('spawn');

        // Show tank
        this.time.addEvent({
            delay: 800,
            callback: () => {
                spawn.destroy();

                // Create tank
                const tank = this.physics.add.sprite(
                    posX2, posY2,
                    'tank_green'
                );
                tank.setBodySize(13, 13, true);
                tank.setPushable(false);
                tank.isEnemy = true;
                tank.setCollideWorldBounds(true);
                tank.body.onWorldBounds = true;
                tank.inputFlags = new InputFlags();
                tank.on('animationcomplete', function(anim, frame) {
                    if (anim.key.endsWith('_left_up')) {
                        this.play(this.texture.key + '_left');
                    } else if (anim.key.endsWith('_right_up')) {
                        this.play(this.texture.key + '_right');
                    } else if (anim.key.endsWith('_left_down')) {
                        this.play(this.texture.key + '_left');
                    } else if (anim.key.endsWith('_right_down')) {
                        this.play(this.texture.key + '_right');
                    }
                }, tank);
                this.physics.add.collider(tank,  this.collisions, () => {
                    tank.hasCollied = true;
                });                
                this.tanks.add(tank);
                this.enemies.add(tank);
            }
        })
    }    

    spawnBulletSpark(x, y) {
        const exp = this.add.sprite(x, y, 'bullet_spark');
        exp.play('bullet');
        this.sounds.fire.play();
        this.time.addEvent({
            delay: 100,
            callback: () => exp.destroy()
        });
    }

    spawnTankExplosion(x, y) {
        const exp = this.add.sprite(x, y, 'tank_explosion');
        exp.play('explosion2');
        this.sounds.tankExp.play();
        this.time.addEvent({
            delay: 400,
            callback: () => exp.destroy()
        });
    }

    spawnBrickExplosion(x, y) {
        const exp = this.add.sprite(x, y, 'brick_explosion');
        exp.play('explosion1');
        this.sounds.brickExp.play();
        this.time.addEvent({
            delay: 400,
            callback: () => exp.destroy()
        });
    }


    onWorldBounds(body) {
        this.spawnBrickExplosion(body.x, body.y);
    }

    onBulletCollide(item1, item2) {
        // Check where the bullet from
        let bullet = item1.isBullet ? item1 : item2;
        let target = item1.isBullet ? item2: item1;

        // player hit by enemy
        if (bullet.isEnemy && target.isPlayer && target.visible) {
            this.spawnTankExplosion(target.x, target.y);
            console.log("Being hit:", target.isPlayer);
            this.tanks.remove(target);
            target.destroy();
            this.clearAllStars();
            this.clearAllBombs();

            // Respawn
            const new_playerx= 168;
            const new_playery = 136;
            const spawn = this.physics.add.sprite(
                new_playerx, new_playery,
                'spawn'
            );
            spawn.play('spawn');


            // Show tank back
            console.log("Before time event:", target);
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    spawn.destroy();
                    this.spawnPlayer(new_playerx, new_playery, 'yellow');
                    this.score = 0;
                    this.scoreText.setText(`Score: ${this.score}`);
                    console.log('Respawn');
                    console.log("Tank Alpha:", target.alpha);
                    console.log("Tank ScaleX:", target.scaleX);
                    console.log("Tank ScaleY:", target.scaleY);
                    console.log("Tank Texture:", target.texture.key);
                    console.log("Tank depth:", target.depth);
                    console.log('Tank visible:', target.visible);
                }
            }); 
            console.log("After time event:", this.player);
        }   

        // Enemy hit by player
        else if (!bullet.isEnemy && target.isEnemy) {
            // Explosion
            this.spawnTankExplosion(target.x, target.y);

            // Destroy enemy tank
            this.tanks.remove(target);
            target.destroy();
            this.score += 20;
            this.scoreText.setText(`Score: ${this.score}`);

        }

        // Brick hit by bullet
        else if (target.isBrick) {
            // remove brick in collision direction
            const vertical = (target.body && !target.body.touching.left && !target.body.touching.right);

            // Get linked pieces
            const px = target.x;
            const py = target.y;
            let linkedPieces = target.linkedPieces ? target.linkedPieces : null;

            let pieces = [];
            if (target.isFull) {
                // Destroy blocks
                target.destroy();

                // create new pieces
                for (let x = 0; x < 4; x++) {
                    for (let y = 0; y < 4; y++) {
                        const piece = this.physics.add.sprite(
                            px + x * 4 - 6,
                            py + y * 4 - 6,
                            'brick_piece',
                            x + y * 4
                        );
                        piece.isBrick = true;
                        piece.linkedPieces = pieces;
                        piece.parentCenterX = px;
                        piece.parentCenterY = py;
                        pieces.push(piece);
                        this.bricks.add(piece);
                    }
                }

                // Destroy nearby linked this.bricks
                linkedPieces = pieces;
                this.destroyLinkedPieces(bullet.x, bullet.y, vertical, linkedPieces);
            }

            // Destroy nearby blocks
            else {
                this.destroyLinkedPieces(bullet.x, bullet.y, vertical)
            }
        }
        else if (target.isCollider) {
            this.spawnBrickExplosion(bullet.x, bullet.y);
            bullet.destroy();
            return;
        }

        // Destroy bullet
        this.spawnBrickExplosion(bullet.x, bullet.y);
        bullet.destroy();
 
    }

    onBulletCollideCheck(item1, item2) {
        let bullet = item1.isBullet ? item1 : item2;
        let target = item1.isBullet ? item2 : item1;

        // Allow this.collisions only with other group
        if ((bullet.isEnemy && target.isEnemy) || (!bullet.isEnemy && target.isPlayer)) {
            return false;
        }

        // Allow other this.collisions
        return true;
    }

    destroyLinkedPieces(x, y, vertical, pieces) {
        if (!pieces) return;

        // Find piece closer to the bullet
        let nearest = pieces[0];
        let minDist =  Phaser.Math.Distance.Between(
            x, y,
            nearest.x, nearest.y
        );
        pieces.forEach((p) => {
            const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
            if (dist < minDist) {
                nearest = p;
                minDist = dist;
            }
        });

        // if bullet close to center, destroy whole row
        const checkDelete = (p) => {
            // Vertical
            if (vertical && p.y === nearest.y) {
                if (Math.abs(p.parentCenterX - x) <= 4) return true;

                // Hit left from the center
                else if (x < p.parentCenterX && p.x <= p.parentCenterX)
                    return true;

                // Hit right from the center
                else if (p.parentCenterX <= x && p.x >= p.parentCenterX)
                    return true;
            }

            else if (!vertical && p.x === nearest.x) {
                // close to center, destroy whole column
                if (Math.abs(p.parentCenterY - y) <= 4) return true;

                // Hit up from the center
                else if (y < p.parentCenterY && p.y <= p.parentCenterY)
                    return true;

                // Hit down from the center
                else if (p.parentCenterY <= y && p.y >= p.parentCenterY)
                    return true;
            }
        }

        // Destroy pieces nearby
        const destroyedPieces = [nearest];
        pieces.forEach((p) => {
            if (checkDelete(p)) {
                destroyedPieces.push(p);
                p.destroy();
            }
        });

        // Destroy nearest block
        nearest.destroy();

        // cleanup
        destroyedPieces.forEach((destroyedPieces) => {
            const ind = pieces.indexOf(destroyedPieces);
            if (ind > -1) pieces.splice(ind, 1);
        });
    }
}
