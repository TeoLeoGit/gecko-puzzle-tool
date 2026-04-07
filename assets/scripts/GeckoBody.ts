import { _decorator, Button, Component, Label, LabelOutline, log, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
import { Event } from './Constant';
import EventManager from './EventManager';
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

        let labelNode = this.node.getChildByName('Label_gecko_id');
        if (!labelNode) {
            labelNode = new Node('Label_gecko_id');
            this.node.addChild(labelNode);
            labelNode.setPosition(0, 25, 0);
        }
        labelNode.setPosition(0, 25, 0);

        let label = labelNode.getComponent(Label);
        if (!label) {
            label = labelNode.addComponent(Label);
        }
        label.string = String(this._geckoId);
        label.isBold = true;

        let outline = labelNode.getComponent(LabelOutline);
        if (!outline) {
            outline = labelNode.addComponent(LabelOutline);
        }
        outline.width = 2;
    }

    onClickAddSpecialGecko() {
        EventManager.instance.emit(Event.ON_CHANGE_GECKO_TO_SPECIAL, this._geckoId);
    }
}


