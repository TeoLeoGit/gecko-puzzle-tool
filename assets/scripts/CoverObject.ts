import { _decorator, Color, Component, log, Sprite, UIOpacity, UITransform, Vec2 } from 'cc';
import { CoverProperties, InputCoverPopup, LevelCoverData } from './Config';
import { Event } from './Constant';
import EventManager from './EventManager';
import { CoverType } from './Type';
import { setSprite } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('CoverObject')
export class CoverObject extends Component {
    @property(Sprite)
    sprCover: Sprite;

    private _x: number;
    private _y: number;
    private _coverId: number;
    private _coverType: CoverType = CoverType.None;
    private _coverData: LevelCoverData | null = null;

    //crate
    private _rowEnd: number = 1;
    private _colEnd: number = 1;


    protected update(dt: number): void {
        if (!this._coverData) return;
        if (this._rowEnd !== this._coverData.r || this._colEnd !== this._coverData.c) {
            this.refreshVisual();
            this._colEnd = this._coverData.c;
            this._rowEnd = this._coverData.r;
        } 
    }

    public get RootPos(): Vec2 {
        return new Vec2(this._x, this._y);
    }

    public get CoverType(): CoverType {
        return this._coverType;
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
        this._colEnd = coverData.c;
        this._rowEnd = coverData.r;
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

        this.sprCover.color = new Color(255, 255, 255, 255);
        const opacity = this.sprCover.getComponent(UIOpacity) ?? this.sprCover.addComponent(UIOpacity);
        opacity.opacity = Math.round(255 * 0.85);

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
        const spriteNode = this.sprCover.node;
        const spriteTransform = spriteNode.getComponent(UITransform);
        log(this.node.parent);
        log(JSON.stringify(this._coverData));

        if (this._coverType !== CoverType.Crate || !this._coverData?.properties) return;

        const rowEnd = Math.max(this._y, this._coverData.properties.rowEnd ?? this._y);
        const colEnd = Math.max(this._x, this._coverData.properties.colEnd ?? this._x);

        const spanCols = colEnd - this._x + 1;
        const spanRows = rowEnd - this._y + 1;

        const width = spriteTransform.contentSize.width * spanCols;
        const height = spriteTransform.contentSize.height * spanRows;
        spriteTransform.setContentSize(width, height);

        const offsetX = ((spanCols - 1) * 100) / 2.75;
        const offsetY = ((spanRows - 1) * 94) / 2.75;
        spriteNode.setPosition(offsetX, offsetY, 0);
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


