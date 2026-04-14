import { _decorator, Button, Component, Event as CocosEvent, Label, Node } from 'cc';
import { ButtonChangeColor } from '../ButtonChangeColor';
import { InputSpecialHolePopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { CoverType, ColorType, HoleType } from '../Type';
import { CoverHandler } from '../CoverHandler';
import { SpecialHoleHandler } from '../SpecialHoleHandler';
const { ccclass, property } = _decorator;

@ccclass('PopupSpecialHole')
export class PopupSpecialHole extends Component {
    @property(Node)
    dataPreview: Node = null!;

    @property(Node)
    btnContainer: Node = null!;

    private _inputData: InputSpecialHolePopup | null = null;

    protected onLoad(): void {
        EventManager.instance.on(Event.SHOW_SPECIAL_HOLE_POPUP, this.onShow, this);
        EventManager.instance.on(Event.UPDATE_VIEW_PROPERTIES, this.updateViewProperties, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        EventManager.instance.off(Event.SHOW_SPECIAL_HOLE_POPUP, this.onShow);
        EventManager.instance.off(Event.UPDATE_VIEW_PROPERTIES, this.updateViewProperties);
    }

    onShow(input: InputSpecialHolePopup) {
        this._inputData = input;
        this._inputData.dataSpecialHole ??= {};
        this.node.active = true;

        const holeColor = input?.holeData?.color;
        if (holeColor == null) {
            return;
        }

        this.updateViewSelectedType();
    }

    onClickClose() {
        if (this._inputData?.holeData) {
            this.ensureHoleProperties();
            this._inputData.dataSpecialHole ??= {};
            const savedColors  = (this._inputData.dataSpecialHole.colors?.length ?? 0) > 0
                ? this._inputData.dataSpecialHole.colors
                : [];
            if (savedColors.length > 0) {
                this._inputData.dataSpecialHole.colors = [...savedColors];
                this._inputData.holeData.properties.colors = [...savedColors];
            } else {
                delete this._inputData.dataSpecialHole.colors;
                delete this._inputData.holeData.properties.colors;
            }
            SpecialHoleHandler.addSpecialHole(this._inputData);
        }

        EventManager.instance.emit(Event.UPDATE_VIEW_PROPERTIES);
        this.node.active = false;
    }

    onChooseSpecialHole(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const holeType = parsed as HoleType;
        if (holeType !== HoleType.Multi_Hole) {
            return;
        }

        if (this.isRemovedActiveByHandler('onChooseSpecialHole', holeType)) {
            this.removeSpecialHole();
            return;
        }

        this.ensureHoleProperties();
        this._inputData!.holeData.type = holeType;
        this._inputData!.specialType = holeType;

        this._inputData!.dataSpecialHole ??= {};
        this._inputData!.dataSpecialHole.colors = [];
        this._inputData!.holeData.properties.colors = [];

        SpecialHoleHandler.addSpecialHole(this._inputData!);
        EventManager.instance.emit(Event.SHOW_MULTI_HOLE_POPUP, this._inputData!);
        this.updateViewProperties();
    }

    onChooseHoleCover(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const coverType = parsed as CoverType;
        if (coverType !== CoverType.Crate && coverType !== CoverType.Ice) {
            return;
        }

        if (this.isRemovedActiveByHandler('onChooseHoleCover', coverType)) {
            this.removeCover(coverType);
            return;
        }

        let coverData = this._inputData!.holeData.covers;
        if (!coverData || coverData.type !== coverType) {
            coverData = {
                type: coverType,
                properties: {},
            };
            this._inputData!.holeData.covers = coverData;
        }

        coverData.properties ??= {};
        if (coverType === CoverType.Ice && coverData.properties.count == null) {
            coverData.properties.count = 1;
        }

        this._inputData!.dataCover = coverData;
        CoverHandler.addCoverHole(this._inputData!);
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._inputData!);
    }

    updateViewProperties() {
        if (!this.dataPreview) {
            return;
        }

        this.dataPreview.removeAllChildren();

        const holeProperties = this._inputData?.holeData?.properties ?? {};
        for (const propertyName of Object.keys(holeProperties)) {
            const previewNode = new Node(`Preview_${propertyName}`);
            const label = previewNode.addComponent(Label);
            label.string = JSON.stringify({
                [propertyName]: holeProperties[propertyName],
            });
            this.dataPreview.addChild(previewNode);
        }

        const coverData = this._inputData?.holeData?.covers;
        if (coverData && coverData.type != null) {
            const previewNode = new Node('Preview_Cover');
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
            const removedNode = buttonNode.getChildByName('Remove');
            if (checkNode) {
                checkNode.active = false;
            }

            if (handler === 'onChooseSpecialHole') {
                const isSelected = this._inputData?.holeData?.type === eventData;
                if (checkNode) {
                    checkNode.active = isSelected;
                }
                if (removedNode) {
                    removedNode.active = isSelected;
                }
                continue;
            }

            if (handler === 'onChooseHoleCover') {
                const isSelected = this._inputData?.holeData?.covers?.type === eventData;
                if (checkNode) {
                    checkNode.active = isSelected;
                }
                if (removedNode) {
                    removedNode.active = isSelected;
                }
            }
        }
    }

    private isRemovedActiveByHandler(handlerName: string, typeValue: number): boolean {
        if (!this.btnContainer) {
            return false;
        }

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

    private removeSpecialHole() {
        this._inputData!.holeData.type = HoleType.normal;
        this._inputData!.specialType = HoleType.normal;
        this._inputData!.dataSpecialHole = undefined;

        if (this._inputData!.holeData.properties) {
            delete this._inputData!.holeData.properties.colors;
        }

        SpecialHoleHandler.removeSpecialHole(this._inputData!.holeComp?.node);
        this.updateViewProperties();
    }

    private removeCover(coverType: CoverType) {
        this._inputData!.holeData.covers = undefined;
        this._inputData!.dataCover = undefined;

        CoverHandler.removeCoverHole(this._inputData!);
        this.updateViewProperties();
    }

    private ensureHoleProperties() {
        this._inputData!.holeData.properties ??= {};
    }
}
