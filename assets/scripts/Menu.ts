import { _decorator, Component, EditBox, Prefab } from "cc";
import { ItemLevel } from "./ItemLevel";

const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    @property(Node)
    levelContainer: Node = null!;

    @property(EditBox)
    editBox: EditBox = null!;

    @property(Prefab)
    prefabItemLevel: Prefab = null!;

    itemLevels: ItemLevel[] = []

    init() {
        
    }
}