import './common.js';
import {TankBattle_MAP1} from './game_map1.js';
import {TankBattle_MAP2} from './game_map2.js';
import {MenuScene} from './menu.js';

let game;

let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: 720,
        height: 720,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0}
        }
    },
    scene: [MenuScene, TankBattle_MAP1, TankBattle_MAP2]
};

window.onload = function() {
    game = new Phaser.Game(gameConfig);
    window.focus();
}