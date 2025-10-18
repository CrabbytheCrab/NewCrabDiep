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
 * Definitions (stats and data) of the barrels on the Beholding Sentry
 */
const BeholdingSentryDefinition: BarrelDefinition = {
    angle: 0,
    offset: 28,
    size: 75,
    width: 42 * 0.6,
    delay: 0,
    reload: 0.4,
    recoil: 0.75,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 2,
        damage: 0.5,
        speed: 1,
        scatterRate: 1,
        lifeLength: 1.5,
        absorbtionFactor: 0.6
    }
};

const BeholdingSentryDefinition2: BarrelDefinition = {
    angle: 0,
    offset: -28,
    size: 75,
    width: 42 * 0.6,
    delay: 0.5,
    reload: 0.4,
    recoil: 0.75,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 2,
        damage: 0.5,
        speed: 1,
        scatterRate: 1,
        lifeLength: 1.5,
        absorbtionFactor: 0.6
    }
};

const BeholdingSentryDefinition3: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 50,
    width: 42 * 1.2,
    delay: 0,
    reload: 1,
    recoil: 1.75,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: "trapLauncher",
        bullet: {
        type: "trap",
        sizeRatio:0.8,
        health: 8,
        damage: 3,
        speed: 2,
        scatterRate: 1,
        lifeLength: 4,
        absorbtionFactor: 0.8
    }
};


/**
 * Beholding Sentry entity class.
 */
export default class BeholdingSentry extends Sentry {

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = "Beholding Sentry";
        this.barrels = [new Barrel(this, BeholdingSentryDefinition),  new Barrel(this, BeholdingSentryDefinition2), new Barrel(this, BeholdingSentryDefinition3)];
    }
}
