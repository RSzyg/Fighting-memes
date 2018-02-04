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
    }

    private createRole(groundY: number) {
        const roleX: number = Math.random() * this.stageWidth;
        const roleY: number = groundY;
        this.selfRole = new Role(roleX, roleY, 0, "#66ccff");
        this.stage.add(this.selfRole.element);
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
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
