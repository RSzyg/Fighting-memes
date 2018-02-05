import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

class Main {
    private stage: Stage;
    private floors: Floor[];
    private stageWidth: number;
    private stageHeight: number;
    private verticalSpacing: number;
    private floorHeight: number;
    private interval: number;
    private selfRole: Role;
    private transferCoef: number;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 200;
        this.floorHeight = 35;
        this.interval = 17;
        this.transferCoef = 16;
    }
    public createScene() {
        this.stage.color = "#e8e8e8";
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        const groundY = this.stageHeight - this.floorHeight;
        let y: number = groundY - this.verticalSpacing;
        for (; y > 0; y -= this.verticalSpacing) {
            let rs: number = Math.floor(Math.random() * 200);
            while (rs < this.stageWidth) {
                let re = rs + Math.floor(Math.random() * 800) + 300;
                if (re > this.stageWidth) {
                    re = this.stageWidth;
                    if (re - rs < 200) {
                        rs = re;
                        continue;
                    }
                }
                const floor: Floor = new Floor(rs, y, re - rs, this.floorHeight, "basic");
                floor.setFillColor("#ffffff");
                floor.setStroke("#000000", 2);
                this.floors.push(floor);
                this.stage.add(floor.element);
                rs = re + Math.floor(Math.random() * 300) + 200;
            }
        }
        const ground: Floor = new Floor(0, groundY, this.stageWidth, this.floorHeight, "basic");
        ground.setFillColor("#ffffff");
        ground.setStroke("#000000", 2);
        this.floors.push(ground);
        this.stage.add(ground.element);

        this.createRole(groundY);
        document.addEventListener("keydown", (e) => this.keyboardController(e));
        document.addEventListener("keyup", (e) => this.keyboardController(e));
    }

    private createRole(groundY: number) {
        const random = Math.floor(Math.random() * (this.floors.length - 1));
        const bornFloor: Floor = this.floors[random];
        this.selfRole = new Role(bornFloor, 0, "#66ccff");
        this.stage.add(this.selfRole.element);
    }
/**
 * player's action
 * keycode 39 is for "→"/moveright
 * keycode 37 is for "←"/moveleft
 * keycode 40 is for "↓"/movedown
 * keycode 38 is for "↑"/jump
 * keycode 88 is for "x"/attack
 */
    private keyboardController(e: KeyboardEvent) {
        if (e.type === "keydown") {
            switch (e.keyCode) {
                case 39:
                    if (!this.selfRole.rightTimer) {
                        this.selfRole.rightTimer = setInterval(
                            () => this.selfRoleMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 37:
                    if (!this.selfRole.leftTimer) {
                        this.selfRole.leftTimer = setInterval(
                            () => this.selfRoleMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 40:
                    if (!this.selfRole.downTrans) {
                        this.selfRole.height -= this.transferCoef;
                        this.selfRole.width += this.transferCoef;
                        this.selfRole.downTrans = true;
                    }
                    break;
                case 38:
                    if (!this.selfRole.upTimer) {
                        this.selfRole.upTimer = setInterval(
                            () => this.selfRoleMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 88:
                    if (this.selfRole.downTrans && !this.selfRole.downTimer) {
                        this.selfRole.downTimer = setInterval(
                            () => this.selfRoleMove(e),
                            this.interval,
                        );
                    }
                    break;
                default:
                    break;
            }
        } else if (e.type === "keyup") {
            switch (e.keyCode) {
                case 39:
                    clearInterval(this.selfRole.rightTimer);
                    this.selfRole.rightTimer = undefined;
                    break;
                case 37:
                    clearInterval(this.selfRole.leftTimer);
                    this.selfRole.leftTimer = undefined;
                    break;
                case 40:
                    this.selfRole.height += this.transferCoef;
                    this.selfRole.width -= this.transferCoef;
                    this.selfRole.downTrans = false;
                    break;
                case 38:
                    clearInterval(this.selfRole.upTimer);
                    this.selfRole.upTimer = undefined;
                    break;
                case 88:
                    clearInterval(this.selfRole.downTimer);
                    this.selfRole.downTimer = undefined;
                    break;
            }
        }
    }

    private selfRoleMove(e: KeyboardEvent) {
        if (e.keyCode === 39) {
            let nextX: number = this.selfRole.x + this.selfRole.moveSpeed;
            nextX = this.selfRoleWillKnockWall(nextX, 1);
            this.selfRole.x = nextX % this.stageWidth;
            this.selfRoleWillFall();
        } else if (e.keyCode === 37) {
            let nextX: number = this.selfRole.x - this.selfRole.moveSpeed;
            nextX = this.selfRoleWillKnockWall(nextX, 0);
            this.selfRole.x = (nextX + this.stageWidth) % this.stageWidth;
            this.selfRoleWillFall();
        } else if (e.keyCode === 38) {
            if (this.selfRole.jumpTimer === undefined) {
                this.selfRole.jumpSpeed = this.selfRole.power;
                this.selfRole.jumpTimer = setInterval(
                    () => this.selfRoleJump(),
                    this.interval,
                );
            }
        } else if (e.keyCode === 88) {
            if (!this.selfRole.jumpTimer) {
                this.selfRole.jumpSpeed = 0;
                this.selfRole.jumpTimer = setInterval(
                    () => this.selfRoleFall(),
                    this.interval,
                );
            }
        }
    }

    private selfRoleWillFall() {
        if (
            !this.selfRole.jumpTimer &&
            (this.selfRole.x > this.selfRole.floor.x + this.selfRole.floor.width ||
                this.selfRole.x + this.selfRole.width < this.selfRole.floor.x)
        ) {
            this.selfRole.jumpSpeed = 0;
            this.selfRole.jumpTimer = setInterval(
                () => this.selfRoleFall(),
                this.interval,
            );
        }
    }

    private selfRoleWillKnockWall(nextX: number, isRight: number) {
        for (const floor of this.floors) {
            if (
                this.selfRole.y > floor.y - this.selfRole.height &&
                this.selfRole.footY < floor.y + this.floorHeight + this.selfRole.height &&
                nextX + this.selfRole.width > floor.x &&
                nextX < floor.x + floor.width
            ) {
                // return isRight * (floor.x - this.selfRole.width) + (1 - isRight) * (floor.x + floor.width);
                // theres sth wrong with that method.
                return this.selfRole.x;
            }
        }
        return nextX;
    }

    private selfRoleFall() {
        this.selfRole.jumpSpeed += this.selfRole.weight;
        let nextY: number = this.selfRole.y + this.selfRole.jumpSpeed;
        if (
            nextY + this.selfRole.height >=
            this.selfRole.ladderY + this.verticalSpacing
        ) {
            let isFind: boolean = false;
            for (const floor of this.floors) {
                if (
                    this.selfRole.x < floor.x + floor.width &&
                    this.selfRole.x + this.selfRole.width > floor.x &&
                    this.selfRole.footY < floor.y &&
                    nextY + this.selfRole.height >= floor.y
                ) {
                    nextY = floor.y - this.selfRole.height;
                    isFind = true;
                    this.selfRole.floor = floor;
                    this.selfRole.ladderY = floor.y;
                    clearInterval(this.selfRole.jumpTimer);
                    this.selfRole.jumpTimer = undefined;
                    break;
                }
            }
            if (!isFind) {
                this.selfRole.ladderY += this.verticalSpacing;
            }
        }
        this.selfRole.y = nextY;
    }

    private selfRoleJump() {
        let nextY: number = this.selfRole.y - this.selfRole.jumpSpeed;
        this.selfRole.jumpSpeed -= this.selfRole.weight;
        // console.log("ladder" + this.selfRole.ladderY);
        // console.log(this.selfRole.footY);
        if (this.selfRole.jumpSpeed > 0) {
            if (
                nextY <=
                this.selfRole.ladderY - this.verticalSpacing + this.floorHeight
            ) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.selfRole.x < floor.x + floor.width &&
                        this.selfRole.x + this.selfRole.width > floor.x &&
                        this.selfRole.y > floor.y &&
                        nextY <= floor.y + this.floorHeight
                    ) {
                        this.selfRole.jumpSpeed = 0;
                        nextY = floor.y + this.floorHeight;
                        isFind = true;
                        break;
                    }
                }
            }
            this.selfRole.y = nextY;
        } else if (this.selfRole.jumpSpeed <= 0) {
        /*
        update ladderY
        */
            if (this.selfRole.jumpSpeed === 0) {
                if (this.selfRole.ladderY - this.selfRole.footY > this.verticalSpacing) {
                    this.selfRole.ladderY -= this.verticalSpacing;
                }
            }
        /*
        hit
        */
            if (nextY + this.selfRole.height >= this.selfRole.ladderY) {
            let isFind: boolean = false;
            for (const floor of this.floors) {
                if (this.selfRole.x + this.selfRole.width >= floor.x &&
                    this.selfRole.x <= floor.x + floor.width &&
                    floor.y >= this.selfRole.ladderY &&
                    nextY + this.selfRole.height >= floor.y) {
                        isFind = true;
                        nextY = floor.y - this.selfRole.height;
                        this.selfRole.floor = floor;
                        this.selfRole.ladderY = floor.y;
                        clearInterval(this.selfRole.jumpTimer);
                        this.selfRole.jumpTimer = undefined;
                        break;
                }
            }
        }
            this.selfRole.y = nextY;
    }
}
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
