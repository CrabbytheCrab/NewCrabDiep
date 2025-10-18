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
 * Definitions (stats and data) of the barrels on the Protective Sentry
 */
const ProtectiveSentryDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 65,
    width: 42,
    delay: 0,
    reload: 0.15,
    recoil: 1,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio:1,
        health: 1,
        damage: 1,
        speed: 0.5,
        scatterRate: 3,
        lifeLength: 0.5,
        absorbtionFactor: 1
    }
};
const ProtectiveSentryDefinition2: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 100,
    width: 42,
    delay: 0,
    reload: 2,
    recoil: 1,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 6,
        damage: 2,
        speed: 1.5,
        scatterRate: 0,
        lifeLength: 1.25,
        absorbtionFactor: 1
    }
};
/**
 * Protective Sentry entity class.
 */
export default class ProtectiveSentry extends Sentry {

    public constructor(game: GameServer) {
        super(game);
        this.nameData.values.name = "Protective Sentry";
        this.barrels = [new Barrel(this, ProtectiveSentryDefinition),  new Barrel(this, ProtectiveSentryDefinition2)];
    }
}
