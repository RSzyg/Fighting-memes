import Block from "./Block";
import Circle from "./Circle";
import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";
import Weapon from "./Weapon";

export default class Main {
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
        this.socket = io.connect(window.location.host);

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
            alert("you have been diconnect");
        });

        this.socket.on("player left", (data: string) => {
            const id = JSON.parse(data).id;
            this.stage.removeChild(this.Roles[id].element);

            // clear role's timer
            if (this.Roles[id].verticalTimer) {
                clearInterval(this.Roles[id].verticalTimer);
            }

            delete this.Roles[id];
        });

        this.socket.on("jump", (data: string) => {
            this.jumpPreTreat(JSON.parse(data).id);
        });

        this.socket.on("move", (data: string) => {
            this.moveTreat(JSON.parse(data).id, JSON.parse(data).isRight);
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

        setInterval(() => {
            console.log(this.Roles[this.selfId].i, this.Roles[this.selfId].j);
        }, 3000);

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
        const y: number = role.y;
        const x: number = role.x;

        this.Roles[id] = new Role(role.type, role.color, x, y);
        this.stage.add(this.Roles[id].element);

        // add block pos into role
        const i: number = Math.floor(this.Roles[id].y / this.blockThickness);
        this.Roles[id].i = i;
        this.Roles[id].j = role.j;

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
            this.moveTreat(this.selfId, true);
        } else if (e.keyCode === 37) {
            const data = {
                id: this.selfId,
                isRight: false,
            };
            this.socket.emit("to move", JSON.stringify(data));
            this.moveTreat(this.selfId, false);
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
    private moveTreat(id: string, isRight: boolean) {
        if (this.Roles[id]) {
            const moveSpeed = (2 * Number(isRight) - 1) * this.Roles[id].moveSpeed;
            let nextX: number = this.Roles[id].x + moveSpeed;
            nextX = this.impactJudge(nextX, this.Roles[id].width, Number(isRight), id);

            // update role's pos
            this.Roles[id].x = (nextX + this.stageWidth) % this.stageWidth;

            // update role's block pos
            const j: number = Math.floor(this.Roles[id].x / this.blockThickness);
            this.Roles[id].j = j;

            this.fallJudge(id, isRight);
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
            this.Roles[id].x = this.impactJudge(this.Roles[id].x, nextWidth, 1, id);
            this.Roles[id].width = nextWidth;
            }
    }
    /**
     * prepare to fall
     * @param id id of players'role
     */
    private fallPreTreat(id: string) {
        if (this.Roles[id]) {
            let x: number = this.Roles[id].x;
            // under foot block
            const i: number = this.Roles[id].i + 2;
            // left block
            const j1: number = Math.floor(x / this.blockThickness);
            // right block
            x += this.Roles[id].width;
            const j2: number = Math.floor(x / this.blockThickness);

            if (
                this.map[i] === undefined ||
                (
                    this.map[i][j1] === " " &&
                    this.map[i][j1] === this.map[i][j2]
                )
            ) {
                this.Roles[id].i++;
                this.Roles[id].i %= this.map.length;
                this.Roles[id].jumpSpeed = 0;
                this.Roles[id].verticalTimer = setInterval(
                    () => this.RolesVerticalMove(id),
                    this.interval,
                );
            }
        }
    }

    private impactJudge(nextX: number, nextWidth: number, isRight: number, id: string) {
        if (this.Roles[id]) {
            let x: number = nextX;
            // head block
            const i1: number = Math.floor(this.Roles[id].y / this.blockThickness);
            // foot block
            const i2: number = Math.floor(this.Roles[id].footY / this.blockThickness);
            // left block
            let j1: number = Math.floor(x / this.blockThickness);
            // right block
            x += nextWidth;
            let j2: number = Math.floor(x / this.blockThickness);

            j1 = (j1 + this.map[0].length) % this.map[0].length;
            j2 = (j2 + this.map[0].length) % this.map[0].length;

            const j = isRight ? j2 : j1;

            for (let i = i1; i <= i2; i++) {
                if (this.map[i] === undefined) {
                    break;
                }
                if (
                    (
                        this.map[i][j] !== "T" &&
                        this.map[i][j] !== "t" &&
                        this.map[i][j] !== " "
                    )
                ) {
                    if (
                        this.Roles[id].footY !== i * this.blockThickness
                        &&
                        j1 === j2 - 1
                    ) {
                        if (this.map[i][j1] !== " " && this.map[i][j2] !== " ") {
                            return this.Roles[id].x;
                        } else {
                            return j2 * this.blockThickness - isRight * nextWidth;
                        }
                    }
                }
            }
        }
        return nextX;
    }

    private fallJudge(id: string, isRight: boolean) {
        if (this.Roles[id]) {
            let x: number = this.Roles[id].x;
            const i: number = Math.floor(this.Roles[id].footY / this.blockThickness);
            const j1: number = Math.floor(x / this.blockThickness);
            x += this.Roles[id].width;
            const j2: number = Math.floor(x / this.blockThickness);

            if (this.map[i] === undefined) {
                return;
            }
            if (this.map[i][j1] === " " && this.map[i][j1] === this.map[i][j2]) {
                if (!this.Roles[id].verticalTimer) {
                    this.Roles[id].i++;
                    this.Roles[id].i %= this.map.length;
                    this.Roles[id].jumpSpeed = 0;
                    this.Roles[id].verticalTimer = setInterval(
                        () => this.RolesVerticalMove(id),
                        this.interval,
                    );
                }
            }
        }
    }
    /**
     * handling jumping and falling action of roles
     */
    private RolesVerticalMove(id: string) {
        if (!this.Roles[id]) {
            return;
        }
        let i: number;
        let nextY: number = this.Roles[id].y - this.Roles[id].jumpSpeed;
        let x: number = this.Roles[id].x;
        this.Roles[id].jumpSpeed -= this.Roles[id].weight;
        if (nextY < 0 || nextY > this.stageHeight) {
            nextY = (nextY + this.stageHeight) % this.stageHeight;
        }
        if (this.Roles[id].jumpSpeed > 0) {
            // rise up part

            // head block
            i = Math.floor(nextY / this.blockThickness);
            // left block
            const j1: number = Math.floor(x / this.blockThickness);
            // right block
            x += this.Roles[id].width;
            const j2: number = Math.floor(x / this.blockThickness);

            if (this.map[i]) {
                if (
                    (this.map[i][j1] !== " " &&
                    this.map[i][j1] !== "T" &&
                    this.map[i][j1] !== "~" &&
                    this.map[i][j1] !== "t")
                    ||
                    (x !== j2 * this.blockThickness &&
                    this.map[i][j2] !== undefined &&
                    this.map[i][j2] !== " " &&
                    this.map[i][j2] !== "T" &&
                    this.map[i][j2] !== "~" &&
                    this.map[i][j2] !== "t")
                ) {
                    this.Roles[id].jumpSpeed = 0;
                    nextY = (i + 1) * this.blockThickness;
                }
            }
        } else if (this.Roles[id].jumpSpeed <= 0) {
            // fall down part

            // foot block
            i = Math.floor((nextY + this.Roles[id].height) / this.blockThickness);
            // left block
            let j1: number = Math.floor(x / this.blockThickness);
            // right block
            x += this.Roles[id].width;
            let j2: number = Math.floor(x / this.blockThickness);

            j1 = (j1 + this.map[0].length) % this.map[0].length;
            j2 = (j2 + this.map[0].length) % this.map[0].length;

            if (
                this.map[i] &&
                this.Roles[id].footY < i * this.blockThickness
            ) {
                if (
                    this.map[i][j1] !== " " ||
                    this.map[i][j2] !== " " &&
                    x !== j2 * this.blockThickness
                ) {
                    nextY = i * this.blockThickness - this.Roles[id].height;
                    clearInterval(this.Roles[id].verticalTimer);
                    this.Roles[id].verticalTimer = undefined;
                }
            }
        }
        this.Roles[id].y = nextY;

        // update role's block pos
        i = Math.floor(this.Roles[id].y / this.blockThickness);
        this.Roles[id].i = i;
    }
}
