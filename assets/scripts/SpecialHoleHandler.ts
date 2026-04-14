import { Node, Sprite, UIOpacity } from 'cc';
import { InputSpecialHolePopup } from './Config';
import { HoleType } from './Type';
import { getColor, setSprite } from './Utils';

export class SpecialHoleHandler {
    public static addSpecialHole(input: InputSpecialHolePopup) {
        this.removeSpecialHole(input.holeComp?.node);

        if (!input?.holeComp?.node) {
            return;
        }

        if (input.holeData?.type === HoleType.Multi_Hole) {
            this.addMultiHoleSpecial(input);
            return;
        }

        // Future special hole types can be handled here.
    }

    private static addMultiHoleSpecial(input: InputSpecialHolePopup) {
        const rootNode = input.holeComp.node;
        const renderColors = input.holeData.properties?.colors ?? [];

        for (let i = 0; i < renderColors.length; i++) {
            const specialNode = new Node(`SpecialHole_${i}`);
            specialNode.setPosition(12, 12, 0);
            specialNode.setScale(0.6 - 0.2 * i, 0.6 - 0.2 * i, 1);

            const opacity = specialNode.addComponent(UIOpacity);
            opacity.opacity = Math.round(255 * 0.75);

            const sprite = specialNode.addComponent(Sprite);
            setSprite('Gecko_hole', sprite);
            sprite.color = getColor(renderColors[i]);

            rootNode.addChild(specialNode);
        }
    }

    public static removeSpecialHole(rootNode: Node | null) {
        if (!rootNode) {
            return;
        }

        for (const child of [...rootNode.children]) {
            if (child.name.startsWith('SpecialHole_')) {
                child.destroy();
            }
        }
    }
}


