import Floor from "./Floor";
import Stage from "./Stage";

class Main {
    private stage: Stage;
    private floors: Floor[];
    private stageWidth: number;
    private stageHeight: number;
    private verticalSpacing: number;
    private floorHeight: number;
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 200;
        this.floorHeight = 35;
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
                this.stage.add(floor.element.element);
                rs = re + Math.random() * 300 + 200;
            }
        }
        const ground: Floor = new Floor(0, groundY, this.stageWidth, this.floorHeight, "basic");
        ground.setFillColor("#ffffff");
        ground.setStroke("#000000", 2);
        this.floors.push(ground);
        this.stage.add(ground.element.element);
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
