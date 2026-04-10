import { _decorator, Color, Button, Component, Sprite, Vec2, UIOpacity, log } from 'cc';
import { GroundData, InputGroundPopup } from './Config';
import { Event } from './Constant';
import EventManager from './EventManager';
import { Global } from './Global';
import { ColorType, GroundType } from './Type';
import { getColor, setSprite } from './Utils';
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

    public static hasEditableProperties(type: GroundType): boolean {
        return type === GroundType.Stone_Wall;
    }

    public static isBlockingType(type: GroundType): boolean {
        return type !== GroundType.Color_Path;
    }

    setGroundId(id: number) {
        this._groundId = id;
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setupGround(id: number, x: number, y: number, type: GroundType) {
        this.setGroundId(id);
        this.setRoot(x, y);
        this.setType(type);
    }

    applyGroundData(groundData: GroundData) {
        this.setupGround(groundData.id, groundData.c, groundData.r, groundData.type);

        if (!this.sprGround) {
            return;
        }

        if (groundData.type === GroundType.Color_Path) {
            const color = groundData.properties?.color;
            this.sprGround.color = color != null ? getColor(color as ColorType) : Color.WHITE.clone();
            return;
        }
    }

    createGroundData(): GroundData {
        return {
            id: this._groundId,
            type: this._groundType,
            r: this._y,
            c: this._x,
            properties: this._groundType === GroundType.Stone_Wall
                ? { count: 1 }
                : this._groundType === GroundType.Color_Path
                    ? { color: Global.ColorType }
                    : {},
        };
    }

    showPropertiesPopup(groundData: GroundData) {
        if (!GroundObject.hasEditableProperties(this._groundType)) {
            return;
        }

        const input: InputGroundPopup = {
            groundData,
        };
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, input);
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

        this.sprGround.color = new Color(255, 255, 255, 255);
        const opacity = this.sprGround.getComponent(UIOpacity) ?? this.sprGround.addComponent(UIOpacity);
        opacity.opacity = Math.round(255);

        if (type === GroundType.block) {
            setSprite('object_rock', this.sprGround);
            return;
        }

        if (type === GroundType.Color_Path) {
            setSprite('color_path', this.sprGround);
            this.sprGround.color = getColor(Global.ColorType);
            const opacity = this.sprGround.getComponent(UIOpacity) ?? this.sprGround.addComponent(UIOpacity);
            opacity.opacity = Math.round(255 * 0.6);
            return;
        }

        if (type === GroundType.Stone_Wall) {
            setSprite('object_rock', this.sprGround);
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

    setColor(color: ColorType) {
        if (this._groundType === GroundType.Color_Path) {
            this.sprGround.color = getColor(color);
            const opacity = this.sprGround.getComponent(UIOpacity) ?? this.sprGround.addComponent(UIOpacity);
            opacity.opacity = Math.round(255 * 0.6);
            return;
        }
        this.sprGround.color = new Color(255, 255, 255, 255);
        const opacity = this.sprGround.getComponent(UIOpacity) ?? this.sprGround.addComponent(UIOpacity);
        opacity.opacity = Math.round(255);
    }
}
