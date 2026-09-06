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

import { InputFlags } from "../../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../../Const/TankDefinitions";
import { CameraEntity } from "../../../../Native/Camera";
import { Inputs } from "../../../AI";
import Barrel from "../../Barrel";
import { BarrelBase } from "../../TankBody";
import Bullet from "../Bullet";
import RocketBase from "../RocketBase";
import Missile from "./Missile";



/**
 * Barrel definition for the launcher flank missile's flank barrel.
 */
const FlankMissileBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 85,
    width: 33.6 * 1.08 * 1.138351789691479,
    delay: 0.5,
    reload: 1,
    nonRandomRecoil: true,
    recoil: 1,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    forceFire: true,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.5,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.5,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Represents all deployer's flank missiles in game.
 */
export default class FlankMissile extends Missile {
    /** The missile's flank barrel */
    private flankBarrel: Barrel;


    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        

        const missileBarrel = this.flankBarrel = new Barrel(this, {...FlankMissileBarrelDefinition});
        missileBarrel.styleData.values.color = this.styleData.values.color;
    }
}
