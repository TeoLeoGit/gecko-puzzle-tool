
import { CarryItemType, ColorType, DifficultyType, GeckoType } from "./Type";

// These types weren't provided in the prompt; keep them permissive for now.
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

// Matches Unity JSON keys:
// - `Cover` is serialized from Unity's `covers`
// - legacy `layers` is accepted and mapped to `covers`
export interface GeckoDataJson {
  id: number;
  type: GeckoType;
  color: ColorType;
  properties?: GeckoProperties;
  parts?: GeckoPart[];
  Cover?: CoverData[];
  layers?: CoverData[]; // legacyLayersAlias setter in Unity
}

// Normalized shape for Cocos-side code (Unity-like field names).
export interface GeckoData {
  id: number;
  type: GeckoType;
  color: ColorType;
  // Unity getter: `public ColorType colorType => color;`
  colorType: ColorType;
  properties?: GeckoProperties;
  parts?: GeckoPart[];
  // Unity field: `public List<CoverData> covers;` (serialized as `Cover`)
  covers: CoverData[];
}

export interface LevelData {
  id: number;
  difficulty: DifficultyType;
  geckos: GeckoData[];
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

