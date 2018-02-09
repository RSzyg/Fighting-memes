import Circle from "./Circle";
import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

class Main {
    private stage: Stage; // the svg element
    private floors: Floor[]; // all floors
    private stageWidth: number; // svg width
    private stageHeight: number; // svg height
    private interval: number; // time interval of setInterval
    private Roles: Role[]; // all roles
    private transferCoef: number; // roles' transfer coefficient when squating
    // private verticalSpacing: number; // the vertical spacing of the floors
    // private floorHeight: number; // the height floors
    private blockThickness: number; // the height floors = the vertical spacing of the floors
    private map: string[];
    private socket: SocketIOClient.Socket;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.Roles = [];
        this.stageWidth = 1920;
        this.stageHeight = 960;
        this.interval = 17;
        this.transferCoef = 16;
        // this.verticalSpacing = 250;
        // this.floorHeight = 35;
        this.blockThickness = 60;
        this.map = [
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
            "                                ",
        ];
    }
    /**
     * basic initial
     */
    public newMap() {
        const map: string[] = this.map;
        const strLength: number = map[0].length;
        for (let i: number = 0; i < map.length / 4; i++) {
            let str1: string = "";
            let str2: string = "";
            let floorStart: number = Math.floor(Math.random() * 3);
            for (let k: number = 0; k < floorStart; k++) {
                str1 += " ";
                str2 += " ";
            }
            for (; floorStart < strLength;) {
                const floorLength = (Math.floor((Math.random()) * 2 + 1)) * (Math.floor(Math.random() * 4) + 4);
                let extra: string;
                let posS: number;
                let posE: number;
                if (floorLength >= 10) {
                    if (Math.random() >= 0.7) {
                        extra = "wall";
                        posS = floorStart + Math.floor(floorLength / 2);
                        posE = posS + 1;
                    } else if (Math.random() >= 0.7) {
                        extra = "fort";
                        posS = floorStart + Math.floor(floorLength / 3);
                        posE = posS + Math.floor(floorLength / 3);
                    }
                }
                str1 += "X";
                str2 += " ";
                let k: number = floorStart + 1;
                for (; k < Math.min(floorStart + floorLength, strLength) - 1; k++) {
                    str1 += "x";
                    if (!extra) {
                        str2 += " ";
                    } else {
                        if (k > posS && k < posE) {
                            str2 += "x";
                        } else if (k === posS || k === posE) {
                            str2 += (k === posS) ? "X" : "Y";
                        } else {
                            str2 += " ";
                        }
                    }
                }
                str1 += "Y";
                str2 += " ";
                floorStart += floorLength + Math.floor(Math.random() * 3) + 1;
                for (; k < Math.min(floorStart, strLength); k++) {
                    str1 += " ";
                    str2 += " ";
                }
                if (floorStart >= strLength - 2) {
                    if (floorStart < strLength) {
                        break;
                    }
                }
                map[4 * i + 3] = str1;
                map[4 * i + 2] = str2;
                if (extra === "wall") {
                    map[4 * i + 1] = str2;
                    map[4 * i] = str2;
                }
            }
        }
        return map;
    }
    public createScene() {
        this.socket = io.connect("http://localhost:" + 2333);
        this.socket.on("news", (data: string) => {
            console.log(JSON.parse(data));
            this.socket.emit("my other event", JSON.stringify({ my: "data" }));
        });

        const circle: Circle = new Circle(100, 0, 100);
        this.stage.add(circle);
        circle.fill = "red";

        this.stage.color = "#e8e8e8";
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.map = this.newMap();
        for (let i: number = 0; i < this.map.length; i++) {
            for (let j: number = 0; j < this.map[0].length; j++) {
                if (this.map[i][j] === "X") {
                    const x: number = j * this.blockThickness;
                    const y: number = i * this.blockThickness;
                    const floorWidth = this.blockThickness * (this.map[i].indexOf("Y", j + 1) - j + 1);
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, "basic");
                    this.floors.push(floor);
                }
                if (
                    this.map[i][j] === "X" ||
                    this.map[i][j] === "x" ||
                    this.map[i][j] === "Y"
                ) {
                    const x: number = j * this.blockThickness;
                    const y: number = i * this.blockThickness;
                    const floor: Floor = new Floor(x, y, this.blockThickness, this.blockThickness, "basic");
                    floor.setFillColor("#ffffff");
                    floor.setStroke("#000000", 2);
                    this.stage.add(floor.element);
                }
            }
        }
        this.createRole(this.map.length * this.blockThickness - this.blockThickness);
        // const groundY = this.stageHeight - this.floorHeight;
        // let y: number = groundY - this.verticalSpacing;
        // for (; y > 0; y -= this.verticalSpacing) {
        //     let rs: number = Math.floor(Math.random() * 200);
        //     while (rs < this.stageWidth) {
        //         let re = rs + Math.floor(Math.random() * 800) + 300;
        //         if (re > this.stageWidth) {
        //             re = this.stageWidth;
        //             if (re - rs < 200) {
        //                 rs = re;
        //                 continue;
        //             }
        //         }
        //         const floor: Floor = new Floor(rs, y, re - rs, this.floorHeight, "basic");
        //         floor.setFillColor("#ffffff");
        //         floor.setStroke("#000000", 2);
        //         this.floors.push(floor);
        //         this.stage.add(floor.element);
        //         rs = re + Math.floor(Math.random() * 300) + 200;
        //     }
        // }
        // const ground: Floor = new Floor(0, groundY, this.stageWidth, this.floorHeight, "basic");
        // ground.setFillColor("#ffffff");
        // ground.setStroke("#000000", 2);
        // this.floors.push(ground);
        // this.stage.add(ground.element);

        // this.createRole(groundY);
        document.addEventListener("keydown", (e) => this.keyboardController(e));
        document.addEventListener("keyup", (e) => this.keyboardController(e));
    }
    /**
     * create a role
     * @param groundY y coordinate of the first floor
     */
    private createRole(groundY: number) {
        const random = Math.floor(Math.random() * (this.floors.length - 1));
        const bornFloor: Floor = this.floors[random];
        this.Roles[0] = new Role(bornFloor, 0, "#66ccff");
        this.stage.add(this.Roles[0].element);
    }
    /**
     * handling the keyboard event
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
                    if (!this.Roles[0].squatTrans) {
                        this.Roles[0].height -= this.transferCoef;
                        this.Roles[0].width += this.transferCoef;
                        this.Roles[0].squatTrans = true;
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
                    if (this.Roles[0].squatTrans && !this.Roles[0].downTimer) {
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
                    this.Roles[0].squatTrans = false;
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
    /**
     * handling movement action of roles
     */
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
            if (this.Roles[0].verticalTimer === undefined) {
                this.Roles[0].jumpSpeed = this.Roles[0].power;
                this.Roles[0].verticalTimer = setInterval(
                    () => this.RolesVerticalMove(),
                    this.interval,
                );
            }
        } else if (e.keyCode === 88) {
            if (!this.Roles[0].verticalTimer) {
                this.Roles[0].jumpSpeed = 0;
                this.Roles[0].ladderY += this.blockThickness;
                // this.Roles[0].ladderY += this.verticalSpacing;
                this.Roles[0].verticalTimer = setInterval(
                    () => this.RolesVerticalMove(),
                    this.interval,
                );
            }
        }
    }

    private RolesWillFall() {
        if (
            !this.Roles[0].verticalTimer &&
            (this.Roles[0].x > this.Roles[0].floor.x + this.Roles[0].floor.width ||
                this.Roles[0].x + this.Roles[0].width < this.Roles[0].floor.x)
        ) {
            this.Roles[0].jumpSpeed = 0;
            this.Roles[0].ladderY += this.blockThickness;
            this.Roles[0].verticalTimer = setInterval(
                () => this.RolesVerticalMove(),
                this.interval,
            );
        }
    }
    private RolesWillImpactWall(nextX: number, isRight: number) {
        for (const floor of this.floors) {
            if (
                this.Roles[0].y > floor.y - this.Roles[0].height &&
                this.Roles[0].footY < floor.y + this.blockThickness + this.Roles[0].height &&
                nextX + this.Roles[0].width > floor.x &&
                nextX < floor.x + floor.width &&
                ((this.Roles[0].x >= floor.x + floor.width) ||
                    (this.Roles[0].x + this.Roles[0].width <= floor.x))
            ) {
                return isRight * (floor.x - this.Roles[0].width) + (1 - isRight) * (floor.x + floor.width);
            }
        }
        return nextX;
    }
    /**
     * handling jumping and falling action of roles
     */
    private RolesVerticalMove() {
        let nextY: number = this.Roles[0].y - this.Roles[0].jumpSpeed;
        let cross: boolean = false;
        if (nextY !== (nextY + this.stageHeight) % this.stageHeight ||
            nextY + this.Roles[0].height !==
            (nextY + this.stageHeight + this.Roles[0].height) % this.stageHeight
        ) {
            nextY = (nextY + this.stageHeight) % this.stageHeight;
            cross = true;
        }
        this.Roles[0].jumpSpeed -= this.Roles[0].weight;
        if (this.Roles[0].jumpSpeed > 0) {
            // rise up part
            {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[0].x < floor.x + floor.width &&
                        this.Roles[0].x + this.Roles[0].width > floor.x &&
                        this.Roles[0].y > floor.y &&
                        nextY <= floor.y + this.blockThickness
                    ) {
                        this.Roles[0].jumpSpeed = 0;
                        nextY = floor.y + this.blockThickness;
                        isFind = true;
                        break;
                    }
                }
                if (!isFind) {
                    // update ladderY
                    this.Roles[0].ladderY -= this.blockThickness;
                }
            }
            this.Roles[0].y = nextY;
            if (cross === true) {
                this.Roles[0].ladderY = this.stageHeight - this.blockThickness;
            }
        } else if (this.Roles[0].jumpSpeed <= 0) {
            // fall down part
            if (nextY + this.Roles[0].height >= this.Roles[0].ladderY) {
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
                        clearInterval(this.Roles[0].verticalTimer);
                        this.Roles[0].verticalTimer = undefined;
                        break;
                    }
                }
                if (!isFind) {
                    // update ladderY
                    this.Roles[0].ladderY += this.blockThickness;
                }
            }
            this.Roles[0].y = nextY;
            if (cross === true) {
                this.Roles[0].ladderY = this.blockThickness;
            }
        }
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
