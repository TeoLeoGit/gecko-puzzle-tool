
import { Node } from "cc";
import { CarryItemType, ColorType, DifficultyType, GeckoType } from "./Type";

export class Config {
  public static MAX_ROW = 16;
  public static MAX_COLUMN = 16;
}

export interface GeckoPart {
  [key: string]: unknown;
}

export interface CoverData {
  [key: string]: unknown;
}

export interface CarryItemData {
  type: CarryItemType;
  geckoId: number;
  idUnlockGecko: number;
  targetGroundId: number;
  keyConsumeAmount: number;
}

export interface SpecialGeckoData {
  // stack gecko
  stackColors: ColorType[];
  // hidden gecko
  hiddenColor: ColorType;
  unlockNumber: number;
  // connected gecko: array of gecko IDs in the connection chain
  connectedGeckoIds: number[];
}

export interface GeckoProperties {
  carryItem?: CarryItemData;
  specialGecko?: SpecialGeckoData;
}

export interface GeckoDataJson {
  id: number;
  type: GeckoType;
  color: ColorType;
  properties?: GeckoProperties;
  parts?: GeckoPart[];
  Cover?: CoverData[];
  layers?: CoverData[];
}

export interface GeckoData {
  id: number;
  type: GeckoType;
  color: ColorType;
  colorType: ColorType;
  properties?: GeckoProperties;
  parts?: GeckoPart[];
  covers: CoverData[];
}

export interface LevelData {
  level: number;
  time: number;
  difficulty: string;
  width: number;
  height: number;
  cells: string[];
  grounds: [];
  holes: [];
  geckos: GeckoData[];
  Cover: [];
}

export function normalizeGeckoData(input: GeckoDataJson): GeckoData {
  // Precedence:
  // - if `Cover` is present use it
  // - else if legacy `layers` is present use it
  // - else default to empty list
  const covers = Array.isArray(input.Cover)
    ? input.Cover
    : Array.isArray(input.layers)
      ? input.layers
      : [];

  return {
    id: input.id,
    type: input.type,
    color: input.color,
    colorType: input.color,
    properties: input.properties,
    parts: input.parts,
    covers,
  };
}

export type InputDeleteGridObject = {
  x: number,
  y: number,
  icon: string,
  rootObj: Node
}
