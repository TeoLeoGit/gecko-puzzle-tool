import { _decorator, Button, Component, Event as CocosEvent, Node, Sprite, UITransform, log } from 'cc';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { InputSpecialGeckoPopup } from '../Config';
import { ColorType, GeckoType } from '../Type';
import { getColor, setSprite } from '../Utils';
import { ButtonChangeColor } from '../ButtonChangeColor';
import { SpecialGeckoHandler } from '../SpecialGeckoHandler';
const { ccclass, property } = _decorator;

@ccclass('PopupStackGecko')
export class PopupStackGecko extends Component {
    @property(Button)
    btnChoseColors: Button[] = [];

    @property(Node)
    chosenColorContainer: Node = null!;

    private _chosenColors: ColorType[] = [];
    private _lockedColor: ColorType | null = null;
    private _inputData: InputSpecialGeckoPopup | null = null;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_POPUP_STACK_GECKO, this.onShow, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_POPUP_STACK_GECKO, this.onShow);
    }

    onShow(input: InputSpecialGeckoPopup) {
        this.resetSelectionState();
        this._inputData = input;
        this.node.active = true;

        const geckoColor = input?.geckoData?.color;
        if (geckoColor == null) {
            return;
        }

        this._lockedColor = geckoColor;
        this._chosenColors.push(geckoColor);
        this.addChosenColorPreview(geckoColor);

        const lockedButton = this.getButtonByColor(geckoColor);
        if (!lockedButton) {
            return;
        }

        const checkNode = lockedButton.node.getChildByName('Sprite_check');
        if (checkNode) {
            checkNode.active = true;
        }
        lockedButton.interactable = false;
    }

    onClickClose() {
        if (this._inputData?.geckoData) {
            this._inputData.geckoData.type = GeckoType.Stacked;
            if (!this._inputData.geckoData.properties) {
                this._inputData.geckoData.properties = {};
            }
            this._inputData.geckoData.properties.specialGecko = this._inputData.dataSpecialGecko;
            this._inputData.dataSpecialGecko.stackColors = [...this._chosenColors.slice(1, 3)];
            SpecialGeckoHandler.addSpecialGecko(this._inputData);
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
            const removedPreview = this.chosenColorContainer.children[1];
            if (removedPreview) {
                removedPreview.destroy();
            }

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
        this.addChosenColorPreview(colorType);

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

        for (const child of this.chosenColorContainer.children) {
            child.destroy();
        }
        this.chosenColorContainer.removeAllChildren();

        for (const button of this.btnChoseColors) {
            button.interactable = true;
            const checkNode = button.node.getChildByName('Sprite_check');
            if (checkNode) {
                checkNode.active = false;
            }
        }
    }

    private addChosenColorPreview(colorType: ColorType) {
        const colorNode = new Node(`ChosenColor_${this._chosenColors.length}`);
        colorNode.setScale(0.8, 0.8, 1);

        const sprite = colorNode.addComponent(Sprite);
        setSprite('body', sprite);
        sprite.color = getColor(colorType);

        this.chosenColorContainer.addChild(colorNode);
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
}
