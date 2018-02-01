export default class Stage {
    public element: HTMLElement;
    private _width: number;
    private _height: number;
    private _color: string;
    constructor() {
        this.element = document.getElementById('main');
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
    public get width() : number {
        return this._width;
    }
    
    public set width(newWidth : number) {
        this._width = newWidth;
        this.element.style.width = `${newWidth}px`;
    }
    
    /**
     * this.height get & set
     */
    public get height() : number {
        return this._height;
    }
    
    public set height(newHeight : number) {
        this._height = newHeight;
        this.element.style.height = `${newHeight}px`;
    }

    /**
     * this.color get & set
     */
    public get color() : string {
        return this._color;
    }
    
    public set color(newColor : string) {
        this._color = newColor;
        this.element.style.background = newColor;
    }
}