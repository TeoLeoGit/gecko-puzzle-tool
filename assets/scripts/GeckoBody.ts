import { _decorator, Button, Component, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
import { ColorType } from './Type';
import { getColor } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('GeckoBody')
export class GeckoBody extends Component {
    @property(Sprite)
    sprGeckoBody: Sprite;

    @property(Button)
    btnOpenSpecialGecko: Button;

    private _x: number;
    private _y: number;
    private _isPreview: boolean = false;

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setColor(color: ColorType) {
        this.sprGeckoBody.color = getColor(color);
    }

    disableBtn() {
        this._isPreview = true;
        this.btnOpenSpecialGecko.destroy();
    }

}


