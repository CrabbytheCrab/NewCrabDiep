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

import { StyleFlags, PositionFlags, Color } from "../../../Const/Enums";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import GameServer from "../../../Game";
import { PI2, normalizeAngle } from "../../../util";
import { AIState } from "../../AI";
import AutoTurret, { AutoTurretDefinition } from "../../Tank/AutoTurret";
import Barrel from "../../Tank/Barrel";
import { MinionBarrelDefinition } from "../../Tank/Projectile/Minion";
import AbstractBoss from "../AbstractBoss";


/**
 * Definitions (stats and data) of the trap launcher on Rogue Palisade
 */
const PalisadeTrapperDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42 * 1.5,
    delay: 0,
    reload: 3,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "trapLauncher",
    forceFire: true,
    bullet: {
        type: "trap",
        sizeRatio: 0.8,
        health: 10,
        damage: 4,
        speed: 3,
        scatterRate: 1,
        lifeLength: 6,
        absorbtionFactor: 1
    }
}
/**
 * Definitions (stats and data) of the barrel of the minions of the Rogue Palisade
 */
const PalisadeMinionBarrel: BarrelDefinition[] = 
[
    {
        ...MinionBarrelDefinition[0],
        reload: 1.5,
        bullet: {
            ...MinionBarrelDefinition[0].bullet, speed: 1.4, damage: 0.8
        }
    },
]
/**
 * Definitions (stats and data) of the minion launcher on Rogue Palisade
 */
const PalisadeMinionDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 220,
    width: 84 * 1.5,
    delay: 0,
    reload: 4,
    recoil: 0,
    droneCount:2,
    isTrapezoid: true,
    trapezoidDirection: Math.PI,
    addon: null,
    canControlDrones:true,
    bullet: {
        type: "minion",
        sizeRatio: 0.5,
        health: 8,
        damage: 4,
        speed: 1.6,
        scatterRate: 0.3,
        lifeLength: -1,
        absorbtionFactor: 0.8,
        barrels: PalisadeMinionBarrel
    }
}

// The size of a Rogue Palisade by default
const PALISADE_SIZE = 200;

/**
 * Class which represents the boss "Rogue Palisade"
 */
export default class RoguePalisade extends AbstractBoss {

    /** Rogue Palisade's minion launchers */
    private spawners: Barrel[] = [];
    /** See AbstractBoss.movementSpeed */
    public movementSpeed = 0.2;

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = 'Rogue Palisade';
        this.styleData.values.color = Color.Border;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = PALISADE_SIZE * Math.SQRT1_2;
        this.scoreReward = 50000 * this.game.arena.shapeScoreRewardMultiplier;

        this.physicsData.values.sides = 6;
        this.ai.viewRange = 4000
        for (let i = 0; i < 6; ++i) {

            // TODO:
            // Maybe make this into a class of itself - DefenderAutoTurret
            const base = new AutoTurret(this, [PalisadeTrapperDefinition],45);
            const MAX_ANGLE_RANGE = PI2 / 6; // keep within 90º each side
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 6);
            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;


            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * 1.25;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * 1.25;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * 1.25;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * 1.25;
                if (base.ai.state === AIState.idle){
                    if(base.physicsData.values.flags & PositionFlags.absoluteRotation)base.physicsData.flags ^= PositionFlags.absoluteRotation;
                } else {
                    base.physicsData.values.flags |= PositionFlags.absoluteRotation;
                }
                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;

            }
        }
        for (let i = 0; i < 6; ++i) {
            // Add spawner launcher
            this.spawners.push(new Barrel(this, {
                ...PalisadeMinionDefinition,
                angle: PI2 * ((i / 6) - 1 / 12)
            }));
        }
    }

    public get sizeFactor() {
        return (this.physicsData.values.size / Math.SQRT1_2) / PALISADE_SIZE;
    }

    public tick(tick: number) {
       super.tick(tick);

        if (this.ai.state !== AIState.possessed) {
            this.positionData.angle += this.ai.passiveRotation * Math.PI * Math.SQRT1_2;
        }
    }
}
