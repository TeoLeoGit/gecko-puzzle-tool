import { ColorType, DesignMode } from "./Type";

export class Global {
    public static DesignMode: DesignMode = DesignMode.None;
    public static ColorType: ColorType = ColorType.Red;
    public static ColCount: number = 7;
    public static RowCount: number = 9;
    public static HoleX: number = 0;
    public static HoleY: number = 0;
}