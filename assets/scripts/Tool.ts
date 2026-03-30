import { _decorator, Camera, Component, EventMouse, Input, input, Prefab, Vec3, Node, log } from "cc";
import { Cell } from "./Cell";
import { Config } from "./Config";
import { Global } from "./Global";
import { Event } from './Constant';
import EventManager from "./EventManager";
const { ccclass, property } = _decorator;
@ccclass('Tool')
export class Tool extends Component {
    @property(Camera)
    mainCamera: Camera = null!;

    @property(Node)
    gridParent: Node = null!; // Holds grid cells

    @property(Prefab)
    cellPrefab: Prefab = null!;

    @property(Prefab)
    holePrefab: Prefab = null!;

    @property(Prefab)
    bodyPrefab: Prefab = null!;

    private _draggedBody: Node | null = null;
    private _draggedHole: Node | null = null;
    private _mousePos: Vec3 = new Vec3();
    private _mouseDown: boolean = false;
    private _grid: Cell[][] = [];
    private _wallGrid: number[][] = [];
    private _rootCell: Node = null;
    private _rootWall: Node = null;
    private _isCreateBody: boolean = false;
    private _isCreateHole: boolean = false;
    private _isPainting: boolean = false;
    private _isDeleteWall: boolean = false;
    private _gridChilds: Node[] = [];

    private _levelNumb: number = 0;


    onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        EventManager.instance.on(Event.CHANGE_COLOR, this.onChangeColor, this);

        this.initGrid();
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        EventManager.instance.off(Event.CHANGE_COLOR, this.onChangeColor);
    }

    onMouseDown(event: EventMouse) {
        this._mouseDown = true;
        // if (this._isPainting) this.paintWallUnderPointer(event);
        // else if (this._isDeleteWall) this.deleteWallUnderPointer(event);
    }
    
    onMouseUp(event: EventMouse) {
        this._mouseDown = false;

        if (this._isCreateBody) {
            // const snappedPos = this.getClosestGridPosition(this._draggedBlock.worldPosition);
            // if (snappedPos) this.createBlockAt(snappedPos);
        } else if (this._isCreateHole) {
            // const snappedPos = this.getClosestWallPosition(this._draggedExit.worldPosition);
            // if (snappedPos) this.createExitAt(snappedPos);
        }
    }
    
    onMouseMove(event: EventMouse) {
        if (this._isPainting && this._mouseDown) {
            //this.paintWallUnderPointer(event);
            return;
        }
        if (this._isDeleteWall && this._mouseDown) {
            //this.deleteWallUnderPointer(event);
            return;
        }
        if (this._isCreateBody && this._draggedBody) {
            const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
            this._draggedBody.setWorldPosition(worldPos);
            this._mousePos = worldPos;
        } else if (this._isCreateHole && this._draggedHole) {
            const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
            this._draggedHole.setWorldPosition(worldPos);
            this._mousePos = worldPos;
        }
    }

    screenToWorld(screenPos: Vec3): Vec3 {
        const out = new Vec3();
        this.mainCamera.screenToWorld(screenPos, out);
        return out;
    }

    initGrid() {
        let childIter = 0;
        for (let i = 0; i < Config.MAX_ROW; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < Config.MAX_COLUMN; j++) {
                const cell = this.gridParent.children[childIter].getComponent(Cell);
                cell.init(j, i);
                row.push(cell);
                childIter++;
                this._gridChilds.push(cell.node);
            }
            this._grid.push(row);
        }
        this.initDefaultWalls();
        this.resizeGrid(Config.MAX_ROW, Config.MAX_COLUMN);
    }

    initDefaultWalls() {
        const rows = Config.MAX_ROW;
        const cols = Config.MAX_COLUMN;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
                    this._grid[i][j].setWall();
                }
            }
        }
    }

    resizeGrid(row: number, col: number) {
        const maxDim = Math.max(row, col);

        // If both dimensions are 10 or less, use default scale.
        if (maxDim <= 10) {
            this.gridParent.setScale(1, 1, 1);
            return;
        }

        // Clamp to the allowed maximum (16).
        const clamped = Math.min(16, Math.max(10, maxDim));

        // Non-linear interpolation: shrink more at 11..15 while keeping 16 at 0.6.
        const t = (clamped - 10) / (16 - 10); // 0 -> 1
        const eased = Math.pow(t, 0.8);
        const scale = 1 - 0.4 * eased; // 1 -> 0.6

        this.gridParent.setScale(scale, scale, 1);
    }

    loadLevel(level: number) {
        // const data: LEVEL = {...Data.getLevel(level)};
        // if (!data) return;
        // if (data.rowNum) Global.RowCount = data.rowNum;
        // else Global.RowCount = Config.MAX_ROW;
        // if (data.colNum) Global.ColCount = data.colNum;
        // else Global.ColCount = Config.MAX_COLUMN;
        // this._editLevel = {
        //     wall_grid: [],
        //     blocks: [],
        //     exits: [],
        //     diff: 1,
        // }; //clear ref
        
        // this.clearBlocks();
        // this.clearWalls();
        // this.clearExits();
        // this.onGridDimChanged(Global.ColCount, Global.RowCount);
        // this.scheduleOnce(() => {
        //     this._editLevel = data;
        //     this.createBlocks(data.blocks);
        //     this.setWallBackgrounds(data.wall_grid);
        //     this.hideBlockOutsideOfWall();
        //     this.initDefaultWall();
        //     this.createExits(data.exits);
        //     this.setDiff();
        // }, 0.4);
        // this.scheduleOnce(() => {
        //     this.onClearSelector();
        // }, 0.6);

        // this.node.active = true;
        // this._levelNumb = level;
        // if (data.time) {
        //     this.editBoxTime.string = data.time.toString();
        // } else this.editBoxTime.string = '0';
        // this.lblLevel.string = `Level ${level}`;
    }

    onChangeColor() {
        if (this._draggedBody) {
        }
        if (this._draggedHole) {
        }
    }
}