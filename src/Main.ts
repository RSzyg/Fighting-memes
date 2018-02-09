import Circle from "./Circle";
import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

class Main {
    private stage: Stage; // the svg element
    private floors: Floor[]; // all floors
    private stageWidth: number; // svg width
    private stageHeight: number; // svg height
    private verticalSpacing: number; // the vertical spacing of the floors
    private floorHeight: number; // the height floors
    private interval: number; // time interval of setInterval
    private Roles: {[key: string]: Role}; // all roles
    private selfId: string;
    private transferCoef: number; // roles' transfer coefficient when squating
    private socket: SocketIOClient.Socket;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.Roles = {};
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 250;
        this.floorHeight = 35;
        this.interval = 17;
        this.transferCoef = 16;
    }
    /**
     * basic initial
     */
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
                    clearInterval(this.Roles[0].rightTimer);
                    this.Roles[0].rightTimer = undefined;
                    break;
                case 37:
                    clearInterval(this.Roles[0].leftTimer);
                    this.Roles[0].leftTimer = undefined;
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
            this.Roles[id].ladderY += this.verticalSpacing;
            this.Roles[id].verticalTimer = setInterval(
                () => this.RolesVerticalMove(id),
                this.interval,
            );
        }
    }

    private RolesWillImpactWall(nextX: number, isRight: number) {
        for (const floor of this.floors) {
            if (
                this.Roles[0].footY > floor.y &&
                this.Roles[0].y < floor.y + this.floorHeight &&
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

    private RolesWillFall() {
        if (
            !this.Roles[0].verticalTimer &&
            (this.Roles[0].x > this.Roles[0].floor.x + this.Roles[0].floor.width ||
                this.Roles[0].x + this.Roles[0].width < this.Roles[0].floor.x)
        ) {
            this.Roles[0].jumpSpeed = 0;
            this.Roles[0].ladderY += this.verticalSpacing;
            this.Roles[0].verticalTimer = setInterval(
                () => this.RolesVerticalMove(this.selfId),
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
        this.Roles[id].jumpSpeed -= this.Roles[id].weight;
        if (this.Roles[id].jumpSpeed > 0) {
            // rise up part
            if (
                nextY <=
                this.Roles[id].ladderY -
                this.verticalSpacing +
                this.floorHeight
            ) {
                let isFind: boolean = false;
                for (const floor of this.floors) {
                    if (
                        this.Roles[id].x < floor.x + floor.width
                        &&
                        this.Roles[id].x + this.Roles[id].width > floor.x
                        &&
                        this.Roles[id].y > floor.y
                        &&
                        nextY <= floor.y + this.floorHeight
                    ) {
                        this.Roles[id].jumpSpeed = 0;
                        nextY = floor.y + this.floorHeight;
                        isFind = true;
                        break;
                    }
                }
                if (!isFind) {
                    // update ladderY
                    this.Roles[id].ladderY -= this.verticalSpacing;
                }
            }
            this.Roles[id].y = nextY;
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
                    this.Roles[id].ladderY += this.verticalSpacing;
                }
            }
            this.Roles[id].y = nextY;
        }
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
