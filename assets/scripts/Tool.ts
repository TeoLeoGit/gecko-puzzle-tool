import { _decorator, Camera, Component, EventMouse, Input, input, Prefab, Vec3, Node, log, instantiate, Sprite, UITransform, EditBox, Layout, Toggle } from "cc";
import { Cell } from "./Cell";
import { Config, GeckoData, GeckoPart, HoleData, LevelData } from "./Config";
import { Global } from "./Global";
import { Event } from './Constant';
import EventManager from "./EventManager";
import { DesignMode, GeckoType, HoleType } from "./Type";
import { GeckoBody } from "./GeckoBody";
import { Hole } from "./Hole";
import { Data } from "./Data";
const { ccclass, property } = _decorator;
@ccclass('Tool')
export class Tool extends Component {
    @property(Camera)
    mainCamera: Camera = null!;

    @property(Layout)
    layoutGrid: Layout = null!;

    @property(Node)
    gridParent: Node = null!; // Holds grid cells

    @property(Node)
    geckoParent: Node = null!;

    @property(Node)
    holeParent: Node = null!;

    @property(Node)
    previewLayer: Node = null!;

    @property(Node)
    btnDesginGecko: Node = null!;

    @property(Node)
    btnDesginHole: Node = null!;

    @property(Node)
    btnFinishGecko: Node = null;

    @property(Node)
    btnDesginWall: Node = null!;

    @property(Prefab)
    cellPrefab: Prefab = null!;

    @property(Prefab)
    holePrefab: Prefab = null!;

    @property(Prefab)
    bodyGeckoPrefab: Prefab = null!;

    @property(EditBox)
    editBoxCol: EditBox = null!;

    @property(EditBox)
    editBoxRow: EditBox = null!;

    @property(EditBox)
    editBoxTime: EditBox = null!;

    @property(Toggle)
    toggleDiff: Toggle[] = [];
    
    private _draggedGeckoBody: Node | null = null;
    private _draggedHole:      Node | null = null;
    private _mousePos: Vec3 = new Vec3();
    private _mouseDown: boolean = false;
    private _grid: Cell[][] = [];
    private _rootCell: Node = null;
    private _gridChilds: Node[] = [];
    private _levelNumb: number = 0;
    private _idGeckoIncrement: number = 0;
    private _idHoleIncrement:  number = 0;
    private _sectionBodies: GeckoBody[] = [];
    private _currentGeckoData: GeckoData;

    private _editLevelData: LevelData = {
        level: 1,
        width: 16,
        height: 16,
        time: 100,
        difficulty: '1',
        cells: [],
        grounds: [],
        holes: [],
        geckos: [],
        Cover: [],
    };

    onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        this.editBoxCol.node.on(EditBox.EventType.TEXT_CHANGED, this.onColumnChanged, this);
        this.editBoxRow.node.on(EditBox.EventType.TEXT_CHANGED, this.onRowChanged, this);

        EventManager.instance.on(Event.CHANGE_COLOR, this.onChangeColor, this);
        EventManager.instance.on(Event.CHOOSE_GECKO_BODY, this.onChooseGeckoDesignMode, this);
        EventManager.instance.on(Event.CHOOSE_HOLE, this.onChooseHoleDesignMode, this);
        EventManager.instance.on(Event.EDIT_LEVEL, this.loadLevel, this);


        this.initGrid();
        this.init();
        this.node.active = false;
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        this.editBoxCol.node.off(EditBox.EventType.TEXT_CHANGED, this.onColumnChanged, this);
        this.editBoxRow.node.off(EditBox.EventType.TEXT_CHANGED, this.onRowChanged, this);

        EventManager.instance.off(Event.CHANGE_COLOR, this.onChangeColor);
        EventManager.instance.off(Event.CHOOSE_GECKO_BODY, this.onChooseGeckoDesignMode);
        EventManager.instance.off(Event.CHOOSE_HOLE, this.onChooseHoleDesignMode);
        EventManager.instance.off(Event.EDIT_LEVEL, this.loadLevel);
    }

    onMouseDown(event: EventMouse) {
        this._mouseDown = true;

        if (Global.DesignMode === DesignMode.CreateGecko) {
            const snappedPos = this.getClosestGridPosition(this._draggedGeckoBody.worldPosition);
            if (snappedPos) this.createGeckoBodyAt(snappedPos);
        }
        if (Global.DesignMode === DesignMode.CreateHole) {
            const snappedPos = this.getClosestGridPosition(this._draggedHole.worldPosition);
            if (snappedPos) this.createHoleAt(snappedPos);
        }
    }
    
    onMouseUp(event: EventMouse) {
        this._mouseDown = false;

        // if (this._isCreateBody) {
            // const snappedPos = this.getClosestGridPosition(this._draggedBlock.worldPosition);
            // if (snappedPos) this.createBlockAt(snappedPos);
        // } else if (this._isCreateHole) {
            // const snappedPos = this.getClosestWallPosition(this._draggedExit.worldPosition);
            // if (snappedPos) this.createExitAt(snappedPos);
        // }
    }
    
    onMouseMove(event: EventMouse) {
        if (Global.DesignMode === DesignMode.CreateGecko) {
            const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
            this._draggedGeckoBody.setWorldPosition(worldPos);
            this._mousePos = worldPos;
        }

        if (Global.DesignMode === DesignMode.CreateHole) {
            const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
            this._draggedHole.setWorldPosition(worldPos);
            this._mousePos = worldPos;
        }

        if (!this._mouseDown) return;
        // if (this._isPainting && this._mouseDown) {
        //     //this.paintWallUnderPointer(event);
        //     return;
        // }
        // if (this._isDeleteWall && this._mouseDown) {
        //     //this.deleteWallUnderPointer(event);
        //     return;
        // }
        if (Global.DesignMode === DesignMode.CreateGecko) {
            const snappedPos = this.getClosestGridPosition(this._draggedGeckoBody.worldPosition);
            if (snappedPos) this.createGeckoBodyAt(snappedPos);
        }

        if (Global.DesignMode === DesignMode.CreateWall) {
            this.createWall(event);
        }

        if (Global.DesignMode === DesignMode.DeleteWall) {
            this.deleteWall(event);
        }
        // if (this._isCreateBody && this._draggedGeckoBody) {
        //     const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
        //     this._draggedGeckoBody.setWorldPosition(worldPos);
        //     this._mousePos = worldPos;
        // } else if (this._isCreateHole && this._draggedHole) {
        //     const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
        //     this._draggedHole.setWorldPosition(worldPos);
        //     this._mousePos = worldPos;
        // }
    }

    screenToWorld(screenPos: Vec3): Vec3 {
        const out = new Vec3();
        this.mainCamera.screenToWorld(screenPos, out);
        return out;
    }

    loadLevel(level: number) {
        const data: LevelData = {...Data.getLevel(level)};
        if (!data) return;
        if (data.height) Global.RowCount = data.height;
        else Global.RowCount = Config.MAX_ROW;
        if (data.width) Global.ColCount = data.width;
        else Global.ColCount = Config.MAX_COLUMN;

        //Clear
        this._editLevelData = {
            level: 1,
            width: 16,
            height: 16,
            time: 100,
            difficulty: '1',
            cells: [],
            grounds: [],
            holes: [],
            geckos: [],
            Cover: [],
        }; //clear ref
        this.clearDesignMode();
        this.clearGeckoBodies();
        this.clearHoles();
        this._editLevelData = data;

        //Create
        this.onGridDimChanged(Global.ColCount, Global.RowCount);

        this.node.active = true;
        this._levelNumb = level;
        if (data.time) {
            this.editBoxTime.string = data.time.toString();
        } else this.editBoxTime.string = '0';
        //this.lblLevel.string = `Level ${level}`;
    }

    init() {
        //Drag gecko body
        if (!this._draggedGeckoBody) {
            const body = instantiate(this.bodyGeckoPrefab);
            this.previewLayer.addChild(body);
            const bodyPos = this.previewLayer.getComponent(UITransform).convertToNodeSpaceAR(this._mousePos);
            body.setPosition(bodyPos);
            body.getComponent(GeckoBody).disableBtn();
            this._draggedGeckoBody = body;
        }
        if (!this._draggedHole) {
            const hole = instantiate(this.holePrefab);
            this.previewLayer.addChild(hole);
            const holePos = this.previewLayer.getComponent(UITransform).convertToNodeSpaceAR(this._mousePos);
            hole.setPosition(holePos);
            //hole.getComponent(Hole).disableBtn();
            this._draggedHole = hole;
        }
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
        this.resizeGrid(Config.MAX_ROW, Config.MAX_COLUMN);
        this.initWalls(Config.MAX_ROW, Config.MAX_COLUMN);
    }

    initWalls(cols: number, rows: number) {
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

    onChangeColor() {
        if (this._draggedGeckoBody) {
            this._draggedGeckoBody.getComponent(GeckoBody).setColor(Global.ColorType);
        }
        if (this._draggedHole) {
            this._draggedHole.getComponent(Hole).setColor(Global.ColorType);
        }
    }

    //Edit box
    onColumnChanged(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed)) {
            log(`Invalid number: "${value}"`);
        } else {
            if (parsed > 2 && parsed <= Config.MAX_COLUMN) {
                Global.ColCount = parsed;
                this._editLevelData.width = parsed;
                this.onGridDimChanged(Global.ColCount, Global.RowCount);
            }
        }
    }

    onRowChanged(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed)) {
            log(`Invalid number: "${value}"`);
        } else {
            if (parsed > 2 && parsed <= Config.MAX_ROW) {
                Global.RowCount = parsed;
                this._editLevelData.height = parsed;
                this.onGridDimChanged(Global.ColCount, Global.RowCount);
            }
        }
    }

    onGridDimChanged(col: number, row: number) {
        this.layoutGrid.constraintNum = col;
        const cellNumb = col * row;

        for (let i = 0; i < cellNumb; i++) {
            this.gridParent.children[i].active = true;
            this.gridParent.children[i].getComponent(Cell).reset();
        }
        for (let i = cellNumb; i < this.gridParent.children.length; i++) {
            this.gridParent.children[i].getComponent(Cell).reset();
            this.gridParent.children[i].active = false;
        }

        let childIter = 0;
        this._grid = [];
        for (let i = 0; i < row; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < col; j++) {
                const cell = this._gridChilds[childIter].getComponent(Cell);
                cell.init(j, i);
                row.push(cell);
                childIter++;
            }
            this._grid.push(row);
        }

        this.gridParent.position = new Vec3(64 + (Config.MAX_COLUMN - col) * 10, -406 + (Config.MAX_ROW - row) * 50);

        this.scheduleOnce(() => {
            this.clearGeckoBodies();
            this.clearHoles();
        }, 0.4);
        this.scheduleOnce(() => {
            this.initWalls(col, row);
        }, 0.6);
    }

    clearGeckoBodies() {
        for (const child of this.geckoParent.children) {
            child.destroy();
        }
        this.geckoParent.removeAllChildren();
    }

    clearHoles() {
        for (const child of this.holeParent.children) {
            child.destroy();
        }
        this.holeParent.removeAllChildren();
    }

    //Design Mode
    getClosestGridPosition(worldPos: Vec3): Vec3 {
        let closest = null;
        let minDist = Number.MAX_VALUE;
    
        for (const tile of this.gridParent.children) {
            const dist = Vec3.distance(tile.worldPosition, worldPos);
            if (dist < minDist) {
                minDist = dist;
                closest = tile;
            }
        }
        
        if (minDist > 1003) return null;
        this._rootCell = closest;
        return closest ? closest.worldPosition : worldPos;
    }

    findCellAt(pos: Vec3): Node | null {
        let closest = null;
        let minDist = Number.MAX_VALUE;
    
        for (const tile of this.gridParent.children) {
            const dist = Vec3.distance(tile.worldPosition, pos);
            if (dist < minDist) {
                minDist = dist;
                closest = tile;
            }
        }
        
        return closest;
    }

    createGeckoBodyAt(position: Vec3) {
        const rootCell = this._rootCell.getComponent(Cell);
        const newBlock = instantiate(this.bodyGeckoPrefab);

        const isConnected = this.isConnectedBodyPart(rootCell.X, rootCell.Y);
        if (!isConnected) {
            newBlock.destroy();
            return;
        }

        const canCreate = this.fillEmptyCell(this._rootCell, newBlock);
        if (canCreate) {
            this.geckoParent.addChild(newBlock);
            newBlock.setWorldPosition(position);
            const bodyComponent = newBlock.getComponent(GeckoBody);
            bodyComponent.setColor(Global.ColorType);
            bodyComponent.setRoot(rootCell.X, rootCell.Y);
            if (this._sectionBodies.length > 0) {
                bodyComponent.setDirection(this._sectionBodies[this._sectionBodies.length - 1].RootPos);
            } else {
                bodyComponent.setHead();
            }
            this._sectionBodies.push(bodyComponent);

            // let newBlockData: BlockData = {
            //     icon: `PA_Grid_${Global.ShapeId}_${Global.ColorId}`,
            //     x: rootCell.X,
            //     y: rootCell.Y,
            //     type: 0,
            // }
            // this._editLevel.blocks.push(newBlockData);
            this.addPartDataToCurrentGecko(bodyComponent)
        } else {
            newBlock.destroy();
        }
    }

    createHoleAt(position: Vec3) {
        const rootCell = this._rootCell.getComponent(Cell);
        const newHole = instantiate(this.holePrefab);

        const canCreate = this.fillEmptyCell(this._rootCell, newHole);
        if (canCreate) {
            this.holeParent.addChild(newHole);
            newHole.setWorldPosition(position);
            const holeComponent = newHole.getComponent(Hole);
            holeComponent.setColor(Global.ColorType);
            holeComponent.setRoot(rootCell.X, rootCell.Y);

            this.addHoleData(holeComponent);
        } else {
            newHole.destroy();
        }
    }

    createWall(event: EventMouse) {
        const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));

        // Find the grid cell or wall under this position
        const targetCell = this.findCellAt(worldPos);
        if (targetCell) {
            targetCell.getComponent(Cell)?.setWall();
        }
    }

    deleteWall(event: EventMouse) {
        const worldPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
        const targetCell = this.findCellAt(worldPos);
        if (targetCell) {
            targetCell.getComponent(Cell)?.deleteWall();
        }
    }

    fillEmptyCell(root: Node, geckoBody: Node): boolean {
        const rootCell = root.getComponent(Cell);
        if (rootCell.IsEmpty && !rootCell.IsWall) {
            rootCell.IsEmpty = false;
            rootCell.setContainForGeckoBody(geckoBody);
            return true;
        }
        return false;
    }

    isConnectedBodyPart(x: number, y: number): boolean {
        //Check if connect with last _sectionBodies item.
        if (this._sectionBodies.length === 0) return true;

        const lastBody = this._sectionBodies[this._sectionBodies.length - 1];
        const lastPos = lastBody.RootPos;

        const dx = Math.abs(x - lastPos.x);
        const dy = Math.abs(y - lastPos.y);

        // Connected if it's exactly 1 cell away in the same row or column.
        // (No diagonals, no gaps)
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    onChooseGeckoDesignMode() {
        if (Global.DesignMode === DesignMode.CreateGecko) {
            this.clearDesignMode();
            this._draggedGeckoBody.active = false;
            return;
        }

        this.clearDesignMode();
        this._draggedGeckoBody.active = true;
        this.btnDesginGecko.getChildByName("Sprite_check").active = true;
        Global.DesignMode = DesignMode.CreateGecko;
    }

    onChooseHoleDesignMode() {
        if (Global.DesignMode === DesignMode.CreateHole) {
            this.clearDesignMode();
            this._draggedHole.active = false;
            return;
        }
        
        this.clearDesignMode();
        this._draggedHole.active = true;
        this.btnDesginHole.getChildByName("Sprite_check").active = true;
        Global.DesignMode = DesignMode.CreateHole;
    }

    onChooseWallDesignMode() {
        if (Global.DesignMode === DesignMode.CreateWall) {
            this.clearDesignMode();
            return;
        }

        this.clearDesignMode();
        this.btnDesginWall.getChildByName("Sprite_check").active = true;
        Global.DesignMode = DesignMode.CreateWall;
    }

    onChooseDeleteWall() {
        this.clearDesignMode();
        Global.DesignMode = DesignMode.DeleteWall;
    }

    clearDesignMode() {
        this._draggedGeckoBody.active = false;
        this._draggedHole.active = false;
        this.btnDesginHole.getChildByName("Sprite_check").active = false;
        this.btnDesginGecko.getChildByName("Sprite_check").active = false;
        this.btnDesginWall.getChildByName("Sprite_check").active = false;
        Global.DesignMode = DesignMode.None;

        //set gecko
        if (this._sectionBodies.length > 0) this.setDataGecko();
    }

    //Data
    setDataCells() {
        const col = Global.ColCount;
        const row = Global.RowCount;
        this._editLevelData.cells = [];
        for (let y = 0; y < row; y++) {
            let line = '';
            for (let x = 0; x < col; x++) {
                line += this._grid[y][x].IsWall ? '1' : '0';
            }
            this._editLevelData.cells.push(line);
        }
    }

    addPartDataToCurrentGecko(bodyComp: GeckoBody) {
        const pos = bodyComp.RootPos;
        const part: GeckoPart = {
            r: pos.y,
            c: pos.x,
        };

        if (this._sectionBodies.length === 1) {
            this._currentGeckoData = {
                id: this._idGeckoIncrement,
                type: GeckoType.Normal,
                color: Global.ColorType,
                parts: [part],
            };
        } else {
            this._currentGeckoData.parts!.push(part);
        }
    }

    setDataGecko() {
        if (!this._currentGeckoData?.parts?.length) {
            return;
        }

        const data: GeckoData = {
            ...this._currentGeckoData,
            parts: [...(this._currentGeckoData.parts ?? [])],
        };

        const idx = this._editLevelData.geckos.findIndex((g) => g.id === data.id);
        if (idx !== -1) {
            this._editLevelData.geckos[idx] = data;
        } else {
            this._editLevelData.geckos.push(data);
            this._idGeckoIncrement++;
        }
        this._sectionBodies = [];
    }

    addHoleData(hole: Hole) {
        const pos = hole.RootPos;
        const data: HoleData = {
            id: this._idHoleIncrement,
            type: HoleType.normal,
            color: hole.ColorType,
            // HoleData uses (r, c) = (row, col).
            r: pos.y,
            c: pos.x,
            properties: {},
        };

        this._editLevelData.holes.push(data);
        this._idHoleIncrement++;
    }

    saveData() {
        const timeParsed = Number(this.editBoxTime.string);
        if (!isNaN(timeParsed)) {
            this._editLevelData.time = timeParsed;
        }

        for (let i = 0; i < this.toggleDiff.length; i++) {
            if (this.toggleDiff[i].isChecked) {
                this._editLevelData.difficulty = String(i + 1);
                break;
            }
        }

        this._editLevelData.level = this._levelNumb;
        this.setDataCells();

        const snapshot = JSON.parse(JSON.stringify(this._editLevelData)) as LevelData;
        Data.mergeLevel(this._levelNumb, snapshot);
    }

    onReturnWithoutSave() {
        this.clearDesignMode();
        this.node.active = false;
        EventManager.instance.emit(Event.OPEN_MENU);
    }

    onSaveLevel() {
        this.saveData();
        this.onReturnWithoutSave();
    }
}