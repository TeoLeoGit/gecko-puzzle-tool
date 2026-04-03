import { _decorator, Component, Node, log } from 'cc';
import { SpecialGeckoData } from './Config';
import { GeckoType } from './Type';
import { GeckoBody } from './GeckoBody';

export class SpecialGeckoHandler {
    public static addSpecialGecko(idGecko: number, geckoParts: GeckoBody[], specialType: GeckoType, data: SpecialGeckoData) {
        //Stacked gecko
        if (specialType === GeckoType.Stacked) {
            log('stacked gecko');
            
        }
    }
}