import { Node, Sprite } from 'cc';
import { InputSpecialGeckoPopup } from './Config';
import { CarryItemType } from './Type';
import { setSprite } from './Utils';

export class GeckoItemHandler {
    public static addGeckoItem(input: InputSpecialGeckoPopup) {
        const carryItem = input.dataCarryItem;
        const rootNode = input.geckoParts?.[1]?.node;
        if (!carryItem || !rootNode) {
            return;
        }

        for (const child of [...rootNode.children]) {
            if (child.name.startsWith('CarryItem_')) {
                child.destroy();
            }
        }

        if (carryItem.type === CarryItemType.Key) {
            this.addItemSprite(rootNode, 'item_key', carryItem.type);
            return;
        }

        if (carryItem.type === CarryItemType.Lock) {
            this.addItemSprite(rootNode, 'item_lock', carryItem.type);
            return;
        }
    }

    private static addItemSprite(rootNode: Node, spriteName: string, carryItemType: CarryItemType) {
        const itemNode = new Node(`CarryItem_${carryItemType}`);
        itemNode.setPosition(0, 0, 0);
        itemNode.setScale(1, 1, 1);

        const sprite = itemNode.addComponent(Sprite);
        setSprite(spriteName, sprite);

        rootNode.addChild(itemNode);
    }
}
