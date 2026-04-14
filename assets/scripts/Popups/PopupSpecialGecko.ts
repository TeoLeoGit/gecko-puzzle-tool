import { _decorator, Button, Event as CocosEvent, Component, Label, log, Node } from 'cc';
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

    @property(Node)
    btnContainer: Node = null!;

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
        GeckoItemHandler.addGeckoItem(this._input);
        this.node.active = false;
    }

    onChooseSpecialGecko(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const geckoType = parsed as GeckoType;
        if (this.isRemovedActiveByHandler('onChooseSpecialGecko', geckoType)) {
            this.removeSpecialGecko(geckoType);
            return;
        }

        this.ensureGeckoProperties();
        this.addSpecialType(geckoType);

        if (geckoType === GeckoType.Stacked) {
            this._input.dataSpecialGecko ??= {};
            this._input.geckoData.properties.specialGecko = this._input.dataSpecialGecko;
            EventManager.instance.emit(Event.SHOW_POPUP_STACK_GECKO, this._input);
            return;
        }

        if (geckoType === GeckoType.Hidden) {
            this._input.dataSpecialGecko ??= {};
            this._input.dataCarryItem = undefined;
            this._input.dataCover = undefined;
            this._input.dataSpecialGecko.unlockNumber = 1;
            this._input.geckoData.properties.specialGecko = this._input.dataSpecialGecko;
            SpecialGeckoHandler.addSpecialGecko(this._input);
            EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
            return;
        }

        if (geckoType === GeckoType.StraightGecko) {
            this._input.dataSpecialGecko ??= {};
            this._input.geckoData.properties.specialGecko = this._input.dataSpecialGecko;
            SpecialGeckoHandler.addSpecialGecko(this._input);
            this.updateViewProperties();
            return;
        }
    }

    onChooseGeckoWithItem(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const carryItemType = parsed as CarryItemType;
        if (this.isRemovedActiveByHandler('onChooseGeckoWithItem', carryItemType)) {
            this.removeCarryItem();
            return;
        }

        this._input.dataSpecialGecko = undefined;
        this._input.dataCover = undefined;
        this._input.dataCarryItem = {
            type: carryItemType,
        };

        switch (carryItemType) {
            case CarryItemType.Lock:
                this._input.dataCarryItem.colorLockType = 1;
                break;
            case CarryItemType.Key:
                this._input.dataCarryItem.colorLockType = 1;
                break;
            case CarryItemType.Scissors:
                this._input.dataCarryItem.targetGroundId = 1;
                break;
            case CarryItemType.TimeBonus:
                break;
            default:
                return;
        }

        if (!this._input.geckoData.properties) {
            this._input.geckoData.properties = {};
        }
        this._input.geckoData.properties.carryItem = this._input.dataCarryItem;
        //GeckoItemHandler.addGeckoItem(this._input);
        if (carryItemType !== CarryItemType.TimeBonus)
            EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
        else 
            this.updateViewProperties();
    }

    onChooseGeckoCover(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const coverType = parsed as CoverType;
        if (this.isRemovedActiveByHandler('onChooseGeckoCover', coverType)) {
            this.removeCover(coverType);
            return;
        }

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
        CoverHandler.addCoverForGecko(this._input);
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

        this.updateViewSelectedType();
    }

    updateViewSelectedType() {
        for (const buttonNode of this.btnContainer.children) {
            const button = buttonNode.getComponent(Button);

            const removedNode = buttonNode.getChildByName('Remove');
            if (!button || !removedNode || button.clickEvents.length === 0) {
                continue;
            }

            const clickEvent = button.clickEvents[0];
            const handler = clickEvent.handler;
            const eventData = Number(clickEvent.customEventData);
            let isSelected = false;

            if (handler === 'onChooseSpecialGecko') {
                isSelected = this.getAllSpecialTypes()
                                 .findIndex(type => type === eventData) !== -1;
            }

            if (handler === 'onChooseGeckoWithItem') {
                isSelected = this._input?.geckoData?.properties?.carryItem?.type === eventData;
            }

            if (handler === 'onChooseGeckoCover') {
                isSelected = (this._input?.geckoData?.Cover ?? []).some((cover) => cover.type === eventData);
            }

            removedNode.active = isSelected;
        }
    }

    private isRemovedActiveByHandler(handlerName: string, typeValue: number): boolean {
        for (const buttonNode of this.btnContainer.children) {
            const button = buttonNode.getComponent(Button);
            const removedNode = buttonNode.getChildByName('Remove');
            if (!button || !removedNode || button.clickEvents.length === 0) {
                continue;
            }

            const clickEvent = button.clickEvents[0];
            if (clickEvent.handler !== handlerName) {
                continue;
            }

            if (Number(clickEvent.customEventData) !== typeValue) {
                continue;
            }

            return removedNode.active;
        }

        return false;
    }

    private removeSpecialGecko(geckoType: GeckoType) {
        const nextTypes = this.getAllSpecialTypes().filter((type) => type !== geckoType);
        const geckoProperties = this._input.geckoData.properties;
        const specialGecko = geckoProperties?.specialGecko;

        this.removeSpecialTypeProperties(geckoType);

        if (nextTypes.length === 0) {
            this._input.geckoData.type = GeckoType.Normal;
            this._input.specialType = GeckoType.Normal;
            this._input.dataSpecialGecko = undefined;

            if (geckoProperties) {
                delete geckoProperties.specialGecko;
                delete geckoProperties.extraGeckoTypes;
            }

            SpecialGeckoHandler.removeSpecialGecko(this._input);
            this.updateViewProperties();
            return;
        }

        this._input.geckoData.type = nextTypes[0];
        this._input.specialType = nextTypes[0];

        if (geckoProperties) {
            if (nextTypes.length > 1) {
                geckoProperties.extraGeckoTypes = [...nextTypes.slice(1)];
            } else {
                delete geckoProperties.extraGeckoTypes;
            }

            if (specialGecko && Object.keys(specialGecko).length === 0) {
                delete geckoProperties.specialGecko;
                this._input.dataSpecialGecko = undefined;
            } else {
                this._input.dataSpecialGecko = geckoProperties.specialGecko;
            }
        }

        SpecialGeckoHandler.addSpecialGecko(this._input);
        this.updateViewProperties();
    }

    private removeSpecialTypeProperties(geckoType: GeckoType) {
        const specialGecko = this._input.geckoData.properties?.specialGecko;
        if (!specialGecko) {
            return;
        }

        if (geckoType === GeckoType.Stacked) {
            delete specialGecko.stackColors;
        }

        if (geckoType === GeckoType.Hidden) {
            delete specialGecko.unlockNumber;
        }

        if (geckoType === GeckoType.Connected) {
            delete specialGecko.connectedGeckoIds;
        }

        if (Object.keys(specialGecko).length === 0) {
            delete this._input.geckoData.properties?.specialGecko;
            this._input.dataSpecialGecko = undefined;
            return;
        }

        this._input.dataSpecialGecko = specialGecko;
    }

    private removeCarryItem() {
        this._input.dataCarryItem = undefined;

        if (this._input.geckoData.properties) {
            delete this._input.geckoData.properties.carryItem;
        }

        GeckoItemHandler.removeGeckoItem(this._input);
        this.updateViewProperties();
    }

    private removeCover(coverType: CoverType) {
        this._input.geckoData.Cover = (this._input.geckoData.Cover ?? []).filter((cover) => cover.type !== coverType);
        this._input.dataCover = undefined;

        CoverHandler.removeCoverForGecko(this._input, coverType);
        this.updateViewProperties();
    }

    private ensureGeckoProperties() {
        this._input.geckoData.properties ??= {};
    }

    private getAllSpecialTypes(): GeckoType[] {
        const types: GeckoType[] = [];
        const primaryType = this._input?.geckoData?.type;
        if (primaryType != null && primaryType !== GeckoType.Normal) {
            types.push(primaryType);
        }

        const extraTypes = this._input?.geckoData?.properties?.extraGeckoTypes ?? [];
        for (const extraType of extraTypes) {
            if (extraType !== GeckoType.Normal && !(types
                .findIndex(type => type === extraType) !== -1)) {
                types.push(extraType);
            }
        }

        return types;
    }

    private addSpecialType(geckoType: GeckoType) {
        if (geckoType === GeckoType.Normal) {
            return;
        }

        const currentType = this._input.geckoData.type;
        if (currentType === GeckoType.Normal) {
            this._input.geckoData.type = geckoType;
            this._input.specialType = geckoType;
            return;
        }

        if (currentType === geckoType) {
            this._input.specialType = geckoType;
            return;
        }

        const extraTypes = this._input.geckoData.properties?.extraGeckoTypes ?? [];
        if (!(extraTypes.findIndex(type => type === geckoType) !== -1)) {
            extraTypes.push(geckoType);
        }
        this._input.geckoData.properties!.extraGeckoTypes = extraTypes;
        this._input.specialType = geckoType;
    }
}
