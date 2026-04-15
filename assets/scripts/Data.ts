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

    public static mergeLevel(levelNumb: number, level: LevelData) {
        const idx = this._levels.findIndex(dataLevel => dataLevel.level === levelNumb);
        if (!this._levels) {
            this._levels = [];
        }
        if (idx >= 0) {
            this._levels[idx] = level;
        } else {
            this._levels.push(level);
        }
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
        a.download = "levels.json";
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
        return this._levels.find(levelData => levelData.level === level);
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
        if (fLevel === sLevel) {
            return;
        }

        const firstIndex = this._levels.findIndex((levelData) => levelData.level === fLevel);
        const secondIndex = this._levels.findIndex((levelData) => levelData.level === sLevel);

        if (firstIndex === -1 || secondIndex === -1) {
            throw new Error(`One or both levels ${fLevel}, ${sLevel} not found in data`);
        }

        const prevFirstLevel = this._levels[firstIndex].level;
        log(this._levels[firstIndex].level);
        this._levels[firstIndex].level = this._levels[secondIndex].level;
        this._levels[secondIndex].level = prevFirstLevel;
        log(this._levels[firstIndex].level);

        this._levels.sort((a, b) => a.level - b.level);
        log('ok!');
    }

    public static nextLevelId(): number {
        return this._levels.length + 1;
    }
}
