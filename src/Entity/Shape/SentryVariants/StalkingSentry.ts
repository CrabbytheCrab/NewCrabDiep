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

import { tps } from "../../../config";
import {Color, PhysicsFlags, PositionFlags } from "../../../Const/Enums";
import GameServer from "../../../Game";
import { AI, AIState } from "../../AI";
import AbstractShape from "../AbstractShape";
import { Sentry } from "../Sentry";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import Barrel from "../../Tank/Barrel";
import * as util from "../../../util";
import ObjectEntity from "../../Object";


/**
 * Stalker Sentry entity class.
 */
export default class StalkingSentry extends Sentry {

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = "Stalking Sentry";
        this.healthData.values.health = this.healthData.values.maxHealth = 175;
        this.physicsData.values.pushFactor =  4;
        this.damagePerTick = 10;
        this.targettingSpeed = 1.1;
        const count = 3
        for (let i = 0; i < count; ++i) {
            const angle = util.PI2 * ((i / count) + 1 / (count * 2))
            const sizeRatio = 20 / 50;
            const widthRatio = 1;
            const offsetRatio = 45 / 50;
            const size = this.physicsData.values.size;
            const pronounce = new ObjectEntity(this.game)
            pronounce.setParent(this);
            pronounce.relationsData.values.owner = this;
            pronounce.relationsData.values.team = this.relationsData.values.team

            pronounce.physicsData.values.size = sizeRatio * size;
            pronounce.physicsData.values.width = widthRatio * size;
            pronounce.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * offsetRatio;
            pronounce.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * offsetRatio;
            pronounce.positionData.values.angle = Math.PI + angle;

            pronounce.styleData.values.color = Color.Border;
            pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
            pronounce.physicsData.values.sides = 2;

            pronounce.tick = () => {
                const size = this.physicsData.values.size;

                pronounce.physicsData.size = sizeRatio * size;
                pronounce.physicsData.width = widthRatio * size;
                pronounce.positionData.y = this.physicsData.values.size * Math.sin(angle) * offsetRatio;
                pronounce.positionData.x = this.physicsData.values.size * Math.cos(angle) * offsetRatio;
            }
        }
    }

    tick(tick: number) {
        if(this.styleData.opacity >= 0.75){
            this.targettingSpeed += 3 - this.targettingSpeed * 0.05
            this.targettingSpeed = util.constrain(this.targettingSpeed, 0, 3)
        }else{
            this.targettingSpeed = 0.2
        }
        if (this.ai.state === AIState.hasTarget) {
            this.styleData.opacity += 0.1
            this.damageReduction = 1
        } else {
            this.damageReduction = 0.1
            this.styleData.opacity -= 0.025
        }
            
        this.styleData.opacity = util.constrain(this.styleData.values.opacity, 1, 1);
        super.tick(tick);
    }
}
