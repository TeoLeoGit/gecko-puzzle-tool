
import { Node } from "cc";
import { CarryItemType, ColorType, CoverType, GeckoType, GroundType, HoleType, ItemLockType } from "./Type";
import { GeckoBody } from "./GeckoBody";
import { Hole } from "./Hole";

export class Config {
  public static MAX_ROW = 16;
  public static MAX_COLUMN = 16;
}

export interface GeckoPart {
  r: number,
  c: number,
}

export interface CoverData {
  type: CoverType;
  properties: CoverProperties;
}

export type CarryItemData = {
  type: CarryItemType;
  geckoId?: number;
  colorLockType?: ItemLockType;
  targetGroundId?: number;
}

export type SpecialGeckoData = {
  // stack gecko
  stackColors?: ColorType[];
  // hidden gecko
  unlockNumber?: number;
  // connected gecko: array of gecko IDs in the connection chain
  connectedGeckoIds?: number[];
}

export type GeckoProperties = {
  carryItem?: CarryItemData;
  specialGecko?: SpecialGeckoData;
}

export type GeckoData = {
  id: number;
  type: GeckoType;
  color: ColorType;
  properties?: GeckoProperties;
  parts?: GeckoPart[];
  Cover?: CoverData[];
  //layers?: CoverData[];
}

export type HoleData = {
  id: number;
  type: HoleType;
  color: ColorType;
  r: number;
  c: number;
  properties: HoleProperties;
  covers?: CoverData;
}

export type HoleProperties = {

}

export type CoverProperties = {
  count?: number; //ice cover
}

export type GroundData = {
  id: number;
  r: number;
  c: number;
  type: GroundType;
  properties?: GroundProperties;
}

export type GroundProperties = {
  count?: number; //Stone_wall
  color?: ColorType; //Color_path
}

export type LevelData = {
  level: number;
  time: number;
  difficulty: string;
  width: number;
  height: number;
  cells: string[];
  grounds: GroundData[];
  holes: HoleData[];
  geckos: GeckoData[];
  Cover: [];
}

export type InputDeleteGridObject = {
  x: number,
  y: number,
  icon: string,
  rootObj: Node
}

export type InputSpecialGeckoPopup = {
  geckoData: GeckoData;
  geckoParts: GeckoBody[];
  specialType: GeckoType;
  dataSpecialGecko?: SpecialGeckoData;
  dataCarryItem?: CarryItemData;
  dataCover?: CoverData;
}

export type InputSpecialHolePopup = {
  holeData: HoleData;
  holeComp: Hole;
  specialType: HoleType;
  dataCover?: CoverData;
}

export type InputGroundPopup = {
  groundData: GroundData;
}
