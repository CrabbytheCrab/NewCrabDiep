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


/**
 * Barrel definition for the rocketeer rocket's barrel.
 */
const RocketBarrelDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 70,
    width: 72 * 0.6454454647550687,
    delay: 0,
    reload: 0.15,
    recoil: 3.3,
    nonRandomRecoil: true,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.3,
        damage: 3 / 5,
        speed: 1.5,
        scatterRate: 5,
        lifeLength: 0.1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Represents all rocketeer rockets in game.
 */
export default class Rocket extends RocketBase {
    /** The rocket's barrel */
    private rocketBarrel: Barrel;




    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        
        const rocketBarrel = this.rocketBarrel = new Barrel(this, {...RocketBarrelDefinition});
        rocketBarrel.styleData.values.color = this.styleData.values.color;
    }
}
