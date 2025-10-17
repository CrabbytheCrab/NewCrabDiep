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

import Barrel from "../Barrel";
import Bullet from "./Bullet";

import { InputFlags, PhysicsFlags, PositionFlags, Stat, Tank } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { Entity } from "../../../Native/Entity";
import { Inputs } from "../../AI";
import TankBody, { BarrelBase } from "../TankBody";
import { GuardObject } from "../Addons";
import MazeWall from "../../Misc/MazeWall";
import AbstractShape from "../../Shape/AbstractShape";
import AbstractBoss from "../../Boss/AbstractBoss";
import LivingEntity from "../../Live";
import * as util from "../../../util";
import { CameraEntity } from "../../../Native/Camera";

/**
 * Represents all bashers rockets in game.
 */
export default class Basher extends Bullet implements BarrelBase{
    /** The size ratio of the bashers. */
    public sizeFactor: number;
    /** The camera entity (used as team) of the bashers. */
    public cameraEntity: CameraEntity;
    /** The reload time of the bashers's barrel. */
    public reloadTime = 15;
    public deff: boolean
    /** The inputs for when to shoot or not. (bashers) */
    public inputs: Inputs;
    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.cameraEntity = tank.cameraEntity;
        this.inputs = new Inputs()
        this.sizeFactor = this.physicsData.values.size / 50;
        this.deff = false
        const bulletDefinition = barrel.definition.bullet;
        const statLevels = tank.cameraEntity.cameraData?.values.statLevels.values;
        const bulletDamage = statLevels ? statLevels[Stat.BulletDamage] : 0;
    
        new GuardObject(this.game, this, 1, 1.6, 0, .1);
        this.physicsData.pushFactor = ((7 / 3) + bulletDamage) * bulletDefinition.damage/bulletDefinition.absorbtionFactor;
    }
}
