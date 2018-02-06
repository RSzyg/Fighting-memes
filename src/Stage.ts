import Rectangle from "./Rectangle";
import Shape from "./Shape";

export default class Stage {
    public element: HTMLElement;
    private selfWidth: number;
    private selfHeight: number;
    private selfColor: string;
    constructor() {
        this.element = document.getElementById("main");
    }
    /**
     * 添加进场景
     */
    public add(shape: Shape) {
        this.element.appendChild(shape.element);
    }

    /**
     * this.width get & set
     */
    public get width(): number {
        return this.selfWidth;
    }

    public set width(newWidth: number) {
        this.selfWidth = newWidth;
        this.element.style.width = `${newWidth}px`;
    }

    /**
     * this.height get & set
     */
    public get height(): number {
        return this.selfHeight;
    }

    public set height(newHeight: number) {
        this.selfHeight = newHeight;
        this.element.style.height = `${newHeight}px`;
    }

    /**
     * this.color get & set
     */
    public get color(): string {
        return this.selfColor;
    }

    public set color(newColor: string) {
        this.selfColor = newColor;
        this.element.style.background = newColor;
    }
}
