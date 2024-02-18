export class MenuScene extends Phaser.Scene {

    sounds = {};
    constructor() {
        super('MenuScene');
        this.MainMenuObjects = [];
        this.mapSelectionObjects = [];
        this.aboutPageObjects = [];

    }

    initMenu() {
        this.gameWidth = 720;
        this.gameHeight = 720;
        this.isGameRunning = true;
        this.sounds.bgm = this.sound.add('menu_bgm', {
            volume: 0.6,
            loop: true,
        });
    this.sounds.bgm.play();

    }

    preload() {
        this.load.image('title', 'assets/imgs/menu/Title.png');
        this.load.image('mainMenu', 'assets/imgs/menu/main_menu.png');
        this.load.image('Maps', 'assets/imgs/menu/select_map.png');
        this.load.image('map1', 'assets/maps/map1/map1(FIT).png');
        this.load.image('map2', 'assets/maps/map2/map2(FIT).png');
        this.load.image('back', 'assets/imgs/menu/back.png');
        this.load.video('about', 'assets/CG/CG.mp4');
        this.load.audio('menu_bgm', 'assets/bgm/menu_bgm.mp3');
    }

    create() {

        this.initMenu();

        this.background = this.add.image(360, 360, 'mainMenu');
        this.MainMenuObjects.push(this.background);

        let title = this.add.image(360, 240, 'title').setDisplaySize(240, 105);
        this.MainMenuObjects.push(title);

        let playText = this.add.text(360, 340, 'Play Game', { 
            fontFamily: 'MenuFont', 
            fontSize: '36px', 
            fontStyle: 'bold',
            fill: '#ffffff' 
        }).setOrigin(0.5);
        this.MainMenuObjects.push(playText);
        
        playText.setInteractive();
        playText.on('pointerdown', () => {
        // show input box
            for (let obj of this.MainMenuObjects) {
                obj.destroy();
            }

            document.getElementById('playerNameInput').style.display = 'block';
            document.getElementById('playerNameInput').addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    let playerName = document.getElementById('playerNameInput').value;
                    if (playerName) {
                        this.registry.set('playerName', playerName);
                        document.getElementById('playerNameInput').style.display = 'none';
                        this.showMapSelection();
                    } else {
                        alert('Please enter your name!');
                    }
                }
            });

        })
        this.MainMenuObjects.push(playText);
        
        let aboutText = this.add.text(360, 400, 'About', { 
            fontFamily: 'MenuFont', 
            fontSize: '36px', 
            fontStyle: 'bold',
            fill: '#ffffff' 
        }).setOrigin(0.5);
        
        aboutText.setInteractive();
        aboutText.on('pointerdown', this.showAboutVideo, this);
        this.MainMenuObjects.push(aboutText);
    }

    showMapSelection() {

        this.MainMenuObjects = [];

        this.background = this.add.image(360, 360, 'Maps');
        this.mapSelectionObjects.push(this.background);
        // Display map thumbnails and names
        const map1Thumbnail = this.add.image(240, 360, 'map1').setDisplaySize(200, 200);
        const map2Thumbnail = this.add.image(480, 360, 'map2').setDisplaySize(200, 200);
        
        map1Thumbnail.setInteractive();
        map1Thumbnail.on('pointerdown', () => {
             this.scene.start('TankBattle_MAP1');
             this.scene.stop('MenuScene');
        });
        this.mapSelectionObjects.push(map1Thumbnail);

        map2Thumbnail.setInteractive();
        map2Thumbnail.on('pointerdown', () => {
            this.scene.start('TankBattle_MAP2');
            this.scene.stop('MenuScene');
        });
        this.mapSelectionObjects.push(map2Thumbnail);

        let map1Text = this.add.text(240, 240, 'Map 1', {
            fontFamily: 'MenuFont', 
            fontSize: '24px', 
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',  
            strokeThickness: 3
        }).setOrigin(0.5);
        this.mapSelectionObjects.push(map1Text);

        let map2Text = this.add.text(480, 240, 'Map 2', {
            fontFamily: 'MenuFont', 
            fontSize: '24px', 
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 3
        }).setOrigin(0.5);
        this.mapSelectionObjects.push(map2Text);

        // Add a back button
        let backButton = this.add.image(this.gameWidth - 40, 30, 'back').setDisplaySize(40, 25);
        backButton.setInteractive();
        backButton.on('pointerdown', () => {
            this.showMainMenu();
        });
        this.mapSelectionObjects.push(backButton);
    }

    showAboutVideo() {
        for (let obj of this.MainMenuObjects) {
            obj.destroy();
        }
        this.MainMenuObjects = [];

        // Stop BGM
        this.sounds.bgm.stop();
        // Play video
        let video = this.add.video(360, 360, 'about');
        video.on('play', () => {
            video.setDisplaySize(720, 720);
        });
        
        video.play();
        this.aboutPageObjects.push(video);
        
        // Text on video
        let producerText = this.add.text(360, 160, 'Producer', {
            fontFamily: 'MenuFont',
            fontSize: '30px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.aboutPageObjects.push(producerText);
        
        let producerName = this.add.text(360, 200, 'Junyang Huang', {
            fontFamily: 'MenuFont',
            fontSize: '30px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.aboutPageObjects.push(producerName);
        
        video.on('complete', () => {
            video.destroy();
            this.sounds.bgm.play();  // Play BGM again
            this.showMainMenu();  // Return to the main menu or other desired action
        });

        let backButton = this.add.image(this.gameWidth - 40, 30, 'back').setDisplaySize(40, 25);
        backButton.setInteractive();
        backButton.on('pointerdown', () => {
            this.showMainMenu();
        });
        this.aboutPageObjects.push(backButton);
    }

    showMainMenu() {
        // Destroy elements in maps selection page
        for (let obj of this.mapSelectionObjects) {
            obj.destroy();
        }
        this.mapSelectionObjects = []; 

        // Destroy elements in about page
        for (let obj of this.aboutPageObjects) {
            obj.destroy();
        }
        this.aboutPageObjects = [];

        this.background = this.add.image(360, 360, 'mainMenu');
        this.MainMenuObjects.push(this.background);
        
        let title = this.add.image(360, 240, 'title').setDisplaySize(240, 105);
        this.MainMenuObjects.push(title);
        
        let playText = this.add.text(360, 340, 'Play Game', { 
            fontFamily: 'MenuFont', 
            fontSize: '36px', 
            fontStyle: 'bold',
            fill: '#ffffff' 
        }).setOrigin(0.5);
        playText.setInteractive();
        playText.on('pointerdown', () => {
            document.getElementById('playerNameInput').style.display = 'block';
            this.showMapSelection();
        });
        this.MainMenuObjects.push(playText);

        let aboutText = this.add.text(360, 400, 'About', { 
            fontFamily: 'MenuFont', 
            fontSize: '36px', 
            fontStyle: 'bold',
            fill: '#ffffff' 
        }).setOrigin(0.5);
            
        aboutText.setInteractive();
        aboutText.on('pointerdown', this.showAboutVideo, this);
        this.MainMenuObjects.push(aboutText);
    }
    
}