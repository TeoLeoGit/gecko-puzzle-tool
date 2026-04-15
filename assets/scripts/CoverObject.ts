import { _decorator, Color, Component, Label, LabelOutline, Node, Sprite, UIOpacity, UITransform, Vec2 } from 'cc';
import { CoverProperties, InputCoverPopup, LevelCoverData } from './Config';
import { Event } from './Constant';
import EventManager from './EventManager';
import { CoverType } from './Type';
import { setSprite } from './Utils';
const { ccclass, property } = _decorator;

const CELL_WIDTH = 100;
const CELL_HEIGHT = 94;
const BASE_SPRITE_WIDTH = 100;
const BASE_SPRITE_HEIGHT = 98;
const CRATE_OFFSET_DIVIDE = 10 / 3;

@ccclass('CoverObject')
export class CoverObject extends Component {
    @property(Sprite)
    sprCover: Sprite;

    private _x: number;
    private _y: number;
    private _coverId: number;
    private _coverType: CoverType = CoverType.None;
    private _coverData: LevelCoverData | null = null;

    protected onLoad(): void {
        EventManager.instance.on(Event.UPDATE_COVER_VIEW_PROPERTIES, this.refreshVisual, this);
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.UPDATE_COVER_VIEW_PROPERTIES, this.refreshVisual);
    }

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    public get CoverType(): CoverType {
        return this._coverType;
    }

    public get CoveredBounds() {
        const rowEnd = this._coverData?.properties?.rowEnd ?? this._y;
        const colEnd = this._coverData?.properties?.colEnd ?? this._x;

        return {
            minRow: Math.min(this._y, rowEnd),
            maxRow: Math.max(this._y, rowEnd),
            minCol: Math.min(this._x, colEnd),
            maxCol: Math.max(this._x, colEnd),
        };
    }

    public static hasEditableProperties(type: CoverType): boolean {
        return type === CoverType.Crate || type === CoverType.Ice;
    }

    setCoverId(id: number) {
        this._coverId = id;
    }

    setRoot(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    setupCover(id: number, x: number, y: number, type: CoverType) {
        this.setCoverId(id);
        this.setRoot(x, y);
        this.setType(type);
    }

    applyCoverData(coverData: LevelCoverData) {
        this._coverData = coverData;
        this.setupCover(coverData.id, coverData.c, coverData.r, coverData.type);
        this.refreshVisual();
    }

    createCoverData(): LevelCoverData {
        return {
            id: this._coverId,
            type: this._coverType,
            r: this._y,
            c: this._x,
            properties: this.createDefaultProperties(),
        };
    }

    showPropertiesPopup(coverData: LevelCoverData) {
        if (!CoverObject.hasEditableProperties(this._coverType)) {
            return;
        }

        const input: InputCoverPopup = {
            coverData,
        };
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, input);
    }

    setType(type: CoverType) {
        this._coverType = type;

        if (!this.sprCover) {
            return;
        }

        this.sprCover.spriteFrame = null;
        this.sprCover.color = new Color(255, 255, 255, 255);
        const opacity = this.sprCover.getComponent(UIOpacity) ?? this.sprCover.addComponent(UIOpacity);
        opacity.opacity = Math.round(255 * 0.85);
        this.resetSpriteTransform();
        if (!this.hasCountLabelType()) {
            this.clearCountLabel();
        }

        if (type === CoverType.None) {
            opacity.opacity = 0;
            return;
        }

        if (type === CoverType.Crate) {
            setSprite('cover_crate', this.sprCover);
            return;
        }

        if (type === CoverType.Ice) {
            setSprite('cover_ice', this.sprCover);
            opacity.opacity = Math.round(255 * 0.6);
            return;
        }
    }

    private refreshVisual() {
        if (!this.node) return;

        this.resetSpriteTransform();
        this.refreshCountLabel();

        const spriteNode = this.sprCover.node;
        const spriteTransform = spriteNode.getComponent(UITransform);
        if (!spriteTransform) {
            return;
        }

        if (this._coverType !== CoverType.Crate || !this._coverData?.properties) return;

        const { minRow, maxRow, minCol, maxCol } = this.CoveredBounds;
        const rowEnd = this._coverData.properties.rowEnd ?? this._y;
        const colEnd = this._coverData.properties.colEnd ?? this._x;

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
        EventManager.instance.emit(Event.UPDATE_COVERED_CELLS, this);
    }

    private refreshCountLabel() {
        if (!this._coverData?.properties || !this.hasCountLabelType()) {
            this.clearCountLabel();
            return;
        }

        let labelNode = this.node.getChildByName('Label_cover_count');
        if (!labelNode) {
            labelNode = new Node('Label_cover_count');
            this.node.addChild(labelNode);
            labelNode.setPosition(0, 25, 0);
        }

        let label = labelNode.getComponent(Label);
        if (!label) {
            label = labelNode.addComponent(Label);
        }
        label.string = String(this._coverData.properties.count ?? 0);
        label.isBold = true;

        let outline = labelNode.getComponent(LabelOutline);
        if (!outline) {
            outline = labelNode.addComponent(LabelOutline);
        }
        label.outlineWidth = 2;
    }

    private resetSpriteTransform() {
        const spriteNode = this.sprCover.node;
        const spriteTransform = spriteNode.getComponent(UITransform);
        if (!spriteTransform) {
            return;
        }

        spriteTransform.setContentSize(BASE_SPRITE_WIDTH, BASE_SPRITE_HEIGHT);
        spriteNode.setPosition(0, 0, 0);
    }

    private hasCountLabelType(): boolean {
        return this._coverType === CoverType.Crate || this._coverType === CoverType.Ice;
    }

    private clearCountLabel() {
        const labelNode = this.node.getChildByName('Label_cover_count');
        if (labelNode) {
            labelNode.destroy();
        }
    }

    private createDefaultProperties(): CoverProperties {
        if (this._coverType === CoverType.Crate) {
            return {
                count: 1,
                rowEnd: this._y,
                colEnd: this._x,
            };
        }

        if (this._coverType === CoverType.Ice) {
            return {
                count: 1,
            };
        }

        return {};
    }
}
