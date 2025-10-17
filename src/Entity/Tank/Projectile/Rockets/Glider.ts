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
const GliderBarrelDefinition: BarrelDefinition = {
    // modified by `Glider { } `
    angle: Math.PI, // for barrel 0, should += Math.PI / 5; for barrel 1, should -= Math.PI / 5.
    offset: 0,
    size: 70,
    width: 37.8 * 1.138351789691479,//Unholy but it makes it very very nearly equal to 37.8 at level 45
    delay: 0.5,
    reload: 0.75,
    recoil: 4.0,
    nonRandomRecoil: true,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    forceFire: true,
    bullet: {
        type: "bullet",
        health: 0.6,
        damage: 0.6,
        speed: 0.7,
        scatterRate: 3,
        lifeLength: 0.5,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
/**
 * Represents all glider rockets in game.
 */
export default class Glider extends RocketBase {
    /** The glider's barrels */
    private gliderBarrels: Barrel[];

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        this.cameraEntity = tank.cameraEntity;

        const gliderBarrels: Barrel[] = this.gliderBarrels =[];

        const s1Definition = {...GliderBarrelDefinition};
        s1Definition.angle += Math.PI / 5
        const s1 = new Barrel (this, {...s1Definition});
        const s2Definition = {...GliderBarrelDefinition};
        s2Definition.angle -= Math.PI / 5
        const s2 = new Barrel(this, s2Definition);

        s1.styleData.values.color = this.styleData.values.color;
        s2.styleData.values.color = this.styleData.values.color;

        gliderBarrels.push(s1, s2);

        this.inputs = new Inputs();
        this.inputs.flags |= InputFlags.leftclick;
    }
}
