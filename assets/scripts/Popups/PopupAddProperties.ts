import { _decorator, Component, EditBox, instantiate, Label, Node, Prefab } from 'cc';
import { CarryItemData, CoverData, CoverProperties, GroundData, GroundProperties, HoleData, InputGroundPopup, InputSpecialGeckoPopup, InputSpecialHolePopup, SpecialGeckoData } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
const { ccclass, property } = _decorator;

type EditableData = SpecialGeckoData | CarryItemData | CoverProperties | GroundProperties;
type PopupPropertiesInput = {
    dataCover?: CoverData;
    dataCarryItem?: CarryItemData;
    dataSpecialGecko?: SpecialGeckoData;
    holeData?: HoleData;
    groundData?: GroundData;
};

@ccclass('PopupAddProperties')
export class PopupAddProperties extends Component {
    @property(Node)
    propertiesContainer: Node = null!;

    @property(Prefab)
    itemPropertyPrefab: Prefab = null!;

    private _input: PopupPropertiesInput;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_ADD_PROPERTIES_POPUP, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_ADD_PROPERTIES_POPUP, this.onShow);
    }

    onShow(input: InputSpecialGeckoPopup | InputSpecialHolePopup | InputGroundPopup) {
        this.node.active = true;
        this._input = input;

        this.propertiesContainer.removeAllChildren();

        const targetData = this.getEditableData();
        const propertyNames = Object.keys(targetData);
        for (const propertyName of propertyNames) {
            if ((this._input?.dataCarryItem || this._input?.dataCover) && propertyName === 'type') {
                continue;
            }

            const propertyValue = targetData[propertyName];
            if (propertyValue === undefined) {
                continue;
            }

            const itemProperty = instantiate(this.itemPropertyPrefab);
            itemProperty.name = propertyName;
            this.propertiesContainer.addChild(itemProperty);

            const labelNode = itemProperty.getChildByName('Label_property_name');
            const editBoxNode = itemProperty.getChildByName('EditBox_value');

            const label = labelNode?.getComponent(Label);
            if (label) {
                label.string = propertyName;
            }

            const editBox = editBoxNode?.getComponent(EditBox);
            if (editBox) {
                editBox.string = Array.isArray(propertyValue)
                    ? propertyValue.join(',')
                    : String(propertyValue);
                editBox.node.on(EditBox.EventType.TEXT_CHANGED, this.onValueChanged, this);
            }
        }
    }

    onClickClose() {
        EventManager.instance.emit(Event.UPDATE_VIEW_PROPERTIES);
        this.node.active = false;
    }

    onValueChanged(editBox: EditBox) {
        const value = editBox.string;
        const propertyName = editBox.node.parent?.name;
        const targetData = this.getEditableData();
        if (!propertyName || !targetData) return;

        const currentValue = targetData[propertyName];
        if (Array.isArray(currentValue)) {
            const parsedValues = value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '')
                .map((item) => Number(item));

            targetData[propertyName] = parsedValues;
            return;
        }

        const parsed = Number(value);
        if (!isNaN(parsed)) {
            targetData[propertyName] = parsed;
            return;
        }

        targetData[propertyName] = value;
    }

    private getEditableData(): EditableData {
        if (this._input?.dataCover) {
            this._input.dataCover.properties ??= {};
            return this._input.dataCover.properties;
        }

        if (this._input?.dataCarryItem) {
            return this._input.dataCarryItem;
        }

        if (this._input?.holeData) {
            this._input.holeData.properties ??= {};
            return this._input.holeData.properties;
        }

        if (this._input?.groundData) {
            this._input.groundData.properties ??= {};
            return this._input.groundData.properties;
        }

        if (this._input?.dataSpecialGecko) {
            return this._input.dataSpecialGecko;
        }

        this._input.dataSpecialGecko = {};
        return this._input.dataSpecialGecko;
    }
}
