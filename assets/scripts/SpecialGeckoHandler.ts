import { Node, Sprite } from 'cc';
import { InputSpecialGeckoPopup } from './Config';
import { ColorType, GeckoType } from './Type';
import { getColor, setSprite } from './Utils';

export class SpecialGeckoHandler {
    public static addSpecialGecko(input: InputSpecialGeckoPopup) {
        this.removeSpecialGecko(input);

        const geckoTypes = this.getAllSpecialTypes(input);

        if (geckoTypes.findIndex(type => type === GeckoType.Stacked) !== -1) {
            const stackColors = input.dataSpecialGecko?.stackColors ?? [];
            for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
                const geckoBody = input.geckoParts[bodyIndex];
                const rootNode = geckoBody.node;

                for (let i = 0; i < stackColors.length; i++) {
                    const stackNode = new Node(`StackedBody_${i}`);
                    stackNode.setScale(
                        rootNode.scale.x * (i === 1 ? 0.3 : 0.5),
                        rootNode.scale.y * (i === 1 ? 0.3 : 0.5),
                        rootNode.scale.z,
                    );

                    const sprite = stackNode.addComponent(Sprite);
                    setSprite('body', sprite);
                    sprite.color = getColor(stackColors[i]);

                    rootNode.addChild(stackNode);
                }
            }
        }

        if (geckoTypes.findIndex(type => type === GeckoType.Hidden) !== -1) {
            for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
                input.geckoParts[bodyIndex].setColor(ColorType.Hidden);
            }
        }
    }

    public static removeSpecialGecko(input: InputSpecialGeckoPopup) {
        for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
            const geckoBody = input.geckoParts[bodyIndex];
            for (const child of [...geckoBody.node.children]) {
                if (child.name.startsWith('StackedBody_')) {
                    child.destroy();
                }
            }
            geckoBody.setColor(input.geckoData.color);
        }
    }

    private static getAllSpecialTypes(input: InputSpecialGeckoPopup): GeckoType[] {
        const types: GeckoType[] = [];
        if (input.geckoData.type !== GeckoType.Normal) {
            types.push(input.geckoData.type);
        }

        const extraTypes = input.geckoData.properties?.extraGeckoTypes ?? [];
        for (const extraType of extraTypes) {
            if (extraType !== GeckoType.Normal && !(types.findIndex(type => type === extraType) !== -1)) {
                types.push(extraType);
            }
        }

        return types;
    }
}
