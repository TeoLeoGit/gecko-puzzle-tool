import { _decorator, Component, Label, log, Node } from 'cc';
import EventManager from './EventManager';
import { LevelData } from './Config';
import { Event } from './Constant';
const { ccclass, property } = _decorator;

@ccclass('ItemLevel')
export class ItemLevel extends Component {
   @property(Label)
   lblLevel: Label = null!;

   private _level: LevelData = null;
   private _levelNumb: number = -1;

   public get Level(): LevelData {
       return this._level;
   }

   init(levelData: LevelData) {
       this.lblLevel.string = `LEVEL ${levelData.level}`;
       this._levelNumb = levelData.level;
       this._level = levelData;
   }

   onClickEdit() {
       EventManager.instance.emit(Event.EDIT_LEVEL, this._levelNumb);
   }

   filterLevel(filterNumber: number) {
       const contains = this._levelNumb
       .toString()
       .indexOf(filterNumber.toString()) !== -1;

       if (contains) {
           this.node.active = true;
       } else {
           this.node.active = false;
       }
   }

   
}