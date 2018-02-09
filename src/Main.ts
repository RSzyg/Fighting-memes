import Circle from "./Circle";
import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

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
        // this.stageWidth = 1920;
        // this.stageHeight = 1080;
        // this.blockThickness = 250;
        // this.floorHeight = 35;
        // this.interval = 17;
        // this.transferCoef = 16;
    }
    /**
     * basic initial
     */
    public createScene() {
        this.socket = io.connect("http://localhost:" + 2333);

        this.socket.on("init", (data: string) => {
            const initData = JSON.parse(data);
            console.log(initData);
            this.stageWidth = this.stage.width = initData.stageWidth;
            this.stageHeight = this.stage.height = initData.stageHeight;
            this.stageColor = this.stage.color = initData.stageColor;
            this.interval = initData.interval;
            this.transferCoef = initData.transferCoef;
            this.blockThickness = initData.blockThickness;
            this.map = initData.map;
            this.renderMap();
            this.socket.emit("my other event", JSON.stringify({ my: "data" }));
        });

        const circle: Circle = new Circle(100, 0, 100);
        this.stage.add(circle);
        circle.fill = "red";

        this.socket.emit("loaded");

        this.socket.on("createRole", (data: string) => {
            const allRoles = JSON.parse(data).allRoles;
            for (let i = allRoles.length - 1; i >= 0; i--) {
                if (i === allRoles.length - 1) {
                    this.selfId = allRoles[i].id;
                }
                this.createRole(allRoles[i]);
            }
        });

        this.socket.on("addRole", (newRole: string) => {
            this.createRole(JSON.parse(newRole));
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
            for (let j: number = 0; j < this.map[0].length; j++) {
                const x: number = j * this.blockThickness;
                const y: number = i * this.blockThickness;
                if (this.map[i][j] === "X") {
                    const floorWidth = this.blockThickness * (this.map[i].indexOf("Y", j + 1) - j + 1);
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, "basic");
                    this.floors.push(floor);
                } else if (this.map[i][j] === "T") {
                    const floorWidth = this.blockThickness * (this.map[i].indexOf("P", j + 1) - j + 1);
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, "travesable");
                    this.floors.push(floor);
                }
                if (
                    this.map[i][j] === "X" ||
                    this.map[i][j] === "#" ||
                    this.map[i][j] === "x"
                ) {
                    const floor: Floor = new Floor(x, y, this.blockThickness, this.blockThickness, "basic");
                    floor.setFillColor("#ffffff");
                    floor.setStroke("#000000", 2);
                    this.stage.add(floor.element);
                } else if (
                    this.map[i][j] === "T" ||
                    this.map[i][j] === "~" ||
                    this.map[i][j] === "t"
                ) {
                    const floor: Floor = new Floor(x, y, this.blockThickness, this.blockThickness, "travesable");
                    floor.setFillColor("#42426F");
                    floor.setStroke("#000000", 2);
                    this.stage.add(floor.element);
                }
            }
        }
    }
    /**
     * create a role
     * @param role role info
     */
    private createRole(role: {[key: string]: any}) {
        const bornFloor: Floor = this.floors[role.random];
        this.Roles[role.id] = new Role(bornFloor, role.type, role.color);
        this.stage.add(this.Roles[role.id].element);
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

    private movePreTreat(id: string, isRight: boolean) {
        if (this.Roles[id]) {
            if (isRight === true) {
                let nextX: number = this.Roles[id].x + this.Roles[id].moveSpeed;
                nextX = this.RolesWillImpactWall(nextX, 1, id);
                this.Roles[id].x = nextX % this.stageWidth;
                this.RolesWillFall(id);
            }
            if (isRight === false) {
                let nextX: number = this.Roles[id].x - this.Roles[id].moveSpeed;
                nextX = this.RolesWillImpactWall(nextX, 0, id);
                this.Roles[id].x = (nextX + this.stageWidth) % this.stageWidth;
                this.RolesWillFall(id);
            }
        }
    }
    /**
     * squat down and body transfer
     * @param id id of players' role
     * @param isDown squat down or stand up
     */
    private squatTreat(id: string, isDown: boolean) {
        if (this.Roles[id]) {
            if (isDown) {
                this.Roles[id].height -= this.transferCoef;
                this.Roles[id].width += this.transferCoef;
                this.Roles[id].squatTrans = true;
            } else {
                this.Roles[id].height += this.transferCoef;
                this.Roles[id].width -= this.transferCoef;
                this.Roles[id].squatTrans = false;
            }
        }
    }
    /**
     * prepare to fall
     * @param id id of players'role
     */
    private fallPreTreat(id: string) {
        if (this.Roles[id]) {
            this.Roles[id].jumpSpeed = 0;
            this.Roles[id].ladderY += this.blockThickness;
            this.Roles[id].verticalTimer = setInterval(
                () => this.RolesVerticalMove(id),
                this.interval,
            );
        }
    }

    private RolesWillImpactWall(nextX: number, isRight: number, id: string) {
        for (const floor of this.floors) {
            if (
                this.Roles[id].footY > floor.y &&
                this.Roles[id].y < floor.y + this.blockThickness &&
                nextX + this.Roles[id].width > floor.x &&
                nextX < floor.x + floor.width &&
                ((this.Roles[id].x >= floor.x + floor.width) ||
                    (this.Roles[id].x + this.Roles[id].width <= floor.x))
            ) {
                return isRight * (floor.x - this.Roles[id].width) + (1 - isRight) * (floor.x + floor.width);
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
            nextY + this.Roles[0].height !==
            (nextY + this.stageHeight + this.Roles[id].height)
            % this.stageHeight
        ) {
            nextY = (nextY + this.stageHeight) % this.stageHeight;
            cross = true;
        }
        if (this.Roles[id].jumpSpeed > 0) {
            // rise up part
            if (nextY <= this.Roles[id].ladderY - 2 * this.blockThickness) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[id].x < floor.x + floor.width
                        &&
                        this.Roles[id].x + this.Roles[id].width > floor.x
                        &&
                        this.Roles[id].y > floor.y
                        &&
                        nextY <= floor.y + this.blockThickness
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
                this.Roles[0].ladderY = this.stageHeight - this.blockThickness;
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
                        this.Roles[id].footY < floor.y
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
