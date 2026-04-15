import { _decorator, Component, EditBox, Prefab, Node, instantiate, log } from "cc";
import { ItemLevel } from "./ItemLevel";
import { Data } from "./Data";
import EventManager from "./EventManager";
import { Event } from "./Constant";
import { LevelData } from "./Config";


const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    @property(Node)
    levelContainer: Node = null!;

    @property(EditBox)
    editBox: EditBox = null!;

    @property(Prefab)
    prefabItemLevel: Prefab = null!;

    itemLevels: ItemLevel[] = [];

    protected onLoad(): void {
        EventManager.instance.on(Event.INIT_MENU, this.init, this);
        EventManager.instance.on(Event.EDIT_LEVEL, this.onEditLevel, this);
        EventManager.instance.on(Event.OPEN_MENU, this.openMenu, this);

        this.editBox.node.on(EditBox.EventType.TEXT_CHANGED, this.onFindLevelValueChanged, this);
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.INIT_MENU, this.init, this);
        EventManager.instance.off(Event.EDIT_LEVEL, this.onEditLevel, this);
        EventManager.instance.off(Event.OPEN_MENU, this.openMenu, this);
    }

    init() {
        const levels = Data.Levels;

        levels.forEach(level => {
            const item = instantiate(this.prefabItemLevel);
            item.parent = this.levelContainer;
            item.getComponent(ItemLevel).init(level);
            this.itemLevels.push(item.getComponent(ItemLevel));
        })
    }

    saveLevel() {
        Data.saveLevels();
    }

    addNewLevel() {
        let newLevel: LevelData = {
            level: Data.nextLevelId(),
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
        Data.addNewLevel(newLevel);
        const item = instantiate(this.prefabItemLevel);
        item.parent = this.levelContainer;
        item.getComponent(ItemLevel).init(newLevel);
        this.itemLevels.push(item.getComponent(ItemLevel));
    }

    onEditLevel() {
        this.node.active = false;
    }

    openMenu() {
        this.node.active = true;
    }

    onFindLevelValueChanged(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed)) {
            log(`Invalid number: "${value}"`);
            this.itemLevels.forEach(item => item.node.active = true);
        } else {
            this.itemLevels.forEach(item => item.filterLevel(parsed));
        }
    }
}