import {
    _decorator,
    Component,
    Node,
    ScrollView,
    ScrollBar,
    UITransform,
    Vec2,
    EventTouch,
    input,
    Input,
 } from 'cc';
 
 const { ccclass, property } = _decorator;
 
 @ccclass('ScrollSet')
 export class ScrollSet extends Component {
 
    /** runtime drag flag (same role as old ScrollBarClick) */
    @property
    ScrollBarClick = false;
 
    MaxMoveY: number | null = null;
    MaxMoveX: number | null = null;
    maxY: number | null = null;
    minY: number | null = null;
    minX: number | null = null;
    maxX: number | null = null;
 
    private _scrollView!: ScrollView;
    private scrollBarNode!: Node;
    private barNode!: Node;
    private content!: Node;
    private direction = 1; // 1 = vertical, 0 = horizontal
 
    start () {
        this._scrollView = this.node.parent!.getComponent(ScrollView)!;
        this.scrollBarNode = this.node;
        this.barNode = this.node.getChildByName('bar')!;
        this.content = this._scrollView.content!;
 
        this.scheduleOnce(this._resetMaxMove, 0);
        this.content.on(Node.EventType.SIZE_CHANGED, this._resetMaxMove, this);
    }
 
    onEnable () {
        input.on(Input.EventType.TOUCH_START, this._onStartTouch, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onMoveTouch, this);
        input.on(Input.EventType.TOUCH_END, this._onEndTouch, this);
    }
 
    onDisable () {
        input.off(Input.EventType.TOUCH_START, this._onStartTouch, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onMoveTouch, this);
        input.off(Input.EventType.TOUCH_END, this._onEndTouch, this);
        this.content.off(Node.EventType.SIZE_CHANGED, this._resetMaxMove, this);
    }
 
    private _resetMaxMove () {
        const scrollbar = this.scrollBarNode.getComponent(ScrollBar)!;
        this.direction = scrollbar.direction === ScrollBar.Direction.VERTICAL ? 1 : 0;
 
        const worldPos = this.scrollBarNode.getWorldPosition();
        const ui = this.scrollBarNode.getComponent(UITransform)!;
        const barUI = this.barNode.getComponent(UITransform)!;
 
        if (this.direction === 1) {
            this.maxY = worldPos.y + ui.height / 2;
            this.minY = worldPos.y - ui.height / 2;
            this.MaxMoveY = this.maxY - barUI.height;
            this.maxX = worldPos.x + ui.width / 2;
            this.minX = worldPos.x - ui.width / 2;
        } else {
            this.maxX = worldPos.x + ui.width / 2;
            this.minX = worldPos.x - ui.width / 2;
            this.MaxMoveX = this.maxX - barUI.width;
            this.maxY = worldPos.y + ui.height / 2;
            this.minY = worldPos.y - ui.height / 2;
        }
    }
 
    private _onStartTouch (event: EventTouch) {
        const p = event.getLocation();
 
        if (
            p.x >= this.minX! && p.x <= this.maxX! &&
            p.y >= this.minY! && p.y <= this.maxY!
        ) {
            //this.ScrollBarClick = true;
            event.propagationStopped = true;
        }
    }
 
    private _onMoveTouch (event: EventTouch) {
        if (!this.ScrollBarClick) return;
 
        const delta = event.getDelta();
        const barPos = this.barNode.getPosition();
 
        if (this.direction === 1) {
            barPos.y += delta.y;
            this.barNode.setPosition(barPos);
 
            const worldY = this.barNode.getWorldPosition().y;
            if (worldY > this.MaxMoveY! || worldY < this.minY!) {
                barPos.y -= delta.y;
                this.barNode.setPosition(barPos);
                return;
            }
 
            const percent = (this.MaxMoveY! - worldY) / (this.MaxMoveY! - this.minY!);
            this._scrollView.scrollTo(new Vec2(0, 1 - percent), 0);
        } else {
            barPos.x += delta.x;
            this.barNode.setPosition(barPos);
 
            const worldX = this.barNode.getWorldPosition().x;
            if (worldX > this.MaxMoveX! || worldX < this.minX!) {
                barPos.x -= delta.x;
                this.barNode.setPosition(barPos);
                return;
            }
 
            const percent = (worldX - this.minX!) / (this.MaxMoveX! - this.minX!);
            this._scrollView.scrollTo(new Vec2(percent, 0), 0);
        }
 
        event.propagationStopped = true;
    }
 
    private _onEndTouch () {
        //this.ScrollBarClick = false;
    }
 }