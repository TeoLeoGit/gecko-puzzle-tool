import { Node, Sprite } from 'cc';
import { InputSpecialGeckoPopup } from './Config';
import { ColorType, GeckoType } from './Type';
import { getColor, setSprite } from './Utils';

export class SpecialGeckoHandler {
    public static addSpecialGecko(input: InputSpecialGeckoPopup) {
        //Stacked gecko
        if (input.geckoData.type === GeckoType.Stacked) {
            const stackColors = input.dataSpecialGecko.stackColors ?? [];
            for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
                const geckoBody = input.geckoParts[bodyIndex];
                const rootNode = geckoBody.node;

                for (const child of [...rootNode.children]) {
                    if (child.name.startsWith('StackedBody_')) {
                        child.destroy();
                    }
                }

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

        if (input.geckoData.type === GeckoType.Hidden) {
            for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
                input.geckoParts[bodyIndex].setColor(ColorType.Hidden);
            }
        }
    }
}
