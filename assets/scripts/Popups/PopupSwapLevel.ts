import { _decorator, Component, EditBox, log, Node } from 'cc';
import EventManager from '../EventManager';
import { Event } from '../Constant';
import { Data } from '../Data';
const { ccclass, property } = _decorator;

@ccclass('PopupSwapLevel')
export class PopupSwapLevel extends Component {
    @property(EditBox)
    editBoxLevel1: EditBox;

    @property(EditBox)
    editBoxLevel2: EditBox;

    private _fistLevel: number;
    private _secLevel: number;

    protected onLoad(): void {
        this.node.active = false;
        this.editBoxLevel1.node.on(EditBox.EventType.TEXT_CHANGED, this.onLevelSwap1Changed, this);
        this.editBoxLevel2.node.on(EditBox.EventType.TEXT_CHANGED, this.onLevelSwap2Changed, this);
        EventManager.instance.on(Event.SHOW_LEVEL_SWAP_EDITOR, this.show, this);
    }

    protected onDestroy(): void {
        this.editBoxLevel1.node.off(EditBox.EventType.TEXT_CHANGED, this.onLevelSwap1Changed, this);
        this.editBoxLevel2.node.off(EditBox.EventType.TEXT_CHANGED, this.onLevelSwap2Changed, this);
        EventManager.instance.off(Event.SHOW_LEVEL_SWAP_EDITOR, this.show, this);
    }

    show() {
        this._fistLevel = null;
        this._secLevel = null;
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    onLevelSwap1Changed(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed)) {
            log(`Invalid number: "${value}"`);
        } else {
            if (parsed > 0) {
                this._fistLevel = parsed;
                log(parsed)
            }
        }
    }

    onLevelSwap2Changed(editBox: EditBox) {
        const value = editBox.string;
        const parsed = Number(value);

        if (isNaN(parsed)) {
            log(`Invalid number: "${value}"`);
        } else {
            if (parsed > 0) {
                this._secLevel = parsed;
                log(parsed)
            }
        }
    }

    swap() {
        if (this._fistLevel && this._secLevel) {
            Data.swapLevel(this._fistLevel, this._secLevel);
            this.hide();
        }
    }
}


