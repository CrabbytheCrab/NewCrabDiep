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

import Barrel from "../Barrel";
import Bullet from "./Bullet";

import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import { TankDefinition } from "../../../Const/TankDefinitions";
import { Entity } from "../../../Native/Entity";
import { AI, AIState } from "../../AI";
import TankBody, { BarrelBase } from "../TankBody";
import * as util from "../../../util";

/**
 * The seaker class represents the seaker (projectile) entity in diep.
 */
export default class Seeker extends Bullet {
    /** The AI of the seaker (for AI mode) */
    public ai: AI;

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        const bulletDefinition = barrel.definition.bullet;
        this.usePosAngle = true;
        this.ai = new AI(this);
        this.ai.viewRange = (bulletDefinition.aiRange ?? 600) * tank.sizeFactor;
        this.ai.useOwerPosition = false;
        this.physicsData.values.sides = 1;

        this.ai.movementSpeed = this.ai.aimSpeed = this.baseAccel;

    }


    public tick(tick: number) {
        this.isPassiveMode = false;
        super.tick(tick);
        this.isPassiveMode = false;
        if (this.ai.state === AIState.hasTarget && this.ai.target) {
            const angle = Math.atan2(this.ai.target.positionData.y - this.positionData.values.y, this.ai.target.positionData.x - this.positionData.values.x);
            this.positionData.angle = util.lerpAngles(this.positionData.angle,angle, 0.3);
        }
        // So that switch tank works, as well as on death
        if (!Entity.exists(this.barrelEntity)) this.destroy();
    }
}