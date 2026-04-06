import { _decorator, Component, input, Label } from 'cc';
import { Event } from '../Constant';
import EventManager from '../EventManager';
const { ccclass, property } = _decorator;

@ccclass('PopupDesignError')
export class PopupDesignError extends Component {
    @property(Label)
    labelError: Label = null!;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_DESIGN_ERROR_POPUP, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_DESIGN_ERROR_POPUP, this.onShow);
    }

    onShow(errorString: string) {
        this.node.active = true;
        this.labelError.string = errorString;
    }

    onClickClose() {
        this.node.active = false;
    }
}


