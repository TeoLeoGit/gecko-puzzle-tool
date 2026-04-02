import { _decorator, Component } from 'cc';
import { Data } from './Data';
import EventManager from './EventManager';
import { Event } from './Constant';
const { ccclass, property } = _decorator;

@ccclass('Load')
export class Load extends Component {
    protected onLoad(): void {
        Data.loadLevels(() => {
            EventManager.instance.emit(Event.INIT_MENU);
        });
    }
}


