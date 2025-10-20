/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import { maxPlayerLevel } from "../config";

/**
 * The IDs for all the team colors, by name.
 */
export const enum Color {
    Border = 0,
    Barrel = 1,
    Tank = 2,
    TeamBlue = 3,
    TeamRed = 4,
    TeamPurple = 5,
    TeamGreen = 6,
    Shiny = 7,
    EnemySquare = 8,
    EnemyTriangle = 9,
    EnemyPentagon = 10,
    EnemyCrasher = 11,
    Neutral = 12,
    ScoreboardBar = 13,
    Box = 14,
    EnemyTank = 15,
    NecromancerSquare = 16,
    Fallen = 17,
    NecromancerPentagon = 18,
    Radiant = 19,

    kMaxColors = 20
}

/**
 * The hex color codes of each color (by ID), expressed as an int (0x00RRGGBB)
 */
export const ColorsHexCode: Record<Color, number> = {
    [Color.Border]: 0x555555,
    [Color.Barrel]: 0x999999,
    [Color.Tank]: 0x00B2E1,
    [Color.TeamBlue]: 0x00B2E1,
    [Color.TeamRed]: 0xF14E54,
    [Color.TeamPurple]: 0xBF7FF5,
    [Color.TeamGreen]: 0x00E16E,
    [Color.Shiny]: 0x8AFF69,
    [Color.EnemySquare]: 0xFFE869,
    [Color.EnemyTriangle]: 0xFC7677,
    [Color.EnemyPentagon]: 0x768DFC,
    [Color.EnemyCrasher]: 0xF177DD,
    [Color.Neutral]: 0xFFE869,
    [Color.ScoreboardBar]: 0x43FF91,
    [Color.Box]: 0xBBBBBB,
    [Color.EnemyTank]: 0xF14E54,
    [Color.NecromancerSquare]: 0xFCC376,
    [Color.Fallen]: 0xC0C0C0,
    [Color.NecromancerPentagon]: 0x7368FF,
    [Color.Radiant]: 0xFFE869,
    [Color.kMaxColors]: 0x000000
}

/**
 * The IDs for all the tanks, by name.
 */
/*export const enum Tank {
    Basic         = 0,
    Twin          = 1,
    Triplet       = 2,
    TripleShot    = 3,
    QuadTank      = 4,
    OctoTank      = 5,
    Sniper        = 6,
    MachineGun    = 7,
    FlankGuard    = 8,
    TriAngle      = 9,
    Destroyer     = 10,
    Overseer      = 11,
    Overlord      = 12,
    TwinFlank     = 13,
    PentaShot     = 14,
    Assassin      = 15,
    ArenaCloser   = 16,
    Necromancer   = 17,
    TripleTwin    = 18,
    Hunter        = 19,
    Gunner        = 20,
    Stalker       = 21,
    Ranger        = 22,
    Booster       = 23,
    Fighter       = 24,
    Hybrid        = 25,
    Manager       = 26,
    Mothership    = 27,
    Predator      = 28,
    Sprayer       = 29,
    Trapper       = 30,
    GunnerTrapper = 32,
    Overtrapper   = 33,
    MegaTrapper   = 34,
    TriTrapper    = 35,
    Smasher       = 36,
    Landmine      = 37,
    AutoGunner    = 39,
    Auto5         = 40,
    Auto3         = 41,
    SpreadShot    = 42,
    Streamliner   = 43,
    AutoTrapper   = 44,
    DominatorD    = 45,
    DominatorG    = 46,
    DominatorT    = 47,
    Battleship    = 48,
    Annihilator   = 49,
    AutoSmasher   = 50,
    Spike         = 51,
    Factory       = 52,
    Skimmer       = 54,
    Rocketeer     = 55
}*/

export const enum Tank {
    Basic         = 0,
    Twin          = 1,
    Sniper        = 2,
    MachineGun    = 3,
    FlankGuard    = 4,
    Pounder       = 5,
    Commander     = 6,
    Trapper       = 7,
    Smasher       = 8,
    AutoTank      = 9,
    TripleShot    = 10,
    TwinFlank     = 11,
    Gunner        = 12,
    Barricade     = 13,
    Crusier       = 14,
    Assassin      = 15,
    Hunter        = 16,
    Scope         = 17,
    Launcher      = 18,
    Boomer        = 19,
    Spewer        = 20,
    Sprayer       = 21,
    Blaster       = 22,
    Traillazer    = 23,
    QuadTank      = 24,
    TriTrapper    = 25,
    Auto3         = 26,
    TriAngle      = 27,
    TrapGuard     = 28,
    Destroyer     = 29,
    Overseer      = 30,
    Director      = 31,
    Spawner       = 32,
    Sepulcher     = 33,
    MegaTrapper   = 34,
    Engineer      = 35,
    Bomber        = 36,
    AutoBarricade = 37,
    Overtrapper   = 38,
    Triplet       = 39,
    PentaShot     = 40,
    SpreadShot    = 41,
    TripleFlank   = 42,
    CrossFire     = 43,
    TripleTwin    = 44,
    Battleship    = 45,
    AutoGunner    = 46,
    GunnerTrapper = 47,
    Streamliner   = 48,
    Riot          = 49,
    Arsenal       = 50,
    Carrier       = 51,
    Swarmer       = 52,
    Ranger        = 54,
    Stalker       = 55,
    Marksman      = 56,
    Rifle         = 57,
    Predator      = 58,
    XHunter       = 59,
    Blunderbuss   = 60,
    Bunkerer      = 61,
    AutoScope     = 62,
    Skimmer       = 63,
    Rocketeer     = 64,
    Glider        = 65,
    Roundabout    = 66,
    Orbiter       = 67,
    Striker       = 68,
    Fusion        = 69,
    Wave          = 70,
    Vulcan        = 71,
    MegaCannon    = 72,
    Hybrid        = 73,
    Annihilator   = 74,
    Basher        = 75,
    Manufacturer  = 76,
    Cuck          = 77,
    Shotgun       = 78,
    DualBarrel    = 79,
    OctoTank      = 80,
    Auto5         = 81,
    PentTrapper   = 82,
    Shrapnel      = 83,
    Mechanic      = 84,
    Auto4         = 85,
    Joint3        = 86,
    Spectre       = 87,
    Booster       = 88,
    Fighter       = 89,
    Conglomerate  = 90,
    Overlord      = 91,
    Master        = 92,
    Overkill      = 93,
    Manager       = 94,
    Factory       = 95,
    Hatcher       = 96,
    Necromancer   = 97,
    Wizard        = 98,
    Lich          = 99,
    GigaTrapper   = 100,
    Raider        = 101,
    MegaBomber    = 102,
    AutoEngineer  = 103,
    Claymore      = 104,
    MineLayer     = 105,
    MegaSmasher   = 106,
    Landmine      = 107,
    AutoSmasher   = 108,
    Spike         = 109,
    Saw           = 110,
    //Celestials

    //Special tanks
    ArenaCloser   = 1000,
    Mothership    = 1001,
    DominatorD    = 1002,
    DominatorG    = 1003,
    DominatorT    = 1004,
}
/**
 * The IDs for all the stats, by name.
 */
export const enum Stat {
    MovementSpeed = 0,
    Reload = 1,
    BulletDamage = 2,
    BulletPenetration = 3,
    BulletSpeed = 4,
    BodyDamage = 5,
    MaxHealth = 6,
    HealthRegen = 7
}

/**
 * Total Stat Count
 */
export const StatCount = 8;

/**
 * All the indices available on scoreboard - used for type security
 */
export type ValidScoreboardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Packet headers for the [serverbound packets](https://github.com/ABCxFF/diepindepth/blob/main/protocol/serverbound.md).
 */
export const enum ServerBound {
    Init            = 0x0,
    Input           = 0x1,
    Spawn           = 0x2,
    StatUpgrade     = 0x3,
    TankUpgrade     = 0x4,
    Ping            = 0x5,
    TCPInit         = 0x6,
    ExtensionFound  = 0x7,
    ToRespawn       = 0x8,
    TakeTank        = 0x9,
    passiveMode     = 0xC
}
/**
 * Packet headers for the [clientbound packets](https://github.com/ABCxFF/diepindepth/blob/main/protocol/clientbound.md).
 */
export const enum ClientBound {
    Update          = 0x0,
    OutdatedClient  = 0x1,
    Compressed      = 0x2,
    Notification    = 0x3,
    ServerInfo      = 0x4,
    Ping            = 0x5,
    PartyCode       = 0x6,
    Accept          = 0x7,
    Achievement     = 0x8,
    InvalidParty    = 0x9,
    PlayerCount     = 0xA,
    ProofOfWork     = 0xB,
}

/**
 * Flags sent within the [input packet](https://github.com/ABCxFF/diepindepth/blob/main/protocol/serverbound.md#0x01-input-packet).
 */
export const enum InputFlags {
    leftclick   = 1 << 0,
    up          = 1 << 1,
    left        = 1 << 2,
    down        = 1 << 3,
    right       = 1 << 4,
    godmode     = 1 << 5,
    suicide     = 1 << 6,
    rightclick  = 1 << 7,
    levelup     = 1 << 8,
    gamepad     = 1 << 9,
    switchtank  = 1 << 10,
    adblock     = 1 << 11,
}

/**
 * The flag names for the arena field group.
 */
export const enum ArenaFlags {
    noJoining        = 1 << 0,
    showsLeaderArrow = 1 << 1,
    hiddenScores     = 1 << 2,
    gameReadyStart   = 1 << 3,
    canUseCheats     = 1 << 4,
    canFastLevel     = 1 << 5,
}
/**
 * The flag names for the team field group.
 */
export const enum TeamFlags {
    hasMothership = 1 << 0
}
/**
 * The flag names for the camera field group.
 */
export const enum CameraFlags {
    usesCameraCoords      = 1 << 0,
    showingDeathStats     = 1 << 1,
    gameWaitingStart      = 1 << 2
}
/**
 * The flag names for the tsyle field group.
 */
export const enum StyleFlags {
    isVisible          = 1 << 0,
    hasBeenDamaged     = 1 << 1,
    isFlashing         = 1 << 2,
    renderFirst        = 1 << 3,
    isStar             = 1 << 4,
    isCachable         = 1 << 5,
    showsAboveParent   = 1 << 6,
    hasNoDmgIndicator  = 1 << 7
}
/**
 * The flag names for the position field group.
 */
export const enum PositionFlags {
    absoluteRotation    = 1 << 0,
    canMoveThroughWalls = 1 << 1
}
/**
 * The flag names for the physics field group.
 */
export const enum PhysicsFlags {
    isTrapezoid             = 1 << 0,
    showsOnMap              = 1 << 1,
    doChildrenCollision     = 1 << 2,
    noOwnTeamCollision      = 1 << 3,
    isSolidWall             = 1 << 4,
    onlySameOwnerCollision  = 1 << 5,
    isBase                  = 1 << 6,
    _unknown1               = 1 << 7,
    canEscapeArena          = 1 << 8,
    canCollideWithWalls     = 1 << 9
}
/**
 * The flag names for the barrel field group.
 */
export const enum BarrelFlags {
    hasShot = 1 << 0
}
/**
 * The flag names for the health field group.
 */
export const enum HealthFlags {
    hiddenHealthbar = 1 << 0
}
/**
 * The flag names for the name field group.
 */
export const enum NameFlags {
    hiddenName = 1 << 0,
    highlightedName = 1 << 1
}

/**
 * Credits to CX for discovering this.
 * This is not fully correct but it works up to the decimal (float rounding likely causes this).
 * 
 * `[index: level]->score at level`
 */
export const levelToScoreTable = Array(maxPlayerLevel).fill(0);

for (let i = 1; i < maxPlayerLevel; ++i) {
    levelToScoreTable[i] = levelToScoreTable[i - 1] + (40 / 9 * 1.06 ** (i - 1) * Math.min(31, i));
}

/**
 * Credits to CX for discovering this.
 * This is not fully correct but it works up to the decimal (float rounding likely causes this).
 * 
 * Used for level calculation across the codebase.
 * 
 * `(level)->score at level`
 */
export function levelToScore(level: number): number {
    if (level >= maxPlayerLevel) return levelToScoreTable[maxPlayerLevel - 1];
    if (level <= 0) return 0;

    return levelToScoreTable[level - 1];
}
