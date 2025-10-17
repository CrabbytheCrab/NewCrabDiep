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

import { BarrelDefinition, TankDefinition } from "../../../../Const/TankDefinitions";
import Barrel from "../../Barrel";
import { BarrelBase } from "../../TankBody";
import Minion from "../Minion";

const MinionBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 80,
    width: 42,
    delay: 0,
    reload: 1,
    recoil: 1.35,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.2,
        speed: 0.95,
        scatterRate: 1.2,
        lifeLength: 0.8,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Represents all Hatchery Minions in game.
 */
export default class MiniMinion extends Minion {

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        this.minionBarrel.delete();
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition);
        this.focusMult = 0.5
    }
}
