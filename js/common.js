export const TANK_COLORS = ['green', 'yellow', 'blue'];
export const TANK_DIRECTIONS = ['left', 'left_up', 'up', 'right_up', 'left_down', 'down', 'right_down', 'right'];
export const MOVES = ['up', 'left', 'down', 'right'];
export const TANK_SPEED = 60;
export const BULLET_SPEED = 200;
export const STAR_SPEED = 45;
export const BOMB_SPEED = 50;
export const DELAY_SHOOT = 1000;

export class InputFlags {
    constructor() {
        this.reset();
    }

    read(keys) {
        this.up = keys.up.isDown;
        this.down = keys.down.isDown;
        this.left = keys.left.isDown;
        this.right = keys.right.isDown;
        this.shoot = keys.space.isDown;
    }

    reset() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.shoot = false;
    }
}
