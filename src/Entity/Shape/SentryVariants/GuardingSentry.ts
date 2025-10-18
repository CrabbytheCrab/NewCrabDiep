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
import { PositionFlags } from "../../../Const/Enums";
import GameServer from "../../../Game";
import { AI, AIState } from "../../AI";
import AbstractShape from "../AbstractShape";
import { Sentry } from "../Sentry";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import Barrel from "../../Tank/Barrel";

/**
 * Definitions (stats and data) of the drone spawner on the Gaurding Sentry
 */
const GuardingSentryDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 55,
    width: 42,
    delay: 0,
    reload: 1,
    recoil: 0,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 60,
    canControlDrones: true,
    bullet: {
        type: "drone",
        sizeRatio: 1,
        health: 2.5,
        damage: 1.25,
        speed: 2,
        scatterRate: 0,
        lifeLength: 6,
        absorbtionFactor: 0.8
    }
};

/**
 * Guarding Sentry entity class.
 */
export default class GuardingSentry extends Sentry {

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = "Guarding Sentry";
        this.barrels = [new Barrel(this, GuardingSentryDefinition)];
    }
}
