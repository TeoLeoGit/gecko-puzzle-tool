import { _decorator, Event as CocosEvent, Component, Label, Node } from 'cc';
import { CoverData, InputSpecialGeckoPopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { SpecialGeckoHandler } from '../SpecialGeckoHandler';
import { GeckoItemHandler } from '../GeckoItemHandler';
import { CoverHandler } from '../CoverHandler';
import { CarryItemType, CoverType, GeckoType } from '../Type';
const { ccclass, property } = _decorator;

@ccclass('PopupSpecialGecko')
export class PopupSpecialGecko extends Component {
    @property(Node)
    dataPreview: Node = null!;

    private _input: InputSpecialGeckoPopup;
    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_SPECIAL_GECKO_POPUP, this.onShow, this);
        EventManager.instance.on(Event.UPDATE_VIEW_PROPERTIES, this.updateViewProperties, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_SPECIAL_GECKO_POPUP, this.onShow);
        EventManager.instance.off(Event.UPDATE_VIEW_PROPERTIES, this.updateViewProperties);
    }

    onShow(input: InputSpecialGeckoPopup) {
        this.node.active = true;
        this._input = input;
        this.updateViewProperties();
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
        if (geckoType === GeckoType.Stacked) {
            EventManager.instance.emit(Event.SHOW_POPUP_STACK_GECKO, this._input);
            return;
        }

        if (geckoType === GeckoType.Hidden) {
            this._input.geckoData.type = GeckoType.Hidden;
            this._input.dataSpecialGecko ??= {};
            this._input.dataCarryItem = undefined;
            this._input.dataCover = undefined;
            this._input.dataSpecialGecko.unlockNumber = 1;
            if (!this._input.geckoData.properties) {
                this._input.geckoData.properties = {};
            }
            this._input.geckoData.properties.specialGecko = this._input.dataSpecialGecko;
            SpecialGeckoHandler.addSpecialGecko(this._input);
            EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
            return;
        }
    }

    onChooseGeckoWithItem(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const carryItemType = parsed as CarryItemType;
        this._input.dataSpecialGecko = undefined;
        this._input.dataCover = undefined;
        this._input.dataCarryItem = {
            type: carryItemType,
        };

        switch (carryItemType) {
            case CarryItemType.Lock:
                this._input.dataCarryItem.keyConsumeAmount = 1;
                break;
                case CarryItemType.Key:
                this._input.dataCarryItem.idUnlockGecko = 1;
                break;
            case CarryItemType.Scissors:
                this._input.dataCarryItem.targetGroundId = 1;
                break;
            default:
                return;
        }

        if (!this._input.geckoData.properties) {
            this._input.geckoData.properties = {};
        }
        this._input.geckoData.properties.carryItem = this._input.dataCarryItem;
        GeckoItemHandler.addGeckoItem(this._input);
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
    }

    onChooseGeckoCover(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const coverType = parsed as CoverType;
        if (coverType !== CoverType.Crate && coverType !== CoverType.Ice) {
            return;
        }

        if (!this._input.geckoData.Cover) {
            this._input.geckoData.Cover = [];
        }

        let coverData = this._input.geckoData.Cover.find((cover) => cover.type === coverType);
        if (!coverData) {
            coverData = {
                type: coverType,
                properties: {},
            };

            if (coverType === CoverType.Ice) {
                coverData.properties.count = 1;
            }

            this._input.geckoData.Cover.push(coverData);
        }

        this._input.dataCover = coverData;
        CoverHandler.addCover(this._input);
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
    }

    updateViewProperties() {
        if (!this.dataPreview) {
            return;
        }

        this.dataPreview.removeAllChildren();

        const dataSpecialGecko = this._input?.geckoData?.properties?.specialGecko ?? {};
        for (const propertyName of Object.keys(dataSpecialGecko)) {
            const previewNode = new Node(`Preview_${propertyName}`);
            const label = previewNode.addComponent(Label);
            label.string = JSON.stringify({
                [propertyName]: dataSpecialGecko[propertyName],
            });
            this.dataPreview.addChild(previewNode);
        }

        const dataCarryItem = this._input?.geckoData?.properties?.carryItem ?? {};
        for (const propertyName of Object.keys(dataCarryItem)) {
            const previewNode = new Node(`Preview_${propertyName}`);
            const label = previewNode.addComponent(Label);
            label.string = JSON.stringify({
                [propertyName]: dataCarryItem[propertyName],
            });
            this.dataPreview.addChild(previewNode);
        }

        const coverDataList = this._input?.geckoData?.Cover ?? [];
        for (let coverIndex = 0; coverIndex < coverDataList.length; coverIndex++) {
            const coverData = coverDataList[coverIndex];
            if (!coverData || coverData.type == null) {
                continue;
            }

            const previewNode = new Node(`Preview_Cover_${coverIndex}`);
            const label = previewNode.addComponent(Label);
            label.string = JSON.stringify({
                type: coverData.type,
                properties: coverData.properties ?? {},
            });
            this.dataPreview.addChild(previewNode);
        }
    }
}
