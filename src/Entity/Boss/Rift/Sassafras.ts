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


import { Color, PositionFlags } from "../../../Const/Enums";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import GameServer from "../../../Game";
import { PI2 } from "../../../util";
import { AIState } from "../../AI";
import Eye from "../../Misc/Eye";
import ObjectEntity from "../../Object";
import AutoTurret, { AutoTurretDefinition } from "../../Tank/AutoTurret";
import Barrel from "../../Tank/Barrel";
import { MinionBarrelDefinition } from "../../Tank/Projectile/Minion";
import AbstractBoss from "../AbstractBoss";



/**
 * Definitions (stats and data) of the mounted turret on Sassafras
 *
 * Sassafras's gun
 */
const MountedTurretDefinition: BarrelDefinition = {
    ...AutoTurretDefinition,
    bullet: {
        ...AutoTurretDefinition.bullet,
        speed: 2.3,
        damage: 1.3,
        health: 5.75,
        color: Color.Neutral
    }
};

const MountedTrapperDefinition: BarrelDefinition = {
    ...AutoTurretDefinition,
    reload: 1.5,
    size: 35,
    addon: "trapLauncher",
    bullet: {
        type: "trap",
        sizeRatio: 0.8,
        health: 25,
        damage: 1.5,
        speed: 2,
        scatterRate: 1,
        lifeLength: 8,
        absorbtionFactor: 1,
        color: Color.Neutral
    }
};

const GunnerMinionDefinition: BarrelDefinition[] = 
[
    {
        ...MinionBarrelDefinition[0],
        offset: 37,
        width: 25.2  * 1.2,
        delay: 0.75,
        size: 80,
        bullet: {
            ...MinionBarrelDefinition[0].bullet, speed: 2, color: Color.Neutral
        }
    },
    {
        ...MinionBarrelDefinition[0],
        offset: -37,
        width: 25.2  * 1.2,
        delay: 0.5,
        size: 80,
        bullet: {
            ...MinionBarrelDefinition[0].bullet, speed: 2, color: Color.Neutral
        }
    },
    {
        ...MinionBarrelDefinition[0],
        offset: 22,
        width: 25.2 * 1.2,
        delay: 0.25,
        size: 95,
        bullet: {
            ...MinionBarrelDefinition[0].bullet, speed: 2, color: Color.Neutral
        }
    },
    {
        ...MinionBarrelDefinition[0],
        offset: -22,
        width: 25.2  * 1.2,
        size: 95,
        bullet: {
            ...MinionBarrelDefinition[0].bullet, speed: 2, color: Color.Neutral
        }
    },
];

const SpawnerDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 155,
    width: 71.4,
    delay: 0,
    reload: 0.72,
    recoil: 1,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 1,
    canControlDrones: true,
    bullet: {
        type: "minion",
        sizeRatio: 45 * Math.SQRT1_2 / (71.4 / 2),
        health: 12.5,
        damage: 0.56,
        speed: 1.7,
        scatterRate: 1,
        lifeLength: -1,
        absorbtionFactor: 1,
        sides: 6,
        barrels: GunnerMinionDefinition
    }
};

// The size of a Sassafras by default
const SASSAFRAS_SIZE = 150;

const EYE_SIZE = 50;

/**
 * Class which represents the boss "Sassafras"
 */
export default class Sassafras extends AbstractBoss {
    /** All decorations attached to this. */
    public decors: ObjectEntity[] = [];

    public constructor(game: GameServer) {
        super(game);
        this.movementSpeed = 0.2;
        this.nameData.values.name = "Sassafras";
        this.styleData.values.color = Color.NecromancerSquare;
        this.scoreReward = 50000 * this.game.arena.shapeScoreRewardMultiplier;

        this.physicsData.values.sides = 6;
        this.physicsData.values.size = SASSAFRAS_SIZE * Math.SQRT1_2;
        
        this.relationsData.values.team = this.game.arena;
        
        this.ai.passiveRotation *= 2;
        
        this.decors.push(new Eye(this, Color.Neutral, EYE_SIZE));

        const count = this.physicsData.values.sides;
        const offset = 110 / (SASSAFRAS_SIZE * Math.SQRT1_2);
        for (let i = 0; i < count; ++i) {
            this.barrels.push(new Barrel(this, {
                ...SpawnerDefinition,
                angle: PI2 * ((i / count) + 1 / (count * 2))
            }));

            const definition = i % 2 === 0 ? MountedTurretDefinition : MountedTrapperDefinition;
            const base = new AutoTurret(this, definition);
            //new AddonById["launcher"](base);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * offset;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * offset;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * offset;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * offset;
                
                if (base.ai.state === AIState.idle){
                    if(base.physicsData.values.flags & PositionFlags.absoluteRotation)base.physicsData.flags ^= PositionFlags.absoluteRotation;
                } else {
                    base.physicsData.values.flags |= PositionFlags.absoluteRotation;
                }
                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;
            }
        }
    }

    public get sizeFactor() {
        return (this.physicsData.values.size / Math.SQRT1_2) / SASSAFRAS_SIZE;
    }
    
    protected moveAroundMap() {
      const x = this.positionData.values.x,
      y = this.positionData.values.y
        if (this.ai.state === AIState.idle) {
            super.moveAroundMap();
        } else {
           // ...
        }
    }

    public tick(tick: number) {
       super.tick(tick);

        if (this.ai.state !== AIState.possessed) {
            this.positionData.angle += this.ai.passiveRotation;
        }
    }
}