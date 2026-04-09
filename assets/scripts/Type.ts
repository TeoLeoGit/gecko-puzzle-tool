export enum GeckoType {
  Normal = 0,
  Stacked = 1,
  Hidden = 2,
  Connected = 3,
}

export enum CarryItemType {
  Lock = 1,
  Key = 2,
  Scissors = 3,
}

export enum GroundType {
  normal = 0,
  block = 1,
  Color_Path = 2,
  Stone_Wall = 3,
  Colored_Stone = 4,
  Rope = 5,
  Moveable_Box = 6,
  Sliding_Gate = 7,
}

export enum HoleType {
  normal = 0,
  Multi_Hole = 1,
}

export enum MoveableBoxDirection {
  Horizontal = 0,
  Vertical = 1,
  Both = 2,
}

export enum ColorType {
  Red = 0,
  Green = 1,
  Yellow = 2,
  Blue = 3,
  Cyan = 4,
  Purple = 5,
  Orange = 6,
  Pink = 7,
  Brown = 8,
  Black = 9,
  
  DarkRed = 10,
  DarkGreen = 11,
  MossGreen = 12,
  LightRed = 13,
  LightOrange = 14,
  LightPink = 15,
  LightBrown = 16,
  DarkBlue = 17,

  Hidden = 20,
  Masked = 21,
  Sick = 22,
}

export enum CoverType {
  None = 0,
  Crate = 1,
  Ice = 2,
}

export enum DifficultyType {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

export enum DesignMode {
  CreateGecko = 0,
  CreateWall = 1,
  DeleteGecko = 2,
  DeleteWall = 3,
  CreateHole = 4,
  DeleteHole = 5,
  CreateGround = 6,
  DeleteGround = 7,
  None = 100,
}

export enum ItemLockType
{
    Gold = 1,
    Silver = 2
}
