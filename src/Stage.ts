export default class Stage {
    public element: HTMLElement;
    private selfwidth: number;
    private selfheight: number;
    private selfcolor: string;
    constructor() {
        this.element = document.getElementById("main");
    }
    /**
     * 添加进场景
     */
    public add(svgElement: SVGElement) {
        this.element.appendChild(svgElement);
    }

    /**
     * this.width get & set
     */
    public get width(): number {
        return this.selfwidth;
    }

    public set width(newWidth: number) {
        this.selfwidth = newWidth;
        this.element.style.width = `${newWidth}px`;
    }

    /**
     * this.height get & set
     */
    public get height(): number {
        return this.selfheight;
    }

    public set height(newHeight: number) {
        this.selfheight = newHeight;
        this.element.style.height = `${newHeight}px`;
    }

    /**
     * this.color get & set
     */
    public get color(): string {
        return this.selfcolor;
    }

    public set color(newColor: string) {
        this.selfcolor = newColor;
        this.element.style.background = newColor;
    }
}
