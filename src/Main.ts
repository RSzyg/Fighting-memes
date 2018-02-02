import { Rectangle } from "./Shape";
import Stage from "./Stage";

class Main {
    public stage: Stage;
    public floor1: Rectangle;
    constructor() {
        this.stage = new Stage();
        this.floor1 = new Rectangle(0, 0, 300, 300);
    }
    public createScene() {
        this.floor1.setStroke("#000000", 2);
        this.floor1.setFillColor("#ffffff");
        this.stage.color = "#e8e8e8";
        this.stage.add(this.floor1.element);
    }
}

window.onload = () => {
    const main: Main = new Main();
    main.createScene();
};
