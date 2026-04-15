import { _decorator, CCString, Color, Component, Node, Sprite, SpriteFrame } from 'cc';
import EventManager from './EventManager';
import { InputDeleteGridObject } from './Config';
import { Event } from './Constant';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
    @property(CCString)
    debugGrid: string = "";

    @property(Sprite)
    sprite: Sprite;

    @property(SpriteFrame)
    sfCell: SpriteFrame;

    @property(SpriteFrame)
    sfWall: SpriteFrame;

    private _x: number = 0;
    private _y: number = 0;
    private _isEmpty: boolean = true;
    private _isWall: boolean = false;
    private _isCovered: boolean = false;
    private _containObject: Node | null = null;

    protected onLoad(): void {
        EventManager.instance.on(Event.DELETE_ONE_BODY, this.onDeleteOneBody, this);
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.DELETE_ONE_BODY, this.onDeleteOneBody, this);
    }

    public get X(): number {
        return this._x;
    }

    public get Y(): number {
        return this._y;
    }

    public get IsEmpty(): boolean {
        return this._isEmpty;
    }

    public set IsEmpty(empty: boolean) {
        this._isEmpty = empty;
    }

    public get IsWall(): boolean {
        return this._isWall;
    }

    public get IsCovered(): boolean {
        return this._isCovered;
    }

    public set IsCovered(covered: boolean) {
        this._isCovered = covered;
    }

    public init(x: number, y: number) {
        this._x = x;
        this._y = y;
        this.debugGrid = `${x}, ${y}`;
    }

    public setWall() {
        this._isWall = true;

        const oldColor = this.sprite.color;
        this.sprite.color = new Color(oldColor.r, oldColor.g, oldColor.b, 255);
        this.sprite.spriteFrame = this.sfWall;
    }

    public deleteWall() {
        this._isWall = false;

        const oldColor = this.sprite.color;
        this.sprite.color = new Color(oldColor.r, oldColor.g, oldColor.b, 255);
        this.sprite.spriteFrame = this.sfCell;
    }
    
    public transparent() {
        const oldColor = this.sprite.color;
        this.sprite.color = new Color(oldColor.r, oldColor.g, oldColor.b, 180);
    }

    private onDeleteOneBody(deleteBody: InputDeleteGridObject) {
        if (deleteBody.rootObj === this._containObject) {
            this.IsEmpty = true;
            this._containObject = null;
        }
    }

    public setContainForObject(levelObject: Node) {
        this._containObject = levelObject;
    }

    public clearContainForObject() {
        this._containObject = null;
    }

    public reset() {
        this._x = -1;
        this._y = -1;
        this.debugGrid = `${this._x}, ${this._y}`;
        this._isEmpty = true;
        this._isWall = false;
        this._isCovered = false;
        this._containObject = null;

        this.sprite.node.active = true;
        const oldColor = this.sprite.color;
        this.sprite.color = new Color(oldColor.r, oldColor.g, oldColor.b, 145);
        this.sprite.spriteFrame = this.sfCell;
    }
}


