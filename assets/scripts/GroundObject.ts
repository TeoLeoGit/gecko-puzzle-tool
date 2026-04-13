import { _decorator, Button, Color, Component, instantiate, Label, LabelOutline, Node, Sprite, UIOpacity, Vec2 } from 'cc';
import { GroundData, GroundProperties, InputGroundPopup } from './Config';
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
    private _groundData: GroundData | null = null;
    private _ropeSprites: Node[] = [];

    private static readonly ROPE_SEGMENT_SPACING = 60;
    private static readonly ROPE_SEGMENT_SCALE = 0.6;

    protected onLoad(): void {
        EventManager.instance.on(Event.UPDATE_VIEW_PROPERTIES, this.refreshVisual, this);
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.UPDATE_VIEW_PROPERTIES, this.refreshVisual);
        this.clearRopeSprites();
    }

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    public get GroundType(): GroundType {
        return this._groundType;
    }

    public static hasEditableProperties(type: GroundType): boolean {
        return type === GroundType.Stone_Wall || type === GroundType.Rope;
    }

    public static isBlockingType(type: GroundType): boolean {
        return type !== GroundType.Color_Path;
    }

    setGroundId(id: number) {
        this._groundId = id;
        this.updateIdLabel();
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
        this._groundData = groundData;
        this.setupGround(groundData.id, groundData.c, groundData.r, groundData.type);

        if (!this.sprGround) {
            return;
        }

        if (groundData.type === GroundType.Color_Path) {
            const color = groundData.properties?.color;
            this.sprGround.color = color != null ? getColor(color as ColorType) : Color.WHITE.clone();
            return;
        }

        if (groundData.type === GroundType.Rope) {
            this.refreshRopeVisual();
            return;
        }

        this.clearRopeSprites();
    }

    createGroundData(): GroundData {
        return {
            id: this._groundId,
            type: this._groundType,
            r: this._y,
            c: this._x,
            properties: this.createDefaultProperties(),
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

        if (type !== GroundType.Rope) {
            this.clearRopeSprites();
            this.clearIdLabel();
        }

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
            setSprite('object_rope', this.sprGround, () => {
                if (this._groundType === GroundType.Rope) {
                    this.refreshRopeVisual();
                }
            });
            this.updateIdLabel();
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

    private createDefaultProperties(): GroundProperties {
        if (this._groundType === GroundType.Stone_Wall) {
            return {
                count: 1,
            };
        }

        if (this._groundType === GroundType.Color_Path) {
            return {
                color: Global.ColorType,
            };
        }

        if (this._groundType === GroundType.Rope) {
            return {
                rowEnd: this._y,
                colEnd: this._x,
            };
        }

        return {};
    }

    private refreshVisual() {
        if (this._groundType !== GroundType.Rope) return;

        this.refreshRopeVisual();
        this.updateIdLabel();
    }

    private refreshRopeVisual() {
        this.clearRopeSprites();

        if (!this.sprGround || this._groundType !== GroundType.Rope) {
            return;
        }

        const rowEnd = this._groundData?.properties?.rowEnd ?? this._y;
        const colEnd = this._groundData?.properties?.colEnd ?? this._x;
        const deltaRow = rowEnd - this._y;
        const deltaCol = colEnd - this._x;
        const cellDistance = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));

        if (cellDistance === 0) {
            return;
        }

        const stepX = deltaCol / cellDistance;
        const stepY = deltaRow / cellDistance;
        const segmentCount = cellDistance;

        for (let i = 1; i <= segmentCount; i++) {
            const ropeNode = instantiate(this.sprGround.node);
            ropeNode.name = `RopeSprite_${i}`;
            ropeNode.setParent(this.node);
            ropeNode.setScale(GroundObject.ROPE_SEGMENT_SCALE, GroundObject.ROPE_SEGMENT_SCALE, 1);
            ropeNode.setPosition(stepX * GroundObject.ROPE_SEGMENT_SPACING * i, stepY * GroundObject.ROPE_SEGMENT_SPACING * i, 0);

            this._ropeSprites.push(ropeNode);
        }
    }

    private clearRopeSprites() {
        for (const ropeSprite of this._ropeSprites) {
            if (ropeSprite && ropeSprite.isValid) {
                ropeSprite.destroy();
            }
        }
        this._ropeSprites = [];
    }

    private updateIdLabel() {
        if (this._groundData === null) return;
        if (this._groundType !== GroundType.Rope) {
            this.clearIdLabel();
            return;
        }

        let labelNode = this.node.getChildByName('Label_ground_id');
        if (!labelNode) {
            labelNode = new Node('Label_ground_id');
            this.node.addChild(labelNode);
            labelNode.setPosition(0, 25, 0);
        }

        let label = labelNode.getComponent(Label);
        if (!label) {
            label = labelNode.addComponent(Label);
        }
        label.string = String(this._groundId);
        label.isBold = true;

        let outline = labelNode.getComponent(LabelOutline);
        if (!outline) {
            outline = labelNode.addComponent(LabelOutline);
        }
        label.outlineWidth = 2;
    }

    private clearIdLabel() {
        const labelNode = this.node.getChildByName('Label_ground_id');
        if (labelNode) {
            labelNode.destroy();
        }
    }
}
