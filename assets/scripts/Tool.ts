import { _decorator, Camera, Component, EventMouse, Input, input, Prefab, Vec3, Node, log, instantiate, Sprite, UITransform, EditBox, Layout, Toggle, Label } from "cc";
import { Cell } from "./Cell";
import { Config, GeckoData, GeckoPart, HoleData, InputSpecialGeckoPopup, LevelData } from "./Config";
import { Global } from "./Global";
import { Event } from './Constant';
import EventManager from "./EventManager";
import { DesignMode, GeckoType, HoleType } from "./Type";
import { GeckoBody } from "./GeckoBody";
import { Hole } from "./Hole";
import { Data } from "./Data";
import { getColor } from "./Utils";
import { SpecialGeckoHandler } from "./SpecialGeckoHandler";
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
    btnDeleteGecko: Node = null;

    @property(Node)
    btnDesginWall: Node = null!;

    @property(Node)
    btnDesginSpecialType: Node = null!;

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

    @property(Label)
    lblLevel: Label = null!;

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
    private _mapGeckoIdAndParts: Map<number, GeckoBody[]> = new Map();

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
        this.editBoxTime.node.on(EditBox.EventType.TEXT_CHANGED, this.onTimeChanged, this);

        EventManager.instance.on(Event.CHANGE_COLOR, this.onChangeColor, this);
        EventManager.instance.on(Event.CHOOSE_GECKO_BODY, this.onChooseGeckoDesignMode, this);
        EventManager.instance.on(Event.CHOOSE_HOLE, this.onChooseHoleDesignMode, this);
        EventManager.instance.on(Event.EDIT_LEVEL, this.loadLevel, this);
        EventManager.instance.on(Event.ON_CHANGE_GECKO_TO_SPECIAL, this.onShowPopupSpecialGecko, this);

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
        this.editBoxTime.node.off(EditBox.EventType.TEXT_CHANGED, this.onTimeChanged, this);

        EventManager.instance.off(Event.CHANGE_COLOR, this.onChangeColor);
        EventManager.instance.off(Event.CHOOSE_GECKO_BODY, this.onChooseGeckoDesignMode);
        EventManager.instance.off(Event.CHOOSE_HOLE, this.onChooseHoleDesignMode);
        EventManager.instance.off(Event.EDIT_LEVEL, this.loadLevel);
        EventManager.instance.off(Event.ON_CHANGE_GECKO_TO_SPECIAL, this.onShowPopupSpecialGecko);
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
        if (Global.DesignMode === DesignMode.CreateGecko) {
            const snappedPos = this.getClosestGridPosition(this._draggedGeckoBody.worldPosition);
            if (snappedPos) this.createGeckoBodyAt(snappedPos);
        }
        if (Global.DesignMode === DesignMode.DeleteGecko) {
            const snappedPos = this.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
            this.deleteGeckoBody(snappedPos);
        }

        if (Global.DesignMode === DesignMode.CreateWall) {
            this.createWall(event);
        }

        if (Global.DesignMode === DesignMode.DeleteWall) {
            this.deleteWall(event);
        }
    }

    screenToWorld(screenPos: Vec3): Vec3 {
        const out = new Vec3();
        this.mainCamera.screenToWorld(screenPos, out);
        return out;
    }

    init() {
        //Drag gecko body
        if (!this._draggedGeckoBody) {
            const body = instantiate(this.bodyGeckoPrefab);
            this.previewLayer.addChild(body);
            const bodyPos = this.previewLayer.getComponent(UITransform).convertToNodeSpaceAR(this._mousePos);
            body.setPosition(bodyPos);
            body.getComponent(GeckoBody).removeBtn();
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
        this._editLevelData = data;

        //Create
        this.onGridDimChanged(Global.ColCount, Global.RowCount);
        this.loadWallCells(data.cells);
        this.scheduleOnce(() => {
            this.loadGeckos(data.geckos);
            this.loadHoles(data.holes);
        }, 0.3);

        this.node.active = true;
        this._levelNumb = level;
        if (data.time) {
            this.editBoxTime.string = data.time.toString();
        } else this.editBoxTime.string = '0';
        this.lblLevel.string = `Level ${level}`;
    }

    loadGeckos(geckoData: GeckoData[]) {
        this._sectionBodies = [];
        this._currentGeckoData = null;
        this._idGeckoIncrement = 0;
        this._mapGeckoIdAndParts.clear();

        if (geckoData.length === 0) {
            return;
        }

        let maxGeckoId = -1;
        for (const gecko of geckoData) {
            if (!gecko?.parts?.length) continue;

            maxGeckoId = Math.max(maxGeckoId, gecko.id ?? -1);
            let prevBody: GeckoBody | null = null;

            for (let i = 0; i < gecko.parts.length; i++) {
                const part = gecko.parts[i];
                const row = part.r;
                const col = part.c;
                const cell = this._grid[row]?.[col];
                if (!cell || !cell.node.active || cell.IsWall || !cell.IsEmpty) {
                    continue;
                }

                const bodyNode = instantiate(this.bodyGeckoPrefab);
                this.geckoParent.addChild(bodyNode);
                bodyNode.setWorldPosition(cell.node.worldPosition);

                cell.IsEmpty = false;
                cell.setContainForGeckoBody(bodyNode);

                const bodyComponent = bodyNode.getComponent(GeckoBody);
                bodyComponent.setRoot(col, row);
                bodyComponent.setGeckoId(gecko.id);
                bodyComponent.setColor(gecko.color);

                if (prevBody) {
                    bodyComponent.setDirection(prevBody.RootPos);
                } else {
                    bodyComponent.setHead(gecko.color);
                }

                if (i === 1 && prevBody) {
                    prevBody.setHeadLookDirection(bodyComponent.RootPos);
                }

                this.addGeckoPartToMap(gecko.id, bodyComponent);
                prevBody = bodyComponent;
            }

            if (gecko.type !== GeckoType.Normal) {
                this.loadSpecialGecko(gecko);
            }
        }

        this._idGeckoIncrement = maxGeckoId + 1;
    }

    loadSpecialGecko(geckoData: GeckoData) {
        const geckoParts = this._mapGeckoIdAndParts.get(geckoData.id) ?? [];
        if (geckoParts.length === 0) {
            return;
        }

        const input: InputSpecialGeckoPopup = {
            geckoData,
            geckoParts,
            specialType: geckoData.type,
            dataSpecialGecko: geckoData.properties?.specialGecko ?? {},
        };

        SpecialGeckoHandler.addSpecialGecko(input);
    }

    loadHoles(holeData: HoleData[]) {
        this._idHoleIncrement = 0;

        if (!Array.isArray(holeData) || holeData.length === 0) {
            return;
        }

        let maxHoleId = -1;
        for (const hole of holeData) {
            const row = hole?.r;
            const col = hole?.c;
            const cell = this._grid[row]?.[col];

            maxHoleId = Math.max(maxHoleId, hole?.id ?? -1);
            if (!cell || !cell.node.active || cell.IsWall || !cell.IsEmpty) {
                continue;
            }

            const holeNode = instantiate(this.holePrefab);
            this.holeParent.addChild(holeNode);
            holeNode.setWorldPosition(cell.node.worldPosition);

            cell.IsEmpty = false;
            cell.setContainForGeckoBody(holeNode);

            const holeComponent = holeNode.getComponent(Hole);
            holeComponent.setRoot(col, row);
            holeComponent.setColor(hole.color);
        }

        this._idHoleIncrement = maxHoleId + 1;
    }

    loadWallCells(cells: string[]) {
        if (!Array.isArray(cells) || cells.length === 0) {
            this.initWalls(Global.ColCount, Global.RowCount);
            return;
        }

        const rowCount = Math.min(Global.RowCount, cells.length);
        const rowsFromBottom = [...cells].reverse();

        for (let y = 0; y < rowCount; y++) {
            const rowData = rowsFromBottom[y] ?? "";
            const colCount = Math.min(Global.ColCount, rowData.length);

            for (let x = 0; x < colCount; x++) {
                const cell = this._grid[y]?.[x];
                if (!cell || !cell.node.active) {
                    continue;
                }

                if (rowData[x] === '1') {
                    cell.setWall();
                } else {
                    cell.deleteWall();
                }
            }
        }
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

        this.clearGeckoBodies();
        this.clearHoles();
        this.initWalls(col, row);
    }

    onTimeChanged(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed) && parsed < 0) {
            log(`Invalid number: "${value}"`);
        } else {
            this._editLevelData.time = parsed;
            log(`Time changed: ${this._editLevelData.time}`);
        }
    }

    onDifficultyChange(toggle?: Toggle, customEventData?: string) {
        if (toggle && !toggle.isChecked) {
            return;
        }

        let difficulty = 1;

        if (customEventData !== undefined && customEventData !== '') {
            const parsed = Number(customEventData);
            if (!isNaN(parsed)) {
                difficulty = parsed;
            }
        } else if (toggle) {
            const idx = this.toggleDiff.indexOf(toggle);
            if (idx !== -1) {
                difficulty = idx + 1;
            }
        }

        difficulty = Math.max(1, Math.min(3, difficulty));
        this._editLevelData.difficulty = String(difficulty);
    }

    clearGeckoBodies() {
        for (const child of this.geckoParent.children) {
            child.destroy();
        }
        this.geckoParent.removeAllChildren();
        this._mapGeckoIdAndParts.clear();
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
            bodyComponent.setGeckoId(this._idGeckoIncrement);
            bodyComponent.setColor(Global.ColorType);
            bodyComponent.setRoot(rootCell.X, rootCell.Y);
            if (this._sectionBodies.length > 0) {
                if (this._sectionBodies.length === 1) {
                    this._sectionBodies[0].setHeadLookDirection(bodyComponent.RootPos);
                }
                bodyComponent.setDirection(this._sectionBodies[this._sectionBodies.length - 1].RootPos);
            } else {
                bodyComponent.setHead(Global.ColorType);
            }
            this._sectionBodies.push(bodyComponent);
            this.addGeckoPartToMap(this._idGeckoIncrement, bodyComponent);

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
            const cell = targetCell.getComponent(Cell);
            if (!cell || !cell.IsEmpty) return;
            cell.setWall();
        }
    }

    deleteGeckoBody(position: Vec3) {
        const targetCellNode = this.findCellAt(position);
        if (!targetCellNode) return;

        const targetCell = targetCellNode.getComponent(Cell);
        if (!targetCell) return;

        let targetGeckoId: number | null = null;
        let targetBodyIndex = -1;

        for (const [geckoId, geckoParts] of this._mapGeckoIdAndParts.entries()) {
            const foundIndex = geckoParts.findIndex((bodyPart) => {
                const rootPos = bodyPart.RootPos;
                return rootPos.x === targetCell.X && rootPos.y === targetCell.Y;
            });

            if (foundIndex !== -1) {
                targetGeckoId = geckoId;
                targetBodyIndex = foundIndex;
                break;
            }
        }

        if (targetGeckoId == null || targetBodyIndex === -1) {
            return;
        }

        const geckoParts = this._mapGeckoIdAndParts.get(targetGeckoId) ?? [];
        if (targetBodyIndex !== geckoParts.length - 1) {
            return;
        }

        const targetBody = geckoParts[targetBodyIndex];
        if (!targetBody) return;

        EventManager.instance.emit(Event.DELETE_ONE_BODY, {
            x: targetBody.RootPos.x,
            y: targetBody.RootPos.y,
            icon: '',
            rootObj: targetBody.node,
        });
        targetBody.node.destroy();

        geckoParts.splice(targetBodyIndex, 1);

        const geckoData = this._editLevelData.geckos.find((gecko) => gecko.id === targetGeckoId);
        if (geckoData?.parts) {
            geckoData.parts = geckoData.parts.filter((part) => !(part.c === targetCell.X && part.r === targetCell.Y));
        }

        if (geckoParts.length === 0 || !geckoData?.parts?.length) {
            this._mapGeckoIdAndParts.delete(targetGeckoId);
            this._editLevelData.geckos = this._editLevelData.geckos.filter((gecko) => gecko.id !== targetGeckoId);
        } else {
            this._mapGeckoIdAndParts.set(targetGeckoId, geckoParts);

            const geckoColor = geckoData.color;
            geckoParts[0].setHead(geckoColor);
            if (geckoParts.length > 1) {
                geckoParts[0].setHeadLookDirection(geckoParts[1].RootPos);
            }

            for (let i = 1; i < geckoParts.length; i++) {
                geckoParts[i].nodeArrow.active = true;
                geckoParts[i].setDirection(geckoParts[i - 1].RootPos);
            }
        }

        if (this._currentGeckoData?.id === targetGeckoId) {
            if (!this._currentGeckoData.parts?.length) {
                this._currentGeckoData = null;
                this._sectionBodies = [];
            } else {
                this._currentGeckoData.parts = this._currentGeckoData.parts.filter(
                    (part) => !(part.c === targetCell.X && part.r === targetCell.Y),
                );
                this._sectionBodies = this._sectionBodies.filter((bodyPart) => bodyPart !== targetBody);
            }
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

    onChooseGeckoDeleteMode() {
        if (Global.DesignMode === DesignMode.DeleteGecko) {
            this.clearDesignMode();
            return;
        }
        
        this.clearDesignMode();
        this.btnDeleteGecko.getChildByName("Sprite_check").active = true;
        Global.DesignMode = DesignMode.DeleteGecko;
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

    onChooseSpecialTypeMode() {
        this.clearDesignMode();
        this.btnDesginSpecialType.getChildByName("Sprite_check").active = true;
        for (const geckoParts of this._mapGeckoIdAndParts.values()) {
            for (const bodyPart of geckoParts) {
                bodyPart.enableBtn();
            }
        }

    }

    onShowPopupSpecialGecko(geckoId: number) {
        const geckoData = this._editLevelData.geckos.find((gecko) => gecko.id === geckoId);
        if (!geckoData) {
            return;
        }

        if (!geckoData.properties) {
            geckoData.properties = {};
        }
        if (!geckoData.properties.specialGecko) {
            geckoData.properties.specialGecko = {};
        }

        const input: InputSpecialGeckoPopup = {
            geckoData,
            geckoParts: this._mapGeckoIdAndParts.get(geckoId),
            specialType: geckoData.type,
            dataSpecialGecko: geckoData.properties.specialGecko,
        };

        EventManager.instance.emit(Event.SHOW_SPECIAL_GECKO_POPUP, input);
    }

    clearDesignMode() {
        this._draggedGeckoBody.active = false;
        this._draggedHole.active = false;
        this.btnDesginHole.getChildByName("Sprite_check").active = false;
        this.btnDesginGecko.getChildByName("Sprite_check").active = false;
        this.btnDesginWall.getChildByName("Sprite_check").active = false;
        this.btnDesginSpecialType.getChildByName("Sprite_check").active = false;
        this.btnDeleteGecko.getChildByName("Sprite_check").active = false;

        Global.DesignMode = DesignMode.None;

        for (const geckoParts of this._mapGeckoIdAndParts.values()) {
            for (const bodyPart of geckoParts) {
                bodyPart.disableBtn();
            }
        }

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
        this._editLevelData.cells.reverse();
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

    private addGeckoPartToMap(geckoId: number, bodyComp: GeckoBody) {
        const geckoParts = this._mapGeckoIdAndParts.get(geckoId) ?? [];
        geckoParts.push(bodyComp);
        this._mapGeckoIdAndParts.set(geckoId, geckoParts);
    }

    setDataGecko() {
        if (!this._currentGeckoData?.parts?.length) {
            return;
        }

        const data: GeckoData = {
            ...this._currentGeckoData,
            parts: [...(this._currentGeckoData.parts ?? [])],
        };
        log('geko')
        const idx = this._editLevelData.geckos.findIndex((g) => g.id === data.id);
        if (idx !== -1) {
            this._editLevelData.geckos[idx] = data;
        } else {
            this._editLevelData.geckos.push(data);
            this._idGeckoIncrement++;
            log('new gecko!');
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

    hasDesignErrorInLevel(): boolean {
        const requiredHoleByColor: Map<number, number> = new Map();
        const availableHoleByColor: Map<number, number> = new Map();

        for (const gecko of this._editLevelData.geckos) {
            requiredHoleByColor.set(
                gecko.color,
                (requiredHoleByColor.get(gecko.color) ?? 0) + 1,
            );

            if (gecko.type === GeckoType.Stacked) {
                const stackColors = gecko.properties?.specialGecko?.stackColors ?? [];
                for (const stackColor of stackColors) {
                    requiredHoleByColor.set(
                        stackColor,
                        (requiredHoleByColor.get(stackColor) ?? 0) + 1,
                    );
                }
            }
        }

        for (const hole of this._editLevelData.holes) {
            availableHoleByColor.set(
                hole.color,
                (availableHoleByColor.get(hole.color) ?? 0) + 1,
            );
        }

        let requiredTotal = 0;
        let availableTotal = 0;
        for (const count of requiredHoleByColor.values()) {
            requiredTotal += count;
        }
        for (const count of availableHoleByColor.values()) {
            availableTotal += count;
        }

        if (requiredTotal !== availableTotal) {
            return true;
        }

        for (const [color, requiredCount] of requiredHoleByColor.entries()) {
            const availableCount = availableHoleByColor.get(color) ?? 0;
            if (availableCount < requiredCount) {
                return true;
            }
        }

        return false;
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
        this.clearHoles();
        this.clearGeckoBodies();
        this.node.active = false;
        EventManager.instance.emit(Event.OPEN_MENU);
    }

    onSaveLevel() {
        if (this.hasDesignErrorInLevel()) {
            EventManager.instance.emit(Event.SHOW_DESIGN_ERROR_POPUP, "Số gecko và lỗ chưa phù hợp, kiểm tra cả stack gecko!");
            return;
        }

        this.saveData();
        this.onReturnWithoutSave();
    }
}
