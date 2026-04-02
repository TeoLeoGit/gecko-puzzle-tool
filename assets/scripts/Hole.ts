import { _decorator, Component, Node, Sprite, Vec2 } from 'cc';
import { ColorType } from './Type';
import { getColor } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('Hole')
export class Hole extends Component {
    @property(Sprite)
    sprHole: Sprite;

    private _x: number;
    private _y: number;
    private _colorType: ColorType = ColorType.Red;

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }   

    public get ColorType(): ColorType {
        return this._colorType;
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
    
    setColor(color: ColorType) {
        this._colorType = color;
        this.sprHole.color = getColor(color);
    }
}


