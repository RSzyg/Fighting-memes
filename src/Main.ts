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
    private Roles: Role[];
    private transferCoef: number;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.Roles = [];
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
        this.Roles[0] = new Role(bornFloor, 0, "#66ccff");
        this.stage.add(this.Roles[0].element);
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
                    if (!this.Roles[0].rightTimer) {
                        this.Roles[0].rightTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 37:
                    if (!this.Roles[0].leftTimer) {
                        this.Roles[0].leftTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 40:
                    if (!this.Roles[0].downTrans) {
                        this.Roles[0].height -= this.transferCoef;
                        this.Roles[0].width += this.transferCoef;
                        this.Roles[0].downTrans = true;
                    }
                    break;
                case 38:
                    if (!this.Roles[0].upTimer) {
                        this.Roles[0].upTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 88:
                    if (this.Roles[0].downTrans && !this.Roles[0].downTimer) {
                        this.Roles[0].downTimer = setInterval(
                            () => this.RolesMove(e),
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
                    clearInterval(this.Roles[0].rightTimer);
                    this.Roles[0].rightTimer = undefined;
                    break;
                case 37:
                    clearInterval(this.Roles[0].leftTimer);
                    this.Roles[0].leftTimer = undefined;
                    break;
                case 40:
                    this.Roles[0].height += this.transferCoef;
                    this.Roles[0].width -= this.transferCoef;
                    this.Roles[0].downTrans = false;
                    break;
                case 38:
                    clearInterval(this.Roles[0].upTimer);
                    this.Roles[0].upTimer = undefined;
                    break;
                case 88:
                    clearInterval(this.Roles[0].downTimer);
                    this.Roles[0].downTimer = undefined;
                    break;
            }
        }
    }

    private RolesMove(e: KeyboardEvent) {
        if (e.keyCode === 39) {
            let nextX: number = this.Roles[0].x + this.Roles[0].moveSpeed;
            nextX = this.RolesWillImpactWall(nextX, 1);
            this.Roles[0].x = nextX % this.stageWidth;
            this.RolesWillFall();
        } else if (e.keyCode === 37) {
            let nextX: number = this.Roles[0].x - this.Roles[0].moveSpeed;
            nextX = this.RolesWillImpactWall(nextX, 0);
            this.Roles[0].x = (nextX + this.stageWidth) % this.stageWidth;
            this.RolesWillFall();
        } else if (e.keyCode === 38) {
            if (this.Roles[0].jumpTimer === undefined) {
                this.Roles[0].jumpSpeed = this.Roles[0].power;
                this.Roles[0].jumpTimer = setInterval(
                    () => this.RolesJump(),
                    this.interval,
                );
            }
        } else if (e.keyCode === 88) {
            if (!this.Roles[0].jumpTimer) {
                this.Roles[0].jumpSpeed = 0;
                this.Roles[0].jumpTimer = setInterval(
                    () => this.RolesFall(),
                    this.interval,
                );
            }
        }
    }

    private RolesWillFall() {
        if (
            !this.Roles[0].jumpTimer &&
            (this.Roles[0].x > this.Roles[0].floor.x + this.Roles[0].floor.width ||
                this.Roles[0].x + this.Roles[0].width < this.Roles[0].floor.x)
        ) {
            this.Roles[0].jumpSpeed = 0;
            this.Roles[0].jumpTimer = setInterval(
                () => this.RolesFall(),
                this.interval,
            );
        }
    }

    private RolesWillImpactWall(nextX: number, isRight: number) {
        for (const floor of this.floors) {
            if (
                this.Roles[0].y > floor.y - this.Roles[0].height &&
                this.Roles[0].footY < floor.y + this.floorHeight + this.Roles[0].height &&
                nextX + this.Roles[0].width > floor.x &&
                nextX < floor.x + floor.width
            ) {
                // return isRight * (floor.x - this.Roles[0].width) + (1 - isRight) * (floor.x + floor.width);
                // theres sth wrong with that method.
                return this.Roles[0].x;
            }
        }
        return nextX;
    }

    private RolesFall() {
        this.Roles[0].jumpSpeed += this.Roles[0].weight;
        let nextY: number = this.Roles[0].y + this.Roles[0].jumpSpeed;
        if (
            nextY + this.Roles[0].height >=
            this.Roles[0].ladderY + this.verticalSpacing
        ) {
            let isFind: boolean = false;
            for (const floor of this.floors) {
                if (
                    this.Roles[0].x < floor.x + floor.width &&
                    this.Roles[0].x + this.Roles[0].width > floor.x &&
                    this.Roles[0].footY < floor.y &&
                    nextY + this.Roles[0].height >= floor.y
                ) {
                    nextY = floor.y - this.Roles[0].height;
                    isFind = true;
                    this.Roles[0].floor = floor;
                    this.Roles[0].ladderY = floor.y;
                    clearInterval(this.Roles[0].jumpTimer);
                    this.Roles[0].jumpTimer = undefined;
                    break;
                }
            }
            if (!isFind) {
                this.Roles[0].ladderY += this.verticalSpacing;
            }
        }
        this.Roles[0].y = nextY;
    }

    private RolesJump() {
        let nextY: number = this.Roles[0].y - this.Roles[0].jumpSpeed;
        this.Roles[0].jumpSpeed -= this.Roles[0].weight;
        // console.log("ladder" + this.Roles[0].ladderY);
        // console.log(this.Roles[0].footY);
        if (this.Roles[0].jumpSpeed > 0) {
            if (
                nextY <=
                this.Roles[0].ladderY - this.verticalSpacing + this.floorHeight
            ) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[0].x < floor.x + floor.width &&
                        this.Roles[0].x + this.Roles[0].width > floor.x &&
                        this.Roles[0].y > floor.y &&
                        nextY <= floor.y + this.floorHeight
                    ) {
                        this.Roles[0].jumpSpeed = 0;
                        nextY = floor.y + this.floorHeight;
                        isFind = true;
                        break;
                    }
                }
            }
            this.Roles[0].y = nextY;
        } else if (this.Roles[0].jumpSpeed <= 0) {
        /*
        update ladderY
        */
            if (this.Roles[0].jumpSpeed === 0) {
                if (this.Roles[0].ladderY - this.Roles[0].footY > this.verticalSpacing) {
                    this.Roles[0].ladderY -= this.verticalSpacing;
                }
            }
        /*
        hit
        */
            if (nextY + this.Roles[0].height >= this.Roles[0].ladderY) {
            let isFind: boolean = false;
            for (const floor of this.floors) {
                if (this.Roles[0].x + this.Roles[0].width >= floor.x &&
                    this.Roles[0].x <= floor.x + floor.width &&
                    floor.y >= this.Roles[0].ladderY &&
                    nextY + this.Roles[0].height >= floor.y) {
                        isFind = true;
                        nextY = floor.y - this.Roles[0].height;
                        this.Roles[0].floor = floor;
                        this.Roles[0].ladderY = floor.y;
                        clearInterval(this.Roles[0].jumpTimer);
                        this.Roles[0].jumpTimer = undefined;
                        break;
                }
            }
        }
            this.Roles[0].y = nextY;
    }
}
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
