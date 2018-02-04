import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

class Main {
    private stage: Stage;
    private floors: Floor[];
    private stageWidth: number;
    private stageHeight: number;
    private verticalSpacing: number;
    private interval: number;
    private selfRole: Role;
    private blockThickness: number;
    private map: string[];
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 120;
        this.blockThickness = 60;
        this.interval = 17;
        this.map = [
            "xxx      xx    xx    xx      xxx",
            "      xxxxxxxxxxxxxxxxxxxx      ",
            "  xxxxxx      xxxx      xxxxxx  ",
            "xxxxxx     xxxxxxxxxx     xxxxxx",
            "   xxxxxxxxxx      xxxxxxxxxx   ",
            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        ];
    }
    public createScene() {
        this.stage.color = "#e8e8e8";
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        for (let i: number = 0; i < this.map.length; i++) {
            for (let j: number = 0; j < this.map[0].length; j++) {
                    if (this.map[i].charAt(j) === "x") {
                        const x: number = j * this.blockThickness;
                        const y: number = i * (this.blockThickness + this.verticalSpacing) + this.verticalSpacing;
                        const floor: Floor = new Floor(x, y, this.blockThickness, this.blockThickness, "basic");
                        floor.setFillColor("#ffffff");
                        floor.setStroke("#000000", 2);
                        this.floors.push(floor);
                        this.stage.add(floor.element);
                    }
            }
        }
    }
