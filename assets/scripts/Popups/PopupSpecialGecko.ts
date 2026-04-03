import { _decorator, Component, Event as CocosEvent, Node, log } from 'cc';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { GeckoType } from '../Type';
import { InputSpecialGeckoPopup } from '../Config';
const { ccclass, property } = _decorator;

@ccclass('PopupSpecialGecko')
export class PopupSpecialGecko extends Component {

    private _input: InputSpecialGeckoPopup;
    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_SPECIAL_GECKO_POPUP, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_SPECIAL_GECKO_POPUP, this.onShow);
    }

    onShow(input: InputSpecialGeckoPopup) {
        this.node.active = true;
        this._input = input;
    }

    onClickClose() {
        this.node.active = false;
    }

    onChooseSpecialGecko(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const geckoType = parsed as GeckoType;
        log('check type '+ geckoType);
        if (geckoType === GeckoType.Stacked) {
            EventManager.instance.emit(Event.OPEN_POPUP_STACK_GECKO, this._input);
        }
    }
}


