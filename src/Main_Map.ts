import Floor from "./Floor";
import Role from "./Role";
import Stage from "./Stage";

class Main {
    private stage: Stage;
    private floors: Floor[];
    private stageWidth: number;
    private stageHeight: number;
    private verticalSpacing: number;
    private selfRole: Role;
    private blockThickness: number;
    private map: string[];
    constructor() {
        this.stage = new Stage();
        this.floors = [];
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.verticalSpacing = 0;
        this.blockThickness = 60;
        this.map = [
            "                                ",
            "                                ",
            "XxY      XY    XY    XY      XxY",
            "         XY          XY         ",
            "         XY          XY         ",
            "      XxxxxxxxxxxxxxxxxxxY      ",
            "                                ",
            "                                ",
            "  XxxxxY                XxxxxY  ",
            "              XxxY              ",
            "            XxxxxxxY            ",
            "XxxxY     XxxxxxxxxxxY     XxxxY",
            "                                ",
            "                                ",
            "   XxxxxxxxxY      XxxxxxxxxY   ",
            "                                ",
            "                                ",
            "XxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxY",
        ];
    }
    public createScene() {
        this.stage.color = "#e8e8e8";
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        for (let i: number = 0; i < this.map.length; i++) {
            for (let j: number = 0; j < this.map[0].length; j++) {
                if (this.map[i].charAt(j) === "X") {
                    const x: number = j * this.blockThickness;
                    const y: number = i * (this.blockThickness + this.verticalSpacing) + this.verticalSpacing;
                    const floorWidth = this.blockThickness * (this.map[i].indexOf("Y", j + 1) - j + 1);
                    const floor: Floor = new Floor(x, y, floorWidth, this.blockThickness, "basic");
                    floor.setFillColor("#ffffff");
                    floor.setStroke("#000000", 2);
                    this.floors.push(floor);
                    this.stage.add(floor.element);
                }
            }
        }
        this.createRole(this.map.length * this.blockThickness - this.blockThickness);
        document.addEventListener("keydown", (e) => this.keyboardController(e));
        document.addEventListener("keyup", (e) => this.keyboardController(e));
    }
