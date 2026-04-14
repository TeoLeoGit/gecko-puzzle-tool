import { _decorator, Button, Component, Event as CocosEvent, Node } from 'cc';
import { ButtonChangeColor } from '../ButtonChangeColor';
import { InputSpecialHolePopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { ColorType, HoleType } from '../Type';
import { SpecialHoleHandler } from '../SpecialHoleHandler';
const { ccclass, property } = _decorator;

@ccclass('PopupMultiHole')
export class PopupMultiHole extends Component {
    @property(Button)
    btnChoseColors: Button[] = [];

    @property(Node)
    btnContainer: Node = null!;

    private _chosenColors: ColorType[] = [];
    private _lockedColor: ColorType | null = null;
    private _inputData: InputSpecialHolePopup | null = null;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_MULTI_HOLE_POPUP, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_MULTI_HOLE_POPUP, this.onShow);
    }

    onShow(input: InputSpecialHolePopup) {
        this.resetSelectionState();
        this._inputData = input;
        this._inputData.dataSpecialHole ??= {};
        this.node.active = true;

        const holeColor = input?.holeData?.color;
        if (holeColor == null) {
            return;
        }

        this.lockChosenColor(holeColor, true);

        if (this.hasSpecialType(HoleType.Multi_Hole)) {
            const colors = input.dataSpecialHole?.colors ?? input.holeData.properties?.colors ?? [];
            for (const color of colors) {
                this.lockChosenColor(color);
            }
        }

        this.updateViewSelectedType();
    }

    onClickClose() {
        if (this._inputData?.holeData) {
            this.ensureHoleProperties();
            this._inputData.dataSpecialHole ??= {};
            const colors = this.normalizeMultiHoleColors(this._chosenColors.slice(1));
            if (colors.length > 0) {
                this._inputData.dataSpecialHole.colors = [...colors];
                this._inputData.holeData.properties.colors = [...colors];
            } else {
                delete this._inputData.dataSpecialHole.colors;
                delete this._inputData.holeData.properties.colors;
            }
            SpecialHoleHandler.addSpecialHole(this._inputData);
        }

        EventManager.instance.emit(Event.UPDATE_VIEW_PROPERTIES);
        this.node.active = false;
    }

    onSelectColor(event: CocosEvent, customEventData?: string) {
        const buttonNode = event.target as Node | null;
        const buttonColor = buttonNode?.getComponent(ButtonChangeColor)?.colorId;
        const parsedColor = customEventData !== undefined && customEventData !== ''
            ? Number(customEventData)
            : buttonColor;

        if (parsedColor == null || Number.isNaN(parsedColor)) {
            return;
        }

        const colorType = parsedColor as ColorType;
        const clickedButton = buttonNode?.getComponent(Button);
        if (this._chosenColors.indexOf(colorType) !== -1) {
            const clickedCheck = buttonNode?.getChildByName('Sprite_check');
            if (clickedCheck) {
                clickedCheck.active = true;
            }
            if (clickedButton && colorType !== this._lockedColor) {
                clickedButton.interactable = false;
            }
            return;
        }

        if (this._chosenColors.length === 3) {
            const removedColor = this._chosenColors.splice(1, 1)[0];
            const removedButton = this.getButtonByColor(removedColor);
            const removedCheck = removedButton?.node.getChildByName('Sprite_check');
            if (removedCheck) {
                removedCheck.active = false;
            }
            if (removedButton && removedColor !== this._lockedColor) {
                removedButton.interactable = true;
            }
        }

        this._chosenColors.push(colorType);

        const clickedCheck = buttonNode?.getChildByName('Sprite_check');
        if (clickedCheck) {
            clickedCheck.active = true;
        }
        if (clickedButton) {
            clickedButton.interactable = false;
        }
    }

    private resetSelectionState() {
        this._chosenColors = [];
        this._lockedColor = null;

        for (const button of this.btnChoseColors) {
            button.interactable = true;
            const checkNode = button.node.getChildByName('Sprite_check');
            if (checkNode) {
                checkNode.active = false;
            }
        }
    }

    private lockChosenColor(colorType: ColorType, isBaseColor: boolean = false) {
        if (this._chosenColors.indexOf(colorType) !== -1) {
            return;
        }

        if (isBaseColor) {
            this._lockedColor = colorType;
        }

        this._chosenColors.push(colorType);

        const button = this.getButtonByColor(colorType);
        if (!button) {
            return;
        }

        const checkNode = button.node.getChildByName('Sprite_check');
        if (checkNode) {
            checkNode.active = true;
        }
        button.interactable = false;
    }

    private getButtonByColor(colorType: ColorType): Button | null {
        for (const button of this.btnChoseColors) {
            const colorId = Number(button.clickEvents[0]?.customEventData);
            if (!Number.isNaN(colorId) && colorId === colorType) {
                return button;
            }
        }

        return null;
    }

    private hasSpecialType(holeType: HoleType): boolean {
        if (!this._inputData?.holeData) {
            return false;
        }

        return this._inputData.holeData.type === holeType;
    }

    private updateViewSelectedType() {
        if (!this.btnContainer) {
            return;
        }

        for (const buttonNode of this.btnContainer.children) {
            const button = buttonNode.getComponent(Button);
            if (!button || !button.clickEvents.length) {
                continue;
            }

            const clickEvent = button.clickEvents[0];
            const handler = clickEvent.handler;
            const eventData = Number(clickEvent.customEventData);

            const checkNode = buttonNode.getChildByName('Sprite_check');
            if (checkNode) {
                checkNode.active = false;
            }

            if (handler === 'onSelectColor') {
                const isSelected = this._chosenColors.findIndex(color => color === eventData) !== -1;
                if (checkNode) {
                    checkNode.active = isSelected;
                }
                button.interactable = !isSelected;
            }
        }
    }

    private ensureHoleProperties() {
        this._inputData!.holeData.properties ??= {};
    }

    private normalizeMultiHoleColors(colors: ColorType[]): ColorType[] {
        const normalized: ColorType[] = [];

        for (const color of colors) {
            if (normalized.indexOf(color) === -1) {
                normalized.push(color);
            }
        }

        return normalized;
    }
}
