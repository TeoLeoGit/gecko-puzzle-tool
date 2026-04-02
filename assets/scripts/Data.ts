import { JsonAsset, log, resources } from "cc";
import { LevelData } from "./Config";

/** Root shape of levels.json */
export type LevelsJsonRoot = {
    levels: LevelData[];
};

export class Data {
    private static _levels: LevelData[] = [];

    public static get Levels(): LevelData[] {
        return this._levels;
    }

    public static mergeLevel(levelKey: string | number, level: LevelData) {
        const idx = Number(levelKey);
        if (isNaN(idx) || idx < 0) {
            return;
        }
        if (!this._levels) {
            this._levels = [];
        }
        this._levels[idx] = level;
    }

    public static saveLevels() {
        const levels = (this._levels ?? []).map((entry) => {
            const copy = { ...entry } as LevelData & { rowNum?: number; colNum?: number };
            if (copy.rowNum !== undefined) delete copy.rowNum;
            if (copy.colNum !== undefined) delete copy.colNum;
            return copy as LevelData;
        });

        const saveData: LevelsJsonRoot = { levels };
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(saveData)], { type: "application/json" }));
        a.download = "level.json";
        document.body.appendChild(a);
        a.click();
    }

    public static loadLevels(onSuccess?: () => void) {
        resources.load("data/level", JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.error("❌ Failed to load JSON:", err);
                return;
            }

            const data = jsonAsset.json as LevelsJsonRoot;
            this._levels = Array.isArray(data?.levels) ? [...data.levels] : [];
            onSuccess?.();
        });
    }

    public static getLevel(level: number): LevelData {
        if (this._levels == null || level < 0 || level >= this._levels.length) {
            return null;
        }
        return this._levels[level] ?? null;
    }

    public static addNewLevel(level: LevelData): number {
        if (!this._levels) {
            this._levels = [];
        }
        this._levels.push(level);
        return this._levels.length - 1;
    }

    public static swapLevel(fLevel: number, sLevel: number) {
        if (!this._levels) {
            throw new Error("Levels not loaded");
        }
        if (
            fLevel < 0 ||
            sLevel < 0 ||
            fLevel >= this._levels.length ||
            sLevel >= this._levels.length
        ) {
            throw new Error(`One or both levels ${fLevel}, ${sLevel} not found in data`);
        }

        const temp = this._levels[fLevel];
        this._levels[fLevel] = this._levels[sLevel];
        this._levels[sLevel] = temp;
    }
}
