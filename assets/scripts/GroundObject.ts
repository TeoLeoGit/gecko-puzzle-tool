import { _decorator, Button, Component, Sprite, Vec2 } from 'cc';
import { GroundType } from './Type';
import { setSprite } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('GroundObject')
export class GroundObject extends Component {
    @property(Sprite)
    sprGround: Sprite;

    private _x: number;
    private _y: number;
    private _groundId: number;
    private _groundType: GroundType = GroundType.normal;

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    public get GroundType(): GroundType {
        return this._groundType;
    }

    setGroundId(id: number) {
        this._groundId = id;
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setType(type: GroundType) {
        this._groundType = type;

        if (!this.sprGround) {
            return;
        }

        // if (type === GroundType.normal) {
        //     this.sprGround.spriteFrame = null;
        //     return;
        // }

        if (type === GroundType.block) {
            setSprite('object_rock', this.sprGround);
            return;
        }

        if (type === GroundType.Color_Path) {
            return;
        }

        if (type === GroundType.Stone_Wall) {
            return;
        }

        if (type === GroundType.Colored_Stone) {
            return;
        }

        if (type === GroundType.Rope) {
            return;
        }

        if (type === GroundType.Moveable_Box) {
            return;
        }

        if (type === GroundType.Sliding_Gate) {
            return;
        }
    }
}

