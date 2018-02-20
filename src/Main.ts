import Block from "./Block";
import Circle from "./Circle";
import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";
import Weapon from "./Weapon";

class Main {
    private stage: Stage; // the svg element
    private floors: Floor[]; // all floors
    private stageWidth: number; // svg width
    private stageHeight: number; // svg height
    private stageColor: string; // svg background color
    private blockThickness: number; // the height floors = the vertical spacing of the floors
    private interval: number; // time interval of setInterval
    private Roles: {[key: string]: Role}; // all roles
    private selfId: string;
    private transferCoef: number; // roles' transfer coefficient when squating
    private map: string[];
    private socket: SocketIOClient.Socket;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.Roles = {};
        this.map = [];
    }
    /**
     * basic initial
     */
    public createScene() {
        this.socket = io.connect("http://localhost:" + 2333);

        this.socket.on("init", (data: string) => {
            const initData = JSON.parse(data);
            this.stageWidth = this.stage.width = initData.stageWidth;
            this.stageHeight = this.stage.height = initData.stageHeight;
            this.stageColor = this.stage.color = initData.stageColor;
            this.interval = initData.interval;
            this.transferCoef = initData.transferCoef;
            this.blockThickness = initData.blockThickness;
            this.map = initData.map;

            this.renderMap();

            this.socket.emit("loaded");
        });

        const circle: Circle = new Circle(100, 0, 100);
        this.stage.add(circle);
        circle.fill = "red";

        this.socket.on("createRole", (data: string) => {
            this.selfId = JSON.parse(data).selfId;

            const allRoles = JSON.parse(data).allRoles;
            for (const key in allRoles) {
                if (key) {
                    this.createRole(key, allRoles[key]);
                }
            }
        });

        this.socket.on("addRole", (data: string) => {
            const newRole = JSON.parse(data);
            this.createRole(newRole.id, newRole);
        });

        this.socket.on("disconnect", () => {
            console.log("you have been diconnect");
        });

        this.socket.on("player left", (data: string) => {
            const id = JSON.parse(data).id;
            clearInterval(this.Roles[id].verticalTimer);
            this.stage.removeChild(this.Roles[id].element);
            delete this.Roles[id];
        });

        this.socket.on("jump", (data: string) => {
            this.jumpPreTreat(JSON.parse(data).id);
        });

        this.socket.on("move", (data: string) => {
            this.movePreTreat(JSON.parse(data).id, JSON.parse(data).isRight);
        });

        this.socket.on("squat", (data: string) => {
            this.squatTreat(JSON.parse(data).id, true);
        });

        this.socket.on("stand", (data: string) => {
            this.squatTreat(JSON.parse(data).id, false);
        });

        this.socket.on("fall", (data: string) => {
            this.fallPreTreat(JSON.parse(data).id);
        });

        document.addEventListener("keydown", (e) => this.keyboardController(e));
        document.addEventListener("keyup", (e) => this.keyboardController(e));
    }
    /**
     * render the map
     */
    private renderMap() {
        for (let i: number = 0; i < this.map.length; i++) {
            const y: number = i * this.blockThickness;
            for (let j: number = 0; j < this.map[0].length; j++) {
                let x: number = j * this.blockThickness;
                if (this.map[i][j] === "X") {
                    const blocksNum = this.map[i].indexOf("x", j + 1) - j + 1;
                    const floorWidth = this.blockThickness * blocksNum;
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, 0);

                    let block: Block;
                    while (this.map[i][j] !== "x") {
                        x = j * this.blockThickness;
                        block = floor.addBlock(x, y, "#ffffff", "#000000", 2);
                        this.stage.add(block.element);
                        j++;
                    }
                    x = j * this.blockThickness;
                    block = floor.addBlock(x, y, "#ffffff", "#000000", 2);
                    this.stage.add(block.element);

                    this.floors.push(floor);

                } else if (this.map[i][j] === "T") {
                    const blocksNum = this.map[i].indexOf("t", j + 1) - j + 1;
                    const floorWidth = this.blockThickness * blocksNum;
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, 1);

                    let block: Block;
                    while (this.map[i][j] !== "t") {
                        x = j * this.blockThickness;
                        block = floor.addBlock(x, y, "#42426F", "#000000", 2);
                        this.stage.add(block.element);
                        j++;
                    }
                    x = j * this.blockThickness;
                    block = floor.addBlock(x, y, "#42426F", "#000000", 2);
                    this.stage.add(block.element);

                    this.floors.push(floor);
                }
            }
        }
    }
    /**
     * create a role
     * @param role role info
     */
    private createRole(id: string, role: {[key: string]: any}) {
        this.Roles[id] = new Role(role.type, role.color, role.x, role.y);
        this.stage.add(this.Roles[id].element);
        for (const floor of this.floors) {
            if (
                role.y + this.Roles[id].height === floor.y &&
                role.x + this.Roles[id].width > floor.x &&
                role.x < floor.x + floor.width
            ) {
                this.Roles[id].floor = floor;
                this.Roles[id].ladderY = floor.y;
            }
        }

        // this.Roles[id].weapon = new Weapon(0, this.Roles[id].x, this.Roles[id].y);
        // this.stage.addImage(this.Roles[id].weapon.image);
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
                    if (!this.Roles[this.selfId].rightTimer) {
                        this.Roles[this.selfId].rightTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 37:
                    if (!this.Roles[this.selfId].leftTimer) {
                        this.Roles[this.selfId].leftTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 40:
                    if (!this.Roles[this.selfId].squatTrans) {
                        this.socket.emit("to squat", JSON.stringify({ id: this.selfId }));
                        this.squatTreat(this.selfId, true);
                    }
                    break;
                case 38:
                    if (!this.Roles[this.selfId].upTimer) {
                        this.Roles[this.selfId].upTimer = setInterval(
                            () => this.RolesMove(e),
                            this.interval,
                        );
                    }
                    break;
                case 88:
                    if (
                        this.Roles[this.selfId].squatTrans &&
                        !this.Roles[this.selfId].downTimer
                    ) {
                        this.Roles[this.selfId].downTimer = setInterval(
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
                    clearInterval(this.Roles[this.selfId].rightTimer);
                    this.Roles[this.selfId].rightTimer = undefined;
                    break;
                case 37:
                    clearInterval(this.Roles[this.selfId].leftTimer);
                    this.Roles[this.selfId].leftTimer = undefined;
                    break;
                case 40:
                    this.socket.emit("to stand", JSON.stringify({ id: this.selfId }));
                    this.squatTreat(this.selfId, false);
                    break;
                case 38:
                    clearInterval(this.Roles[this.selfId].upTimer);
                    this.Roles[this.selfId].upTimer = undefined;
                    break;
                case 88:
                    clearInterval(this.Roles[this.selfId].downTimer);
                    this.Roles[this.selfId].downTimer = undefined;
                    break;
                default:
                    break;
            }
        }
    }
    /**
     * handling movement action of roles
     */
    private RolesMove(e: KeyboardEvent) {
        if (e.keyCode === 39) {
            const data = {
                id: this.selfId,
                isRight: true,
            };
            this.socket.emit("to move", JSON.stringify(data));
            this.movePreTreat(this.selfId, true);
        } else if (e.keyCode === 37) {
            const data = {
                id: this.selfId,
                isRight: false,
            };
            this.socket.emit("to move", JSON.stringify(data));
            this.movePreTreat(this.selfId, false);
        } else if (e.keyCode === 38) {
            if (this.Roles[this.selfId].verticalTimer === undefined) {
                this.socket.emit("to jump", JSON.stringify({ id: this.selfId }));
                this.jumpPreTreat(this.selfId);
            }
        } else if (e.keyCode === 88) {
            if (!this.Roles[this.selfId].verticalTimer) {
                this.socket.emit("to fall", JSON.stringify({ id: this.selfId }));
                this.fallPreTreat(this.selfId);
            }
        }
    }
    /**
     * prepare to jump
     * @param id id of players' role
     */
    private jumpPreTreat(id: string) {
        if (this.Roles[id]) {
            this.Roles[id].jumpSpeed = this.Roles[id].power;
            this.Roles[id].verticalTimer = setInterval(
                () => this.RolesVerticalMove(id),
                this.interval,
            );
        }
    }
    /**
     * prepare to move and dicide if fall
     * @param id id of player's role
     * @param isRight moveRight or moveLeft
     */
    private movePreTreat(id: string, isRight: boolean) {
        if (this.Roles[id]) {
            const moveSpeed = (2 * Number(isRight) - 1) * this.Roles[id].moveSpeed;
            let nextX: number = this.Roles[id].x + moveSpeed;
            nextX = this.RolesWillImpactWall(nextX, this.Roles[id].width, Number(isRight), id);
            this.Roles[id].x = (nextX + this.stageWidth) % this.stageWidth;
            this.RolesWillFall(id);
        }
    }
    /**
     * squat down and body transfer
     * @param id id of players' role
     * @param isDown squat down or stand up
     */
    private squatTreat(id: string, isDown: boolean) {
        if (this.Roles[id]) {
            const transferCoef: number = (2 * Number(isDown) - 1) * this.transferCoef;
            this.Roles[id].height -= transferCoef;
            this.Roles[id].squatTrans = isDown;
            const nextWidth: number = this.Roles[id].width + transferCoef;
            this.Roles[id].x = this.RolesWillImpactWall(this.Roles[id].x, nextWidth, 1, id);
            this.Roles[id].width = nextWidth;
            }
    }
    /**
     * prepare to fall
     * @param id id of players'role
     */
    private fallPreTreat(id: string) {
        if (this.Roles[id]) {
            const i: number = this.Roles[id].floor.y / this.blockThickness + 1;
            const j: number = Math.floor(this.Roles[id].x / this.blockThickness);
            if (
                this.map[i] === undefined ||
                this.map[i][j] === " "
            ) {
                this.Roles[id].jumpSpeed = 0;
                this.Roles[id].ladderY += this.blockThickness;
                this.Roles[id].verticalTimer = setInterval(
                    () => this.RolesVerticalMove(id),
                    this.interval,
                );
            }
        }
    }

    private RolesWillImpactWall(nextX: number, nextWidth: number, isRight: number, id: string) {
        for (const floor of this.floors) {
            if (
                this.Roles[id].footY > floor.y &&
                this.Roles[id].y < floor.y + this.blockThickness &&
                nextX + nextWidth > floor.x &&
                nextX < floor.x + floor.width &&
                ((this.Roles[id].x >= floor.x + floor.width) ||
                    (this.Roles[id].x + this.Roles[id].width <= floor.x))
            ) {
                return floor.x - isRight * nextWidth + (1 - isRight) * floor.width;
            }
        }
        return nextX;
    }

    private RolesWillFall(id: string) {
        if (
            !this.Roles[id].verticalTimer &&
            (this.Roles[id].x > this.Roles[id].floor.x + this.Roles[id].floor.width ||
                this.Roles[id].x + this.Roles[id].width < this.Roles[id].floor.x)
        ) {
            this.Roles[id].jumpSpeed = 0;
            this.Roles[id].ladderY += this.blockThickness;
            this.Roles[id].verticalTimer = setInterval(
                () => this.RolesVerticalMove(id),
                this.interval,
            );
        }
    }
    /**
     * handling jumping and falling action of roles
     */
    private RolesVerticalMove(id: string) {
        if (!this.Roles[id]) {
            return;
        }
        let nextY: number = this.Roles[id].y
        - this.Roles[id].jumpSpeed;
        let cross: boolean = false;
        this.Roles[id].jumpSpeed -= this.Roles[id].weight;
        if (nextY !==
            (nextY + this.stageHeight)
            % this.stageHeight ||
            nextY + this.Roles[id].height !==
            (nextY + this.stageHeight + this.Roles[id].height)
            % this.stageHeight
        ) {
            nextY = (nextY + this.stageHeight) % this.stageHeight;
            cross = true;
        }
        if (this.Roles[id].jumpSpeed > 0) {
            // rise up part
            if (nextY <= this.Roles[id].ladderY) {
            // if (nextY <= this.Roles[id].ladderY - 2 * this.blockThickness) probably wrong
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[id].x < floor.x + floor.width
                        &&
                        this.Roles[id].x + this.Roles[id].width > floor.x
                        &&
                        nextY + this.Roles[id].jumpSpeed > floor.y
                        &&
                        nextY <= floor.y + this.blockThickness
                        &&
                        floor.type !== 1
                    ) {
                        this.Roles[id].jumpSpeed = 0;
                        nextY = floor.y + this.blockThickness;
                        isFind = true;
                        break;
                    }
                }
                if (!isFind) {
                    // update ladderY
                    this.Roles[id].ladderY -= this.blockThickness;
                }
            }
            this.Roles[id].y = nextY;
            if (cross === true) {
                this.Roles[id].ladderY = this.stageHeight - this.blockThickness;
            }
        } else if (this.Roles[id].jumpSpeed <= 0) {
            // fall down part
            if (
                nextY + this.Roles[id].height >=
                this.Roles[id].ladderY
            ) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[id].x < floor.x + floor.width
                        &&
                        this.Roles[id].x + this.Roles[id].width > floor.x
                        &&
                        nextY + this.Roles[id].jumpSpeed + this.Roles[id].height
                        < floor.y
                        &&
                        nextY + this.Roles[id].height >= floor.y
                    ) {
                        nextY = floor.y - this.Roles[id].height;
                        isFind = true;
                        this.Roles[id].floor = floor;
                        this.Roles[id].ladderY = floor.y;
                        clearInterval(this.Roles[id].verticalTimer);
                        this.Roles[id].verticalTimer = undefined;
                        break;
                    }
                }
                if (!isFind) {
                    // update ladderY
                    this.Roles[id].ladderY += this.blockThickness;
                }
            }
            this.Roles[id].y = nextY;
            if (cross === true) {
                this.Roles[id].ladderY = this.blockThickness;
            }
        }
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
