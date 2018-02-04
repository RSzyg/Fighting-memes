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
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 200;
        this.floorHeight = 35;
        this.interval = 17;
    }
    public createScene() {
        this.stage.color = "#e8e8e8";
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        const groundY = this.stageHeight - this.floorHeight;
        let y: number = groundY - this.verticalSpacing - this.floorHeight;
        for (; y > 0; y -= (this.verticalSpacing + this.floorHeight)) {
            let rs: number = Math.random() * 200;
            while (rs < this.stageWidth) {
                let re = rs + Math.random() * 800 + 300;
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
                rs = re + Math.random() * 300 + 200;
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
        const roleX: number = Math.random() * this.stageWidth;
        const roleY: number = groundY;
        this.selfRole = new Role(roleX, roleY, 0, "#66ccff");
        this.stage.add(this.selfRole.element);
    }
/**
 * player's action
 * keycode 68 is for "d"/moveright
 * keycode 65 is for "a"/moveleft
 * keycode 83 is for "s"/movedown
 * keycode 74 is for "j"/jump
 */
    private keyboardController(e: KeyboardEvent) {
        if (e.type === "keydown") {
            switch (e.keyCode) {
                case 68:
                    if (this.selfRole.rightTimer === undefined) {
                        this.selfRole.rightTimer = setInterval(() => this.selfRoleMove(e), this.interval);
                    }
                    break;
                case 65:
                    if (this.selfRole.leftTimer === undefined) {
                        this.selfRole.leftTimer = setInterval(() => this.selfRoleMove(e), this.interval);
                    }
                    break;
                case 83:
                    if (this.selfRole.downTimer === undefined) {
                        this.selfRole.downTimer = setInterval(() => this.selfRoleMove(e), this.interval);
                    }
                    break;
                case 74:
                    if (this.selfRole.upTimer === undefined) {
                        this.selfRole.upTimer = setInterval(() => this.selfRoleMove(e), this.interval);
                    }
                    break;
            }
        }
        if (e.type === "keyup") {
            switch (e.keyCode) {
                case 68:
                    clearInterval(this.selfRole.rightTimer);
                    this.selfRole.rightTimer = undefined;
                    break;
                case 65:
                    clearInterval(this.selfRole.leftTimer);
                    this.selfRole.leftTimer = undefined;
                    break;
                case 83:
                    clearInterval(this.selfRole.leftTimer);
                    this.selfRole.downTimer = undefined;
                    break;
                case 74:
                    clearInterval(this.selfRole.upTimer);
                    this.selfRole.upTimer = undefined;
                    break;
            }
        }
    }

    private selfRoleMove(e: KeyboardEvent) {
        switch (e.keyCode) {
            case 68:
                this.selfRole.x += this.selfRole.moveSpeed;
                break;
            case 65:
                this.selfRole.x -= this.selfRole.moveSpeed;
                break;
            // case 83:
             case 74:
                if (this.selfRole.jumpTimer === undefined) {
                    this.selfRole.jumpSpeed = this.selfRole.power;
                    this.selfRole.jumpTimer = setInterval(() => this.selfRoleJump(), this.interval);
                }
                break;
        }
    }

    private selfRoleFall() {
        this.selfRole.jumpSpeed += this.selfRole.weight;
        let nextY: number = this.selfRole.y + this.selfRole.jumpSpeed;
        if (
            nextY + this.selfRole.height >=
            this.selfRole.footY + this.verticalSpacing
        ) {
            let isFind: boolean = false;
            for (const floor of this.floors) {
                if (
                    this.selfRole.x < floor.x + floor.width &&
                    this.selfRole.x - this.selfRole.width > floor.x
                ) {
                    nextY = floor.y;
                    isFind = true;
                    clearInterval(this.selfRole.fallTimer);
                    this.selfRole.fallTimer = undefined;
                    break;
                }
            }
            if (!isFind) {
                this.selfRole.footY += this.verticalSpacing;
            }
        }
        this.selfRole.y = nextY;
    }

    private selfRoleJump() {
        let ladder: Floor;
        let btmY: number;
        this.selfRole.y -= this.selfRole.jumpSpeed;
        this.selfRole.jumpSpeed -= this.selfRole.weight;
        btmY = this.selfRole.y + this.selfRole.height;
        if (this.selfRole.jumpSpeed === 0) {
            let cell: number;
            let re: number;
            cell = (this.stageHeight - btmY) / (this.verticalSpacing + this.floorHeight);
            re = (this.stageHeight - btmY) % (this.verticalSpacing + this.floorHeight);
            if (re > this.floorHeight) {
                this.selfRole.footY = this.stageHeight -
                cell * (this.verticalSpacing + this.floorHeight) - this.verticalSpacing;
            } else {
                this.selfRole.footY = this.stageHeight -
                (cell - 1) * (this.verticalSpacing + this.floorHeight) - this.verticalSpacing;
            }
        }
        if (this.selfRole.jumpSpeed <= 0) {
            for (ladder of this.floors) {
                if (btmY >= ladder.y &&
                    ladder.y >= this.selfRole.footY &&
                    (this.selfRole.x + this.selfRole.width >= ladder.x || this.selfRole.x <= ladder.x + ladder.width)) {
                    clearInterval(this.selfRole.jumpTimer);
                    this.selfRole.jumpTimer = undefined;
                    break;
                }
            }
            if (btmY >= this.stageHeight - this.floorHeight) {
                clearInterval(this.selfRole.jumpTimer);
                this.selfRole.jumpTimer = undefined;
            }
        }
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
