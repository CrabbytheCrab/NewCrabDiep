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
    size: 95,
    width: 71.4,
    delay: 0,
    reload: 4,
    recoil: 10,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.8,
        damage: 1.2,
        speed: 0.6,
        scatterRate: 1,
        lifeLength: 0.8,
        sizeRatio: 1,
        absorbtionFactor: 0.1
    }
};

/**
 * Represents all Manu Minions in game.
 */
export default class DestroyerMinion extends Minion {

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        this.noRotate = true;
        this.minionBarrel.delete();
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition);
        this.ai.viewRange *= 1.25
    }
}
