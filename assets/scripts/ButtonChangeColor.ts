import { _decorator, Component, log } from 'cc';
import { Global } from './Global';
import { Event } from './Constant';
import EventManager from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('ButtonChangeColor')
export class ButtonChangeColor extends Component {
    @property(Number)
    colorId: number = 0;

    onClick() {
        Global.ColorType = this.colorId;
        EventManager.instance.emit(Event.CHANGE_COLOR);
        log(this.colorId);
    }
}


