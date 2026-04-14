import { _decorator, Color, Component, instantiate, Label, LabelOutline, Node, Sprite, UIOpacity, UITransform, Vec2 } from 'cc';
import { GroundData, GroundProperties, InputGroundPopup } from './Config';
import { Event } from './Constant';
import EventManager from './EventManager';
import { Global } from './Global';
import { ColorType, GroundType, MoveableBoxDirection } from './Type';
import { getColor, setSprite } from './Utils';
const { ccclass, property } = _decorator;

const CELL_WIDTH = 100;
const CELL_HEIGHT = 94;
const BASE_SPRITE_WIDTH = 100;
const BASE_SPRITE_HEIGHT = 98;
const CRATE_OFFSET_DIVIDE = 10 / 3;

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
    private _slidingGateSprites: Node[] = [];
    private _dirArrowNodes: Node[] = [];

    private static readonly ROPE_SEGMENT_SPACING = 60;
    private static readonly ROPE_SEGMENT_SCALE = 0.6;

    protected onLoad(): void {
        EventManager.instance.on(Event.UPDATE_VIEW_PROPERTIES, this.refreshVisual, this);
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.UPDATE_VIEW_PROPERTIES, this.refreshVisual);
        this.clearRopeSprites();
        this.clearSlidingGateSprites();
        this.clearDirectionArrow();
    }

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    public get GroundType(): GroundType {
        return this._groundType;
    }

    public get OccupiedBounds() {
        const rowEnd = this._groundData?.properties?.rowEnd ?? this._y;
        const colEnd = this._groundData?.properties?.colEnd ?? this._x;

        return {
            minRow: Math.min(this._y, rowEnd),
            maxRow: Math.max(this._y, rowEnd),
            minCol: Math.min(this._x, colEnd),
            maxCol: Math.max(this._x, colEnd),
        };
    }

    public static hasEditableProperties(type: GroundType): boolean {
        return type === GroundType.Stone_Wall
            || type === GroundType.Rope
            || type === GroundType.Moveable_Box
            || type === GroundType.Sliding_Gate;
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

        if (groundData.type === GroundType.Colored_Stone) {
            const color = groundData.properties?.color;
            this.sprGround.color = color != null ? getColor(color as ColorType) : Color.WHITE.clone();
            return;
        }

        if (groundData.type === GroundType.Rope) {
            this.refreshRopeVisual();
            return;
        }

        if (groundData.type === GroundType.Moveable_Box) {
            this.refreshSpanGroundVisual();
            this.refreshMoveableBoxDirectionArrow();
            return;
        }

        if (groundData.type === GroundType.Sliding_Gate) {
            this.refreshSlidingGateVisual();
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

        if (this._groundType === GroundType.Moveable_Box) {
            EventManager.instance.emit(Event.SHOW_MOVABLE_BOX_POPUP, input);
            return;
        }

        if (this._groundType === GroundType.Sliding_Gate) {
            EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, input);
            return;
        }

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

        if (type !== GroundType.Sliding_Gate) {
            this.clearSlidingGateSprites();
        }

        if (type !== GroundType.Moveable_Box) {
            this.clearDirectionArrow();
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
            setSprite('object_rock', this.sprGround);
            this.sprGround.color = getColor(Global.ColorType);
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
            setSprite('object_movable_box', this.sprGround, () => {
                if (this._groundType === GroundType.Moveable_Box) {
                    this.refreshSpanGroundVisual();
                    this.refreshMoveableBoxDirectionArrow();
                }
            });
            return;
        }

        if (type === GroundType.Sliding_Gate) {
            setSprite('object_sliding_gate', this.sprGround, () => {
                if (this._groundType === GroundType.Sliding_Gate) {
                    this.refreshSlidingGateVisual();
                }
            });
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

        if (this._groundType === GroundType.Colored_Stone) {
            this.sprGround.color = getColor(color);
            const opacity = this.sprGround.getComponent(UIOpacity) ?? this.sprGround.addComponent(UIOpacity);
            opacity.opacity = Math.round(255);
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

        if (this._groundType === GroundType.Colored_Stone) {
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

        if (this._groundType === GroundType.Moveable_Box) {
            return {
                rowEnd: this._y,
                colEnd: this._x,
                dir: MoveableBoxDirection.Both
            };
        }

        if (this._groundType === GroundType.Sliding_Gate) {
            return {
                rowEnd: this._y,
                colEnd: this._x,
            };
        }

        return {};
    }

    private refreshVisual() {
        if (this._groundType === GroundType.Rope) {
            this.refreshRopeVisual();
            this.updateIdLabel();
            return;
        }

        if (this._groundType === GroundType.Moveable_Box) {
            this.refreshSpanGroundVisual();
            this.refreshMoveableBoxDirectionArrow();
            return;
        }

        if (this._groundType === GroundType.Sliding_Gate) {
            this.refreshSlidingGateVisual();
        }
    }

    private refreshSpanGroundVisual() {
        this.resetSpriteTransform();

        if (this._groundType !== GroundType.Moveable_Box && this._groundType !== GroundType.Sliding_Gate) return;
        
        const spriteNode = this.sprGround.node;
        const spriteTransform = spriteNode.getComponent(UITransform);
        if (!spriteTransform) {
            return;
        }

        const rowEnd = this._groundData?.properties?.rowEnd ?? this._y;
        const colEnd = this._groundData?.properties?.colEnd ?? this._x;

        const minRow = Math.min(this._y, rowEnd);
        const maxRow = Math.max(this._y, rowEnd);
        const minCol = Math.min(this._x, colEnd);
        const maxCol = Math.max(this._x, colEnd);

        const spanCols = maxCol - minCol + 1;
        const spanRows = maxRow - minRow + 1;

        const width = BASE_SPRITE_WIDTH * spanCols;
        const height = BASE_SPRITE_HEIGHT * spanRows;
        spriteTransform.setContentSize(width, height);

        const colDirection = colEnd >= this._x ? 1 : -1;
        const rowDirection = rowEnd >= this._y ? 1 : -1;
        const offsetX = ((spanCols - 1) * CELL_WIDTH) / CRATE_OFFSET_DIVIDE * colDirection;
        const offsetY = ((spanRows - 1) * CELL_HEIGHT) / CRATE_OFFSET_DIVIDE * rowDirection;
        spriteNode.setPosition(offsetX, offsetY, 0);
    }

    private refreshSlidingGateVisual() {
        this.clearSlidingGateSprites();

        if (!this.sprGround || this._groundType !== GroundType.Sliding_Gate) {
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

        for (let i = 1; i <= cellDistance; i++) {
            const gateNode = instantiate(this.sprGround.node);
            gateNode.name = `SlidingGateSprite_${i}`;
            gateNode.setParent(this.node);
            gateNode.setScale(GroundObject.ROPE_SEGMENT_SCALE, GroundObject.ROPE_SEGMENT_SCALE, 1);
            gateNode.setPosition(stepX * GroundObject.ROPE_SEGMENT_SPACING * i, stepY * GroundObject.ROPE_SEGMENT_SPACING * i, 0);

            this._slidingGateSprites.push(gateNode);
        }
    }

    private refreshMoveableBoxDirectionArrow() {
        if (this._groundType !== GroundType.Moveable_Box) {
            this.clearDirectionArrow();
            return;
        }

        const direction = this._groundData?.properties?.dir ?? MoveableBoxDirection.Both;
        this.clearDirectionArrow();
        this.scheduleOnce(() => {
            if (this._groundType !== GroundType.Moveable_Box) return;

            const arrowConfigs = direction === MoveableBoxDirection.Both
                ? [
                    { name: 'MoveableBoxDirectionArrow_V', rotation: 0, positionY: 12 },
                    { name: 'MoveableBoxDirectionArrow_H', rotation: 90, positionY: -12 },
                ]
                : [
                    {
                        name: 'MoveableBoxDirectionArrow',
                        rotation: direction === MoveableBoxDirection.Horizontal ? 90 : 0,
                        positionY: 0,
                    },
                ];

            for (const config of arrowConfigs) {
                if (!this.sprGround || !this.sprGround.node || !this.sprGround.node.isValid) {
                    return;
                }

                const arrowNode = new Node(config.name);
                arrowNode.addComponent(UITransform);
                arrowNode.setParent(this.sprGround.node);
                arrowNode.setPosition(0, config.positionY, 0);

                const arrowSprite = arrowNode.addComponent(Sprite);
                setSprite('arrow_dir', arrowSprite, () => {
                    if (!arrowNode || !arrowNode.isValid || this._groundType !== GroundType.Moveable_Box) {
                        return;
                    }

                    arrowNode.setPosition(0, config.positionY, 0);
                    arrowNode.setRotationFromEuler(0, 0, config.rotation);
                });

                this._dirArrowNodes.push(arrowNode);
            }
        }, 0);
    }

    private clearDirectionArrow() {
        for (const arrowNode of this._dirArrowNodes) {
            if (arrowNode && arrowNode.isValid) {
                arrowNode.destroy();
            }
        }
        this._dirArrowNodes = [];
    }

    private resetSpriteTransform() {
        if (!this.sprGround) {
            return;
        }

        const spriteNode = this.sprGround.node;
        const spriteTransform = spriteNode.getComponent(UITransform);
        if (!spriteTransform) {
            return;
        }

        spriteTransform.setContentSize(BASE_SPRITE_WIDTH, BASE_SPRITE_HEIGHT);
        spriteNode.setPosition(0, 0, 0);
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
        if (!Array.isArray(this._ropeSprites)) {
            this._ropeSprites = [];
            return;
        }

        for (const ropeSprite of this._ropeSprites) {
            if (ropeSprite && ropeSprite.isValid) {
                ropeSprite.destroy();
            }
        }
        this._ropeSprites = [];
    }

    private clearSlidingGateSprites() {
        if (!Array.isArray(this._slidingGateSprites)) {
            this._slidingGateSprites = [];
            return;
        }

        for (const gateSprite of this._slidingGateSprites) {
            if (gateSprite && gateSprite.isValid) {
                gateSprite.destroy();
            }
        }
        this._slidingGateSprites = [];
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
