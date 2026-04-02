import { Config } from "./Config";
import { ColorType, DesignMode } from "./Type";

export class Global {
    public static DesignMode: DesignMode = DesignMode.None;
    public static ColorType: ColorType = ColorType.Red;
    public static ColCount: number = Config.MAX_COLUMN;
    public static RowCount: number = Config.MAX_ROW;
    public static HoleX: number = 0;
    public static HoleY: number = 0;
}