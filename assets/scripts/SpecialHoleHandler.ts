import { Node } from 'cc';

export class SpecialHoleHandler {
    public static removeSpecialHole(rootNode: Node) {
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

