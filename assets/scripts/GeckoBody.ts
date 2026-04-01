import { _decorator, Button, Component, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
import { ColorType } from './Type';
import { getColor, setSprite } from './Utils';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('GeckoBody')
export class GeckoBody extends Component {
    @property(Sprite)
    sprGeckoBody: Sprite;

    @property(Button)
    btnOpenSpecialGecko: Button;

    @property(Node)
    nodeArrow: Node;

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

    setDirection(prevBodyPos: Vec2) {
        if (!this.nodeArrow) return;

        const dx = prevBodyPos.x - this._x;
        const dy = prevBodyPos.y - this._y;

        // Arrow art is authored pointing up at 0deg.
        // atan2 is measured from +X, so offset by -90deg to map +Y to 0deg.
        const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        this.nodeArrow.angle = angle;
    }

    setHead() {
        setSprite("Gecko_head", this.nodeArrow.getComponent(Sprite));
        this.nodeArrow.getComponent(Sprite).color = getColor(Global.ColorType);
    }
}


