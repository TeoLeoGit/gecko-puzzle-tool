import { _decorator, Component } from 'cc';
import { Data } from './Data';
const { ccclass, property } = _decorator;

@ccclass('Load')
export class Load extends Component {
    protected onLoad(): void {
        Data.loadLevels(() => {
            //BJEventManager.instance.emit(EVENT.INIT_MENU);
        });
    }
}


