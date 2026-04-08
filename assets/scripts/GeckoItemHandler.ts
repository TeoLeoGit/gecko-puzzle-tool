import { log, Node, Sprite } from 'cc';
import { InputSpecialGeckoPopup } from './Config';
import { CarryItemType, ItemLockType } from './Type';
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
            const spriteName = carryItem.colorLockType === ItemLockType.Silver
                ? 'item_silver_key'
                : 'item_gold_key';
            log(spriteName);
            this.addItemSprite(rootNode, spriteName, carryItem.type);
            return;
        }

        if (carryItem.type === CarryItemType.Lock) {
            const spriteName = carryItem.colorLockType === ItemLockType.Silver
                ? 'item_silver_lock'
                : 'item_gold_lock';
            log(spriteName);
            this.addItemSprite(rootNode, spriteName, carryItem.type);
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

    public static removeGeckoItem(input: InputSpecialGeckoPopup) {
        const rootNode = input.geckoParts?.[1]?.node;
        if (!rootNode) {
            return;
        }

        for (const child of [...rootNode.children]) {
            if (child.name.startsWith('CarryItem_')) {
                child.destroy();
            }
        }
    }
}
