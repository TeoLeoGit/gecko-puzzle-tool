import { _decorator, Button, Component, Sprite, Vec2 } from 'cc';
import { Event } from './Constant';
import EventManager from './EventManager';
import { ColorType } from './Type';
import { getColor } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('Hole')
export class Hole extends Component {
    @property(Sprite)
    sprHole: Sprite;

    @property(Button)
    btnOpenSpecialHole: Button;

    private _x: number;
    private _y: number;
    private _holeId: number;
    private _colorType: ColorType = ColorType.Red;

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }   

    public get ColorType(): ColorType {
        return this._colorType;
    }

    setHoleId(id: number) {
        this._holeId = id;
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    removeBtn() {
        this.btnOpenSpecialHole.destroy();
    }

    disableBtn() {
        this.btnOpenSpecialHole.enabled = false;
    }

    enableBtn() {
        this.btnOpenSpecialHole.enabled = true;
    }
    
    setColor(color: ColorType) {
        this._colorType = color;
        this.sprHole.color = getColor(color);
    }

    onClickAddSpecialHole() {
        EventManager.instance.emit(Event.ON_CHANGE_HOLE_TO_SPECIAL, this._holeId);
    }
}


