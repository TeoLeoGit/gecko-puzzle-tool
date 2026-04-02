import { _decorator, Component, Node, Sprite } from 'cc';
import { ColorType } from './Type';
import { getColor } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('Hole')
export class Hole extends Component {
    @property(Sprite)
    sprHole: Sprite;

    private _x: number;
    private _y: number;

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
    
    setColor(color: ColorType) {
        this.sprHole.color = getColor(color);
    }
}


