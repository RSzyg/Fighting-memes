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
                    if (!this.selfRole.downTimer) {
                        this.selfRole.downTimer = setInterval(
                            () => this.selfRoleMove(e),
                            this.interval,
                        );
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
                    clearInterval(this.selfRole.downTimer);
                    this.selfRole.downTimer = undefined;
                    break;
                case 38:
                    clearInterval(this.selfRole.upTimer);
                    this.selfRole.upTimer = undefined;
                    break;
            }
        }
    }

    private selfRoleMove(e: KeyboardEvent) {
        if (e.keyCode === 39) {
            const nextX: number = this.selfRole.x + this.selfRole.moveSpeed;
            this.selfRole.x = nextX % this.stageWidth;
        } else if (e.keyCode === 37) {
            const nextX: number = this.selfRole.x - this.selfRole.moveSpeed;
            this.selfRole.x = (nextX + this.stageWidth) % this.stageWidth;
        } else if (e.keyCode === 38) {
            if (this.selfRole.jumpTimer === undefined) {
                this.selfRole.jumpSpeed = this.selfRole.power;
                this.selfRole.jumpTimer = setInterval(
                    () => this.selfRoleJump(),
                    this.interval,
                );
            }
        }
    }

    // private selfRoleFall() {
    //     this.selfRole.jumpSpeed += this.selfRole.weight;
    //     let nextY: number = this.selfRole.y + this.selfRole.jumpSpeed;
    //     if (
    //         nextY + this.selfRole.height >=
    //         this.selfRole.footY + this.verticalSpacing
    //     ) {
    //         let isFind: boolean = false;
    //         for (const floor of this.floors) {
    //             if (
    //                 this.selfRole.x < floor.x + floor.width &&
    //                 this.selfRole.x - this.selfRole.width > floor.x
    //             ) {
    //                 nextY = floor.y;
    //                 isFind = true;
    //                 clearInterval(this.selfRole.fallTimer);
    //                 this.selfRole.fallTimer = undefined;
    //                 break;
    //             }
    //         }
    //         if (!isFind) {
    //             this.selfRole.footY += this.verticalSpacing;
    //         }
    //     }
    //     this.selfRole.y = nextY;
    // }

    private selfRoleJump() {
        let nextY: number = this.selfRole.y - this.selfRole.jumpSpeed;
        this.selfRole.jumpSpeed -= this.selfRole.weight;
        // console.log(this.selfRole.y);
        // console.log(this.selfRole.jumpSpeed);
        if (this.selfRole.jumpSpeed > 0) {
            if (
                nextY <=
                this.selfRole.ladderY - this.verticalSpacing + this.floorHeight
            ) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.selfRole.x < floor.x + floor.width &&
                        this.selfRole.x - this.selfRole.width > floor.x &&
                        this.selfRole.y > floor.y &&
                        nextY <= floor.y + this.floorHeight
                    ) {
                        this.selfRole.jumpSpeed = -this.selfRole.jumpSpeed;
                        this.selfRole.jumpSpeed -= 2 * this.selfRole.weight;
                        isFind = true;
                        return;
                    }
                }
                // if (!isFind) {
                //     this.selfRole.ladderY -= this.verticalSpacing;
                // }
            }
            this.selfRole.y = nextY;
        } else if (this.selfRole.jumpSpeed <= 0) {
        /*
        calcualte footY
        */
        // if (this.selfRole.jumpSpeed === 0) {
        //     let cell: number;
        //     let re: number;
        //     cell = (this.stageHeight - this.selfRole.footY) / (this.verticalSpacing + this.floorHeight);
        //     re = (this.stageHeight - this.selfRole.footY) % (this.verticalSpacing + this.floorHeight);
        //     if (re > this.floorHeight) {
        //         this.selfRole.footY = this.stageHeight -
        //         cell * (this.verticalSpacing + this.floorHeight) - this.verticalSpacing;
        //     } else {
        //         this.selfRole.footY = this.stageHeight -
        //         (cell - 1) * (this.verticalSpacing + this.floorHeight) - this.verticalSpacing;
        //     }
        // }
        /*
        hit
        */
            // if (
            //     nextY + this.selfRole.height >=
            //     this.selfRole.ladderY + this.verticalSpacing
            // ) {
            //     let isFind: boolean = false;
            //     for (const floor of this.floors) {
            //         if (
            //             this.selfRole.x < floor.x + floor.width &&
            //             this.selfRole.x - this.selfRole.width > floor.x
            //         ) {
            //             nextY = floor.y - this.selfRole.height;
            //             isFind = true;
            //             clearInterval(this.selfRole.jumpTimer);
            //             this.selfRole.jumpTimer = undefined;
            //             break;
            //         }
            //     }
            //     if (!isFind) {
            //         this.selfRole.ladderY += this.verticalSpacing;
            //     }
            // }
            this.selfRole.y = nextY;
            // for (ladder of this.floors) {
            //     if (this.selfRole.footY >= ladder.y &&
            //         ladder.y >= this.selfRole.footY &&
            //         this.selfRole.x + this.selfRole.width >= ladder.x &&
            //         this.selfRole.x <= ladder.x + ladder.width) {
            //         // deal data deviation
            //         this.selfRole.y = ladder.y - this.selfRole.height;
            //         clearInterval(this.selfRole.jumpTimer);
            //         this.selfRole.jumpTimer = undefined;
            //         break;
            //     } else {
            //         this.selfRole.y = nextY;
            //     }
            // }
            // if (this.selfRole.footY >= this.stageHeight - this.floorHeight) {
            //     clearInterval(this.selfRole.jumpTimer);
            //     this.selfRole.jumpTimer = undefined;
            // } else {
            //     this.selfRole.y = nextY;
            // }
        } else {
            this.selfRole.y = nextY;
        }
        if (this.selfRole.jumpSpeed === -this.selfRole.power) {
            this.selfRole.y -= this.selfRole.jumpSpeed;
            clearInterval(this.selfRole.jumpTimer);
            this.selfRole.jumpTimer = undefined;
        }
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
