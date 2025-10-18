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

import { Color } from "chalk";
import { tps } from "../../../config";
import { PositionFlags, StyleFlags } from "../../../Const/Enums";
import GameServer from "../../../Game";
import { AI, AIState } from "../../AI";
import AbstractShape from "../AbstractShape";
import { Sentry } from "../Sentry";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import Barrel from "../../Tank/Barrel";
import { PI2, normalizeAngle } from "../../../util";
import AutoTurret from "../../Tank/AutoTurret";

/**
 * Definitions (stats and data) of the barrel on the Automated Sentry and its auto cannons
 */
const AutomatedSentryDefinition: BarrelDefinition = {
        angle: Math.PI,
        offset: 0,
        size: 60,
        width: 42,
        delay: 0,
        reload: 0.4,
        recoil: 1.25,
        isTrapezoid: true,
        trapezoidDirection: Math.PI,
        addon: null,
        bullet: {
        type: "bullet",
        sizeRatio:1,
        health: 1,
        damage: 0.3,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.5,
        absorbtionFactor: 1
    }
};

const AutomatedSentryAutoCannonDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 1.5,
        damage: 1.6,
        speed: 1,
        scatterRate: 1,
        lifeLength: 1,
        absorbtionFactor: 0.1
    }
};




/**
 * Automated Sentry entity class.
 */
export default class AutomatedSentry extends Sentry {

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = "Automated Sentry";
        this.barrels = [new Barrel(this, AutomatedSentryDefinition)];
        const MAX_ANGLE_RANGE = PI2 / 3; // keep within 120 each side

        for (let i = 0; i < 2; ++i) {
            const base  = new AutoTurret(this, {...AutomatedSentryAutoCannonDefinition,size: 55, angle: 0.39269908169872414});
            base.turret.push(new Barrel(base, {...AutomatedSentryAutoCannonDefinition,size: 55, angle: -0.39269908169872414}));
            base.turret.push(new Barrel(base, AutomatedSentryAutoCannonDefinition));

            base.influencedByOwnerInputs = true;
            base.baseSize *= 1.1;
            base.ai.viewRange = 2000;
            const angle = base.ai.inputs.mouse.angle = PI2 * ((i / 3) - (1/6));
            base.ai.passiveRotation = AI.PASSIVE_ROTATION;
            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * 0.8;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * 0.8;

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * 0.8;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * 0.8;
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle
                tickBase.call(base, tick);
            }
        }
    }
}
