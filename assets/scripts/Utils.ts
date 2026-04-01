import { _decorator, Color, Component, Node } from 'cc';
import { ColorType } from './Type';
const { ccclass, property } = _decorator;

export const getColor = (color: ColorType): Color => {
    switch (color) {
        case ColorType.Red:
            return Color.RED.clone();

        case ColorType.Green:
            return new Color(0x78, 0xD0, 0x22, 0xFF);

        case ColorType.Blue:
            return Color.BLUE.clone();

        case ColorType.Yellow:
            return Color.YELLOW.clone();

        case ColorType.Cyan:
            return Color.CYAN.clone();

        case ColorType.Purple:
            return new Color(128, 0, 128, 255);

        case ColorType.Orange:
            return new Color(255, 128, 0, 255);

        case ColorType.Pink:
            return new Color(255, 102, 179, 255);

        case ColorType.Brown:
            return new Color(102, 64, 26, 255);

        case ColorType.Black:
            return Color.BLACK.clone();

        default:
            return Color.WHITE.clone();
    }
}


