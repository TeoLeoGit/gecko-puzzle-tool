import { _decorator, Event as CocosEvent, Component, Label, Node } from 'cc';
import { CoverData, InputSpecialHolePopup } from '../Config';
import { Event } from '../Constant';
import EventManager from '../EventManager';
import { CoverType, HoleType } from '../Type';
import { CoverHandler } from '../CoverHandler';
const { ccclass, property } = _decorator;

@ccclass('PopupSpecialHole')
export class PopupSpecialHole extends Component {
    @property(Node)
    dataPreview: Node = null!;

    private _input: InputSpecialHolePopup;

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
        this.node.active = true;
        this._input = input;
        this.updateViewProperties();
    }

    onClickClose() {
        this.node.active = false;
    }

    onChooseSpecialHole(_event: CocosEvent, customEventData?: string) {
        const parsed = Number(customEventData);
        if (isNaN(parsed)) {
            return;
        }

        const holeType = parsed as HoleType;

        if (holeType === HoleType.Multi_Hole) {
            return;
        }
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

        let coverData = this._input.holeData.covers;
        if (!coverData || coverData.type !== coverType) {
            coverData = {
                type: coverType,
                properties: {},
            };
            this._input.holeData.covers = coverData;
        }

        coverData.properties ??= {};
        if (coverType === CoverType.Ice && coverData.properties.count == null) {
            coverData.properties.count = 1;
        }

        this._input.dataCover = coverData;
        CoverHandler.addCoverHole(this._input);
        EventManager.instance.emit(Event.SHOW_ADD_PROPERTIES_POPUP, this._input);
    }

    updateViewProperties() {
        if (!this.dataPreview) {
            return;
        }

        this.dataPreview.removeAllChildren();

        const holeProperties = this._input?.holeData?.properties ?? {};
        for (const propertyName of Object.keys(holeProperties)) {
            const previewNode = new Node(`Preview_${propertyName}`);
            const label = previewNode.addComponent(Label);
            label.string = JSON.stringify({
                [propertyName]: holeProperties[propertyName],
            });
            this.dataPreview.addChild(previewNode);
        }

        const coverData = this._input?.holeData?.covers;
        if (!coverData || coverData.type == null) {
            return;
        }

        const previewNode = new Node('Preview_Cover');
        const label = previewNode.addComponent(Label);
        label.string = JSON.stringify({
            type: coverData.type,
            properties: coverData.properties ?? {},
        });
        this.dataPreview.addChild(previewNode);
    }
}


