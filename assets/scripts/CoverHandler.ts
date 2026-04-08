import { Node, Sprite, UIOpacity, UITransform, Vec3 } from 'cc';
import { InputSpecialGeckoPopup, InputSpecialHolePopup } from './Config';
import { CoverType } from './Type';
import { setSprite } from './Utils';

export class CoverHandler {
    public static addCoverForGecko(input: InputSpecialGeckoPopup) {
        const covers = input.geckoData.Cover ?? [];
        if (covers.length === 0 || !input.geckoParts?.length) {
            return;
        }

        for (const geckoPart of input.geckoParts) {
            const rootNode = geckoPart.node;
            for (const child of [...rootNode.children]) {
                if (child.name.startsWith('Cover_')) {
                    child.destroy();
                }
            }
        }

        for (let coverIndex = 0; coverIndex < covers.length; coverIndex++) {
            const coverData = covers[coverIndex];
            if (coverData.type === CoverType.Crate) {
                for (const geckoPart of input.geckoParts) {
                    const rootNode = geckoPart.node;
                    this.addCoverNode(rootNode, coverIndex, coverData.type);
                }
                continue;
            }

            if (coverData.type === CoverType.Ice) {
                for (let bodyIndex = 1; bodyIndex < input.geckoParts.length; bodyIndex++) {
                    const rootNode = input.geckoParts[bodyIndex].node;
                    this.addCoverNode(rootNode, coverIndex, coverData.type);
                }
                continue;
            }
        }
    }

    public static addCoverHole(input: InputSpecialHolePopup) {
        const coverData = input.holeData.covers;
        const rootNode = input.holeComp?.node;
        if (!coverData || !rootNode) {
            return;
        }

        for (const child of [...rootNode.children]) {
            if (child.name.startsWith('Cover_')) {
                child.destroy();
            }
        }

        if (coverData.type === CoverType.Crate) {
            this.addCoverNode(rootNode, 0, coverData.type);
            return;
        }

        if (coverData.type === CoverType.Ice) {
            this.addCoverNode(rootNode, 0, coverData.type);
            return;
        }
    }

    public static removeCoverForGecko(input: InputSpecialGeckoPopup, coverType?: CoverType) {
        for (const geckoPart of input.geckoParts) {
            const rootNode = geckoPart.node;
            for (const child of [...rootNode.children]) {
                if (!child.name.startsWith('Cover_')) {
                    continue;
                }

                if (coverType == null || child.name.startsWith(`Cover_${coverType}_`)) {
                    child.destroy();
                }
            }
        }
    }

    public static removeCoverHole(input: InputSpecialHolePopup) {
        const rootNode = input.holeComp?.node;
        if (!rootNode) {
            return;
        }

        for (const child of [...rootNode.children]) {
            if (child.name.startsWith('Cover_')) {
                child.destroy();
            }
        }
    }

    private static addCoverNode(rootNode: Node, coverIndex: number, coverType: CoverType) {
        const coverNode = new Node(`Cover_${coverType}_${coverIndex}`);
        coverNode.setPosition(0, 0, 0);
        coverNode.setScale(1, 1, 1);

        if (coverType === CoverType.Ice) {
            coverNode.setScale(new Vec3(0.6, 0.6));

            const opacity = coverNode.addComponent(UIOpacity);
            opacity.opacity = Math.round(255 * 0.6);

            const sprite = coverNode.addComponent(Sprite);
            setSprite('cover_ice', sprite);
        }

        rootNode.addChild(coverNode);
    }
}
