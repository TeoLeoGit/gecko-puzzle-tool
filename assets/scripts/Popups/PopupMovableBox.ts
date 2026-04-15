import { _decorator, Component, EditBox, Node, Toggle } from 'cc';
import { InputGroundPopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { MoveableBoxDirection } from '../Type';
const { ccclass, property } = _decorator;

@ccclass('PopupMovableBox')
export class PopupMovableBox extends Component {
    @property(EditBox)
    editBoxWidth: EditBox = null!;

    @property(EditBox)
    editBoxHeight: EditBox = null!;

    @property([Toggle])
    dirToggles: Toggle[] = [];

    private _input: InputGroundPopup;
    private _isRefreshing = false;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_MOVABLE_BOX_POPUP, this.onShow, this);
        this.editBoxWidth.node.on(EditBox.EventType.TEXT_CHANGED, this.onValueChanged, this);
        this.editBoxHeight.node.on(EditBox.EventType.TEXT_CHANGED, this.onValueChanged, this);
        for (const toggle of this.dirToggles) {
            toggle.node.on(Toggle.EventType.TOGGLE, this.onDirToggleChanged, this);
        }
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_MOVABLE_BOX_POPUP, this.onShow, this);
        this.editBoxWidth.node.off(EditBox.EventType.TEXT_CHANGED, this.onValueChanged, this);
        this.editBoxHeight.node.off(EditBox.EventType.TEXT_CHANGED, this.onValueChanged, this);
        for (const toggle of this.dirToggles) {
            toggle.node.off(Toggle.EventType.TOGGLE, this.onDirToggleChanged, this);
        }
    }

    onShow(input: InputGroundPopup) {
        this.node.active = true;
        this._input = input;
        this.refreshView();
    }

    onClickClose() {
        EventManager.instance.emit(Event.UPDATE_GROUND_VIEW_PROPERTIES);
        this.node.active = false;
    }

    onValueChanged(editBox: EditBox) {
        if (this._isRefreshing) {
            return;
        }

        const groundData = this._input?.groundData;
        const properties = groundData?.properties;
        if (!groundData || !properties) {
            return;
        }

        const parsedValue = Number(editBox.string);
        if (Number.isNaN(parsedValue)) {
            return;
        }

        if (editBox === this.editBoxWidth) {
            properties.colEnd = groundData.c + parsedValue;
            return;
        }

        if (editBox === this.editBoxHeight) {
            properties.rowEnd = groundData.r + parsedValue;
        }
    }

    onDirToggleChanged(toggle: Toggle) {
        if (this._isRefreshing || !toggle.isChecked) {
            return;
        }

        const groundData = this._input?.groundData;
        const properties = groundData?.properties;
        if (!groundData || !properties) {
            return;
        }

        const toggleIndex = this.dirToggles.indexOf(toggle);
        if (toggleIndex === -1) {
            return;
        }

        properties.dir = toggleIndex as MoveableBoxDirection;
    }

    private refreshView() {
        const groundData = this._input?.groundData;
        const properties = groundData?.properties;
        if (!groundData || !properties) {
            return;
        }

        this._isRefreshing = true;
        this.editBoxWidth.string = String((properties.colEnd ?? groundData.c) - groundData.c);
        this.editBoxHeight.string = String((properties.rowEnd ?? groundData.r) - groundData.r);

        const currentDir = properties.dir ?? MoveableBoxDirection.Both;
        for (let i = 0; i < this.dirToggles.length; i++) {
            this.dirToggles[i].isChecked = i === currentDir;
        }

        this._isRefreshing = false;

    }
}
