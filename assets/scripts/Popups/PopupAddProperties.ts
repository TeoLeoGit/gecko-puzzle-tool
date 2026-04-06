import { _decorator, Component, EditBox, instantiate, Label, Node, Prefab } from 'cc';
import { InputSpecialGeckoPopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
const { ccclass, property } = _decorator;

@ccclass('PopupAddProperties')
export class PopupAddProperties extends Component {
    @property(Node)
    propertiesContainer: Node = null!;

    @property(Prefab)
    itemPropertyPrefab: Prefab = null!;

    private _input: InputSpecialGeckoPopup;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_ADD_PROPERTIES_POPUP, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_ADD_PROPERTIES_POPUP, this.onShow);
    }

    onShow(input: InputSpecialGeckoPopup) {
        this.node.active = true;
        this._input = input;

        this.propertiesContainer.removeAllChildren();

        const dataSpecialGecko = this._input?.dataSpecialGecko ?? {};
        const propertyNames = Object.keys(dataSpecialGecko);
        for (const propertyName of propertyNames) {
            const propertyValue = dataSpecialGecko[propertyName];
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
        if (!propertyName || !this._input?.dataSpecialGecko) return;

        const currentValue = this._input.dataSpecialGecko[propertyName];
        if (Array.isArray(currentValue)) {
            const parsedValues = value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '')
                .map((item) => Number(item));

            this._input.dataSpecialGecko[propertyName] = parsedValues;
            return;
        }

        const parsed = Number(value);
        if (!isNaN(parsed)) {
            this._input.dataSpecialGecko[propertyName] = parsed;
            return;
        }

        this._input.dataSpecialGecko[propertyName] = value;
    }
}
