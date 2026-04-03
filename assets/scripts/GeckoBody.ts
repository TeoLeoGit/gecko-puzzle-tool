import { _decorator, Button, Component, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
import { ColorType } from './Type';
import { getColor, setSprite } from './Utils';
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
    private _geckoId: number;

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setGeckoId(id: number) {
        this._geckoId = id;
    }

    setColor(color: ColorType) {
        this.sprGeckoBody.color = getColor(color);
    }

    removeBtn() {
        this.btnOpenSpecialGecko.destroy();
    }

    disableBtn() {
        this.btnOpenSpecialGecko.enabled = false;
    }

    enableBtn() {
        this.btnOpenSpecialGecko.enabled = true;
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

    setHeadLookDirection(nextBodyPos: Vec2) {
        if (!this.nodeArrow) return;

        const dx = this._x - nextBodyPos.x;
        const dy = this._y - nextBodyPos.y;

        // Head art is authored pointing up at 0deg.
        // Rotate it so it faces from the next body segment toward the head.
        const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        this.sprGeckoBody.node.angle = angle;
    }

    setHead(color: ColorType) {
        setSprite("Gecko_head", this.sprGeckoBody);
        this.sprGeckoBody.color = getColor(color);
        this.nodeArrow.active = false;
    }

    onClickAddSpecialGecko() {
        //open popup
        //done popup -> handler -> change view and change data.
    }
}


