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

import GameServer from "../../Game";
import ObjectEntity from "../Object";
import AutoTurret from "./AutoTurret";

import { Color, PositionFlags, PhysicsFlags, StyleFlags } from "../../Const/Enums";
import { BarrelBase } from "./TankBody";
import { addonId, BarrelDefinition } from "../../Const/TankDefinitions";
import { AI, AIState, Inputs } from "../AI";
import LivingEntity from "../Live";
import { normalizeAngle, PI2 } from "../../util";
import { CameraEntity } from "../../Native/Camera";
import Barrel from "./Barrel";

/**
 * Abstract class to represent an addon in game.
 * 
 * Addons are entities added on to a tank during its creation. There are two types:
 * pre addons, and post addons. Pre addons are built before the barrels are built - for example
 * a dominator's base is a pre addon. A post addon is an addon built after the barrels are
 * built - for example the pronounciation of Ranger's barrel is a post addon.
 * 
 * Read [addons.md on diepindepth](https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md) 
 * for more details and examples.
 */

export class Addon {
    /** The current game server */
    protected game: GameServer;
    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;

    public constructor(owner: BarrelBase) {
        this.owner = owner;
        this.game = owner.game;
    }

    /**
     * `createGuard` method creates a smasher-like guard shape. 
     * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
     * for more details and examples.
     */
    protected createGuard(sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number): GuardObject {
        return new GuardObject(this.game, this.owner, sides, sizeRatio, offsetAngle, radiansPerTick);
    }

    /**
     * `createAutoTurrets` method builds `count` auto turrets around the current
     * tank's body. 
     */
    protected createAutoTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
    protected createAutoTurretsCuck(count: number) {
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const ROT_OFFSET = 0.8;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(this.owner, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * ((i / count) - 1 / (count * 2));
            //base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.owner.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.owner.positionData.values.angle;
            }
        }
    }
    protected createAutoTrapTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION * 3;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretTrapDefinition);
            base.influencedByOwnerInputs = true;
            base.baseSize *= 1.125
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetBullets = true
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }

    protected createAutoSpectreTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, 1.5, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];
        rotator.styleData.values.color = Color.Barrel
        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretStalkDefinition);
            base.influencedByOwnerInputs = true;
            base.baseSize *= 1.1
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }

    protected createAutoTurretsDisconnected(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2/4; // keep within 90º each side
        const MAX_ANGLE_RANGE2 = PI2; // keep within 90º each side
        const ROT_OFFSET = 2;
        for (let i = 0; i < count; ++i) {
            const  angle = PI2 * (i / count);
            const pronounce = new ObjectEntity(this.game);
            const sizeRatio = 100 / 50;
            const widthRatio = 25.2 / 50;
            const sizeRatio2 = 50 / 50;
            const widthRatio2 = 42 / 50 * 0.8;
            const offsetRatio = 40 / 50;
            const size = this.owner.physicsData.values.size;

            pronounce.setParent(this.owner);
            pronounce.relationsData.values.owner = this.owner;
            pronounce.relationsData.values.team = this.owner.relationsData.values.team

            pronounce.physicsData.values.size = sizeRatio * size;
            pronounce.physicsData.values.width = widthRatio * size;
            pronounce.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle);
            pronounce.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle);
            pronounce.positionData.values.angle = angle;

            pronounce.styleData.values.color = Color.Barrel;
            pronounce.physicsData.values.sides = 2;

            pronounce.tick = () => {
                const size = this.owner.physicsData.values.size;

                pronounce.physicsData.size = sizeRatio * size;
                pronounce.physicsData.width = widthRatio * size;
                pronounce.positionData.y = this.owner.physicsData.values.size * Math.sin(angle);
                pronounce.positionData.x = this.owner.physicsData.values.size * Math.cos(angle);
            }

            
            const pronounce2 = new ObjectEntity(this.game);

            pronounce2.setParent(this.owner);
            pronounce2.relationsData.values.owner = this.owner;
            pronounce2.relationsData.values.team = this.owner.relationsData.values.team

            pronounce2.physicsData.values.size = sizeRatio2 * size;
            pronounce2.physicsData.values.width = widthRatio2 * size;
            pronounce2.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * offsetRatio;
            pronounce2.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * offsetRatio;
            pronounce2.positionData.values.angle = Math.PI + angle;

            pronounce2.styleData.values.color = Color.Barrel;
            pronounce2.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
            pronounce2.physicsData.values.sides = 2;

            pronounce2.tick = () => {
                const size = this.owner.physicsData.values.size;

                pronounce2.physicsData.size = sizeRatio2 * size;
                pronounce2.physicsData.width = widthRatio2 * size;
                pronounce2.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * offsetRatio;
                pronounce2.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * offsetRatio;
            }
            const base = new AutoTurret(this.owner, {...AutoTurretMiniDefinition, reload:1.2});
            base.influencedByOwnerInputs = true;
            base.relationsData.owner = this.owner;
            //base.turret.relationsData.owner = this.owner;
            base.styleData.values.flags |= StyleFlags.showsAboveParent;

            base.ai.inputs.mouse.angle = angle;
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.owner.positionData.values.angle)));
                if(!((this.owner.inputs.attemptingRepel() || this.owner.inputs.attemptingShot()))){
                    return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
                }else{
                    return deltaAngle < MAX_ANGLE_RANGE2 || deltaAngle > (PI2 - MAX_ANGLE_RANGE2);
                }
            }

            base.positionData.values.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.values.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

        // if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
            base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
            base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;
            //base.positionData.values.x += rotator.physicsData.values.size * Math.cos(MAX_ANGLE_RANGE2)  * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.owner.positionData.values.angle;
            }
        }

    }
}


const AutoTurretMiniDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 55,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1,
    recoil: 0.3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.4,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const AutoTurretTrapDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 40,
    width: 56.7 * 0.7,
    delay: 0.01,
    reload: 3,
    recoil: 0.3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "noScaleTrapLauncher",
    bullet: {
        type: "trap",
        health: 0.7,
        damage: 2,
        speed: 2.5,
        scatterRate: 1,
        lifeLength: 4,
        sizeRatio: 1.1,
        absorbtionFactor: 0.8
    }
};

const AutoTurretStalkDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1.5,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 3.141592653589793,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.5,
        speed: 1.5,
        scatterRate: 0.3,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
export const AutoSmasherTurretDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 55,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "reloadbullet",
        health: 1,
        damage: 0.5,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const MiniNebulaAutoTurretDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 55/(10/3),
    width: 42 * (0.7/(10/3)),
    delay: 0.01,
    reload: 1,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.4,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const NebulaAutoTurretDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 30,
    width: 42 * 0.45,
    delay: 0.01,
    reload: 3,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 1,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const PolluxAutoTurretDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 30 * 1.4,
    width: 42 * 0.45 * 1.4,
    delay: 0.01,
    reload: 5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 3,
        speed: 1.5,
        scatterRate: 0.3,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 0.1
    }
};

const OberonAutoTurretDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 30 * 1.2,
    width: 42 * 0.45 * 1.2,
    delay: 0.01,
    reload: 2,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 1,
        speed: 1.4,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};


const MiniTritonDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 12.5,
    width: 8.4,
    delay: 0.1,
    reload: 4.5,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 2,
    canControlDrones: true,
    bullet: {
        type: "drone",
        health: 1,
        damage: 0.4,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: -1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const TritonDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 25,
    width: 16.8,
    delay: 0.35,
    reload: 12.5,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 1,
    canControlDrones: false,
    bullet: {
        type: "drone",
        health: 1.3,
        damage: 1,
        speed: 1,
        scatterRate: 1,
        lifeLength: -1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const MiniHyperionDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 12.5 * 0.8,
    width: 6.3,
    delay: 0.1,
    reload: 3.5,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 4,
    canControlDrones: true,
    bullet: {
        type: "drone",
        health: 0.6,
        damage: 0.4,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: -1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const HyperionDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 27.5,
    width: 18.9,
    delay: 0.35,
    reload: 14,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 2,
    canControlDrones: false,
    bullet: {
        type: "drone",
        health: 2,
        damage: 1,
        speed: 1,
        scatterRate: 1,
        lifeLength: -1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const NesoDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 30,
    width: 23.625,
    delay: 0.35,
    reload: 14,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 3,
    canControlDrones: true,
    bullet: {
        type: "drone",
        health: 2,
        damage: 1,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: -1,
        sizeRatio: 0.8,
        absorbtionFactor: 1
    }
};

/**
 * A smasher-like guard object.
 * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
 * for more details and examples.
 */
export class GuardObject extends ObjectEntity implements BarrelBase {
    /***** From BarrelBase *****/
    public inputs: Inputs;
    public cameraEntity: CameraEntity;
    public reloadTime: number;

    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;
    /** To store the size ratio (in compared to the owner) */
    public sizeRatio: number;
    /** Radians per tick, how many radians the guard will rotate in a tick */
    public radiansPerTick: number;

    public constructor(game: GameServer, owner: BarrelBase, sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number) {
        super(game);

        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        // It's weird, but it's how it works
        sizeRatio *= Math.SQRT1_2
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;

        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;

        this.styleData.values.color = Color.Border;
        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }

    /**
     * Size factor, used for calculation of the turret and base size.
     */
    get sizeFactor() {
        return this.owner.sizeFactor;
    }

    /**
     * Called (if ever) similarly to LivingEntity.onKill
     * Spreads onKill to owner
     */
    public onKill(killedEntity: LivingEntity) {
        if (!(this.owner instanceof LivingEntity)) return;
        this.owner.onKill(killedEntity);
    }

    public tick(tick: number): void {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle += this.radiansPerTick;
        // It won't ever do any collisions, so no need to tick the object
        // super.tick(tick);
    }
}
class CuckAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurretsCuck(1);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
    }
}
/** Spikes addon. */
class SpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.3, 0, 0.17);
        this.createGuard(3, 1.3, Math.PI / 3, 0.17);
        this.createGuard(3, 1.3, Math.PI / 6, 0.17);
        this.createGuard(3, 1.3, Math.PI / 2, 0.17);
    }
}
/** Dominator's Base addon. */
class DomBaseAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.24, 0, 0);
    }
}
/** Smasher addon. */
class SmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
    }
}
/** Mega Smasher addon. */
class MegaSmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.3, 0, .1);
    }
}
/** Saw addon. */
class SawAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(4, 1.65, Math.PI, .15);
    }
}
/** Landmine addon. */
class LandmineAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        this.createGuard(6, 1.15, 0, .05);
    }
}
/** The thing underneath Rocketeer and Twister addon. */
class LauncherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;

        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;

        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}
/** The thing underneath glider addon. */
class GliderAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;

        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;

        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        launcher.positionData.values.angle = Math.PI;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}
/** The thing underneath missile addon. */
class MissileAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 42 / 50;
        const size = this.owner.physicsData.values.size;

        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;

        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}
/** Centered Auto Turret addon. */
class AutoTurretAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new AutoTurret(owner);
    }
}

/** Smasher + Centered Auto Turret addon. */
class AutoSmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        const turret = new AutoTurret(owner, AutoSmasherTurretDefinition);
        turret.influencedByOwnerInputs = true
    }
}
/** 5 Auto Turrets */
class Auto5Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(5);
    }
}
/** 3 Auto Turrets */
class Auto3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(3);
    }
}
/** 4 Auto Trap Turrets */
class Auto4Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTrapTurrets(4);
    }
}
class Joint3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.createAutoTurretsDisconnected(3);
    }
}
class SpectreAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoSpectreTurrets(3);
    }
}
/** The thing above ranger's barrel. */
class PronouncedAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above Gunner + Destroyer Dominator's barrel. */
class PronouncedDomAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 22 / 50;
        const widthRatio = 35 / 50;
        const offsetRatio = 50 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;
        
        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above blasters's barrel. */
class PronouncedBlastAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50 * 1.6;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above shotgun's barrel. */
class PronouncedShotAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50 * 1.85;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above x hunter's barrel. */
class XPronouncedAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 54.6 / 50;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above mine layers's barrel. */
class MineAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const pronounce2 = new ObjectEntity(this.game);
        const sizeRatio = 85 / 50;
        const widthRatio = 42 / 50 * 0.5;
        const offsetRatio = 40 / 50;
        const offsetRatioY = 26 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.y = offsetRatioY * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
            pronounce.positionData.y = offsetRatioY * size;
        }
        pronounce2.setParent(this.owner);
        pronounce2.relationsData.values.owner = this.owner;
        pronounce2.relationsData.values.team = this.owner.relationsData.values.team

        pronounce2.physicsData.values.size = sizeRatio * size;
        pronounce2.physicsData.values.width = widthRatio * size;
        pronounce2.positionData.values.x = offsetRatio * size;
        pronounce2.positionData.values.y = -offsetRatioY * size;
        pronounce2.positionData.values.angle = Math.PI;

        pronounce2.styleData.values.color = Color.Barrel;
        pronounce2.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce2.physicsData.values.sides = 2;

        pronounce2.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce2.physicsData.size = sizeRatio * size;
            pronounce2.physicsData.width = widthRatio * size;
            pronounce2.positionData.x = offsetRatio * size;
            pronounce2.positionData.y = -offsetRatioY * size;
        }
    }
}
/** Weird spike addon. Based on the arrasio Original. */
class WeirdSpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.5, 0, 0.17);
        this.createGuard(3, 1.5, 0, -0.16);
    }
}
/** 2 Auto Turrets */
class Auto2Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(2);
    }
}
/** 7 Auto Turrets */
class Auto7Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(7);
    }
}

/** Centered Auto Rocket addon. */
class AutoRocketAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const base = new AutoTurret(owner, {
            angle: 0,
            offset: 0,
            size: 40,
            width: 26.25,
            delay: 0,
            reload: 2,
            recoil: 0,
            isTrapezoid: true,
            trapezoidDirection: 3.141592653589793,
            addon: null,
            bullet: {
                type: "rocket",
                sizeRatio: 1,
                health: 2.5,
                damage: 0.5,
                speed: 0.3,
                scatterRate: 1,
                lifeLength: 0.75,
                absorbtionFactor: 0.1
            }
        });

        new LauncherAddon(base);

        base.turret[0].styleData.zIndex += 2;
    }
}

/** Centered Auto Sniper Turret addon. */
class LichAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const base = new AutoTurret(owner, {
            angle: 0,
            offset: 0,
            size: 65,
            width: 42 * 0.7,
            delay: 0.01,
            reload: 4.5,
            recoil: 0.3,
            isTrapezoid: false,
            trapezoidDirection: 0,
            addon: null,
            bullet: {
                type: "bullet",
                health: 1,
                damage: 1.4,
                speed: 1.5,
                scatterRate: 0.3,
                lifeLength: 1,
                sizeRatio: 1,
                absorbtionFactor: 1
            }
        });

        new LauncherAddon(base);
        base.turret[0].styleData.zIndex += 2;

        
        /*const pronounce = new ObjectEntity(this.game);
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size =  50 * this.owner.sizeFactor;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.styleData.values.flags |= StyleFlags.showsAboveParent;
        pronounce.physicsData.values.sides = 1;
        pronounce.styleData.values.borderWidth = 0
        pronounce.tick = () => {
            pronounce.physicsData.size = 50 * this.owner.sizeFactor;
        }*/
    }
}
/** SPIESK addon. */
class SpieskAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(4, 1.3, 0, 0.17);
        this.createGuard(4, 1.3, Math.PI / 6, 0.17);
        this.createGuard(4, 1.3, 2 * Math.PI / 6, 0.17);
    }
}
/** Prime Celestial's guard addon. */
class PrimePreAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const guard = new ObjectEntity(this.game);

        guard.setParent(this.owner);
        guard.relationsData.values.owner = this.owner;
        guard.relationsData.values.team = this.owner.relationsData.values.team

        guard.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.2;

        guard.styleData.values.color = Color.Border
        guard.physicsData.values.sides = 3;
        guard.tick = () => {
            guard.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.2;
        }
    }
}
/** Prime Celestial's upper body addon. */
class PrimePostAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
        const segment1 = new ObjectEntity(this.game);

        segment1.setParent(this.owner);
        segment1.relationsData.values.owner = this.owner;
        segment1.relationsData.values.team = this.owner.relationsData.values.team;

        segment1.physicsData.values.size = body.physicsData.size * 0.85;

        segment1.styleData.values.color = Color.Border;
        segment1.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        segment1.tick = () => {
            segment1.physicsData.size = body.physicsData.size * 0.85;
        }

        const segment2 = new ObjectEntity(this.game);

        segment2.setParent(this.owner);
        segment2.relationsData.values.owner = this.owner;
        segment2.relationsData.values.team = this.owner.relationsData.values.team;

        segment2.physicsData.values.size = body.physicsData.size * 0.65;

        segment2.styleData.values.color = this.owner.styleData.color;
        segment2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        segment2.tick = () => {
            segment2.physicsData.size = body.physicsData.size * 0.65;
        }

        const segment3 = new ObjectEntity(this.game);

        segment3.setParent(this.owner);
        segment3.relationsData.values.owner = this.owner;
        segment3.relationsData.values.team = this.owner.relationsData.values.team;

        segment3.physicsData.values.size = body.physicsData.size * 0.4;

        segment3.styleData.values.color = Color.Border;
        segment3.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        segment3.tick = () => {
            segment3.physicsData.size = body.physicsData.size * 0.4;
        }

        const segment4 = new ObjectEntity(this.game);

        segment4.setParent(this.owner);
        segment4.relationsData.values.owner = this.owner;
        segment4.relationsData.values.team = this.owner.relationsData.values.team;

        segment4.physicsData.values.size = body.physicsData.size * 0.25;

        segment4.styleData.values.color = Color.Barrel;
        segment4.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        segment4.tick = () => {
            segment4.physicsData.size = body.physicsData.size * 0.25;
        }

        const segment5 = new ObjectEntity(this.game);

        segment5.setParent(this.owner);
        segment5.relationsData.values.owner = this.owner;
        segment5.relationsData.values.team = this.owner.relationsData.values.team;

        segment5.physicsData.values.size = body.physicsData.size * 0.15;

        segment5.styleData.values.color = this.owner.styleData.color;
        segment5.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        segment5.tick = () => {
            segment5.physicsData.size = body.physicsData.size * 0.15;
        }

        const glow = new ObjectEntity(this.game);

        glow.setParent(this.owner);
        glow.relationsData.values.owner = this.owner;
        glow.relationsData.values.team = this.owner.relationsData.values.team;

        glow.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 3;

        glow.styleData.values.color = this.owner.styleData.color
        glow.physicsData.values.sides = 3;
        //glow.styleData.values.borderWidth = 0
        glow.styleData.values.opacity = 0.3
        glow.tick = () => {
            glow.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 3;
        }

    }
}

/** Celestial's body addon. */
class CelestialAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
    }
}

/** Tier 2 body Celestial's body addon. */
class UpgradedCelestialAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this.owner);
        body2.relationsData.values.owner = this.owner;
        body2.relationsData.values.team = this.owner.relationsData.values.team;

        body2.physicsData.values.size = body.physicsData.values.size * 0.7;

        body2.styleData.values.color = this.owner.styleData.color;
        body2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body2.tick = () => {
            body2.physicsData.size = body.physicsData.values.size * 0.7;
        }
    }
}

class Tier2CelestialAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
    }
}

/** Nebula's body addon. */
class NebulaAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const count = 3;
        const offset = 0.65;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniNebulaAutoTurretDefinition, 7.5);
            base.ai.viewRange *= 0.8;
            const MAX_ANGLE_RANGE = PI2 / 3; // keep within 120º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3);
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + owner.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset;
                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        const base = new AutoTurret(owner, NebulaAutoTurretDefinition, 12.5);
        base.ai.viewRange *= 1.5;
    }
}

/** Chasm's guard addon. */
class ChasmPreAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const guard = new ObjectEntity(this.game);

        guard.setParent(this.owner);
        guard.relationsData.values.owner = this.owner;
        guard.relationsData.values.team = this.owner.relationsData.values.team,

        guard.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.25;

        guard.styleData.values.color = Color.Border
        guard.physicsData.values.sides = 3;
        guard.tick = () => {
            guard.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.25;
        }
    }
}

/** Chasms's body addon. */
class ChasmAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this.owner);
        body2.relationsData.values.owner = this.owner;
        body2.relationsData.values.team = this.owner.relationsData.values.team;

        body2.physicsData.values.size = body.physicsData.values.size * 0.8;

        body2.styleData.values.color = this.owner.styleData.color;
        body2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body2.tick = () => {
            body2.physicsData.size = body.physicsData.values.size * 0.8;
        }
        const body3 = new ObjectEntity(this.game);

        body3.setParent(this.owner);
        body3.relationsData.values.owner = this.owner;
        body3.relationsData.values.team = this.owner.relationsData.values.team;

        body3.physicsData.values.size = body.physicsData.values.size * 0.4;

        body3.styleData.values.color = this.owner.styleData.color;
        body3.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body3.tick = () => {
            body3.physicsData.size = body.physicsData.values.size * 0.4;
        }
    }
}

/** Tritons's body addon. */
class TritonAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const count = 3;
        const offset = 0.65;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniTritonDefinition, (32.5 * Math.SQRT2)/(20/3));
            base.physicsData.sides = 4
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3);
            base.influencedByOwnerInputs = true;
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset;
                tickBase.call(base, tick);
                base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        const spinner = new GuardObject(this.game, owner,1, 0.5, Math.PI, 0.1);

        spinner.styleData.values.color = Color.Barrel;
        spinner.styleData.flags |= StyleFlags.showsAboveParent
        for (let i = 0; i < count; ++i) {
            new Barrel(spinner, {...TritonDefinition, angle: (PI2/3) * i})
        }
    }
}

/** Galaxy's body addon. */
class GalaxyAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const count = 3;
        const offset = 0.65;
        const offset2 = 0.3;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniNebulaAutoTurretDefinition, 7.5);
            base.ai.viewRange *= 0.8;
            const MAX_ANGLE_RANGE = PI2 / 3; // keep within 120º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3);
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + owner.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset;
                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniNebulaAutoTurretDefinition, 7.5);
            base.ai.viewRange *= 0.8;
            const MAX_ANGLE_RANGE = PI2 / 3; // keep within 120º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3) + Math.PI;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + owner.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset2;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset2;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset2;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset2;
                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        const base = new AutoTurret(owner, NebulaAutoTurretDefinition, 12.5);
        base.ai.viewRange *= 1.25;
    }
}
/** Pollux's body addon. */
class PolluxAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const base = new AutoTurret(owner, PolluxAutoTurretDefinition, 12.5 * 1.4);
        base.ai.viewRange *= 1.65;
    }
}

/** Oberon's body addon. */
class OberonAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const count = 3;
        const offset = 0.65;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniHyperionDefinition, (32.5 * Math.SQRT2)/(20/3) * 0.8);
            base.physicsData.sides = 4
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3);
            base.influencedByOwnerInputs = true;
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset;
                tickBase.call(base, tick);
                base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        const base = new AutoTurret(owner, OberonAutoTurretDefinition, 12.5 * 1.2);
        base.ai.viewRange *= 1.4;
    }
}

/** Void's guard addon. */
class VoidPreAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const guard = new ObjectEntity(this.game);

        guard.setParent(this.owner);
        guard.relationsData.values.owner = this.owner;
        guard.relationsData.values.team = this.owner.relationsData.values.team,

        guard.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.4;

        guard.styleData.values.color = Color.Border
        guard.physicsData.values.sides = 3;
        guard.tick = () => {
            guard.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.4;
        }
    }
}

/** Comet's guard addon. */
class CometPreAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const guard = new ObjectEntity(this.game);

        guard.setParent(this.owner);
        guard.relationsData.values.owner = this.owner;
        guard.relationsData.values.team = this.owner.relationsData.values.team,

        guard.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.2;

        guard.styleData.values.color = Color.Border
        guard.physicsData.values.sides = 3;
        guard.tick = () => {
            guard.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor * 1.2;
        }
    }
}

/** Comet's body addon. */
class CometAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this.owner);
        body2.relationsData.values.owner = this.owner;
        body2.relationsData.values.team = this.owner.relationsData.values.team;

        body2.physicsData.values.size = body.physicsData.values.size * 0.8;
        body2.positionData.angle = Math.PI;
        body2.styleData.values.color = Color.Border;
        body2.styleData.values.flags |= StyleFlags.isStar;
        body2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body2.tick = () => {
            body2.physicsData.size = body.physicsData.values.size * 0.8;
        }
        const body3 = new ObjectEntity(this.game);

        body3.setParent(this.owner);
        body3.relationsData.values.owner = this.owner;
        body3.relationsData.values.team = this.owner.relationsData.values.team;

        body3.physicsData.values.size = body.physicsData.values.size * 0.4;

        body3.styleData.values.color = this.owner.styleData.color;
        body3.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body3.tick = () => {
            body3.physicsData.size = body.physicsData.values.size * 0.4;
        }
    }
}

/** Abyss's body addon. */
class AbyssAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        if(this.owner.styleData.flags & StyleFlags.isVisible) this.owner.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this.owner);
        body.relationsData.values.owner = this.owner;
        body.relationsData.values.team = this.owner.relationsData.values.team;

        body.physicsData.values.size = 25 * Math.SQRT2 * this.owner.sizeFactor;

        body.styleData.values.color = this.owner.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = 25 * Math.SQRT2 * this.owner.sizeFactor;
        }
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this.owner);
        body2.relationsData.values.owner = this.owner;
        body2.relationsData.values.team = this.owner.relationsData.values.team;

        body2.physicsData.values.size = body.physicsData.values.size * 0.8;

        body2.styleData.values.color = this.owner.styleData.color;
        body2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body2.tick = () => {
            body2.physicsData.size = body.physicsData.values.size * 0.8;
        }
        const body3 = new ObjectEntity(this.game);

        body3.setParent(this.owner);
        body3.relationsData.values.owner = this.owner;
        body3.relationsData.values.team = this.owner.relationsData.values.team;

        body3.physicsData.values.size = body.physicsData.values.size * 0.6;

        body3.styleData.values.color = this.owner.styleData.color;
        body3.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body3.tick = () => {
            body3.physicsData.size = body.physicsData.values.size * 0.6;
        }
        const body4 = new ObjectEntity(this.game);

        body4.setParent(this.owner);
        body4.relationsData.values.owner = this.owner;
        body4.relationsData.values.team = this.owner.relationsData.values.team;

        body4.physicsData.values.size = body.physicsData.values.size * 0.4;

        body4.styleData.values.color = this.owner.styleData.color;
        body4.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body4.tick = () => {
            body4.physicsData.size = body.physicsData.values.size * 0.4;
        }
    }
}


/** Hyperion's body addon. */
class HyperionAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;
        const count = 3;
        const offset = 0.65;
        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(owner, MiniHyperionDefinition, (32.5 * Math.SQRT2)/(20/3) * 0.8);
            base.physicsData.sides = 4
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 3);
            base.influencedByOwnerInputs = true;
            base.positionData.values.y = owner.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = owner.physicsData.values.size * Math.cos(angle) * offset;
            //base.positionData.values.flags ^= PositionFlags.absoluteRotation;
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = owner.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = owner.physicsData.values.size * Math.cos(angle) * offset;
                tickBase.call(base, tick);
                base.positionData.angle = angle + owner.positionData.angle;
            }
        }
        const spinner = new GuardObject(this.game, owner,1, 0.6, Math.PI, 0.1);

        spinner.styleData.values.color = Color.Barrel;
        spinner.styleData.flags |= StyleFlags.showsAboveParent
        for (let i = 0; i < count; ++i) {
            new Barrel(spinner, {...HyperionDefinition, angle: (PI2/3) * i})
        }
    }
}

/** Neso's body addon. */
class NesoAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);
        new UpgradedCelestialAddon(owner);
        owner.positionData.values.flags |= PositionFlags.absoluteRotation;

        const spinner = new GuardObject(this.game, owner,1, 0.6, Math.PI, 0.1);
        const count = 3;
        spinner.styleData.values.color = Color.Barrel;
        spinner.styleData.flags |= StyleFlags.showsAboveParent
        for (let i = 0; i < count; ++i) {
            new Barrel(spinner, {...NesoDefinition, angle: (PI2/3) * i})
        }
    }
}
/**
 * All addons in the game by their ID.
 */
export const AddonById: Record<addonId, typeof Addon | null> = {
    celestial: CelestialAddon,
    nebula: NebulaAddon,
    galaxy: GalaxyAddon,
    pollux: PolluxAddon,
    oberon: OberonAddon,
    chasmPreAddon: ChasmPreAddon,
    chasm: ChasmAddon,
    voidPreAddon: VoidPreAddon,
    cometPreAddon: CometPreAddon,
    comet: CometAddon,
    abyss: AbyssAddon,
    primepost: PrimePostAddon,
    primepre: PrimePreAddon,
    triton: TritonAddon,
    hyperion: HyperionAddon,
    neso: NesoAddon,
    spike: SpikeAddon,
    dombase: DomBaseAddon,
    launcher: LauncherAddon,
    glider: GliderAddon,
    launchermissile: MissileAddon,
    dompronounced: PronouncedDomAddon,
    blasterpronounced: PronouncedBlastAddon,
    shotgunpronounced: PronouncedShotAddon,
    auto5: Auto5Addon,
    auto3: Auto3Addon,
    auto4: Auto4Addon,
    joint3: Joint3Addon,
    spectre: SpectreAddon,
    cuck : CuckAddon,
    autosmasher: AutoSmasherAddon,
    pronounced: PronouncedAddon,
    Xpronounced: XPronouncedAddon,
    minelayer: MineAddon,
    smasher: SmasherAddon,
    megasmasher: MegaSmasherAddon,
    landmine: LandmineAddon,
    saw: SawAddon,
    autoturret: AutoTurretAddon,
    lich: LichAddon,
    // not part of diep
    weirdspike: WeirdSpikeAddon,
    auto7: Auto7Addon,
    auto2: Auto2Addon,
    autorocket: AutoRocketAddon,
    spiesk: SpieskAddon,
}
