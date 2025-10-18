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
 * Represents all auto smasher bullets in game.
 */
export default class ReloadBullet extends Bullet{

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        const statLevels = tank.cameraEntity.cameraData?.values.statLevels.values;
        const bulletReload = statLevels ? statLevels[Stat.Reload] : 0;
        const bulletDefinition = barrel.definition.bullet;

        this.physicsData.values.pushFactor = ((7 / 3) + bulletReload) * bulletDefinition.damage * bulletDefinition.absorbtionFactor;

        this.healthData.values.health = this.healthData.values.maxHealth = (1.5 * bulletReload + 2) * bulletDefinition.health;
        this.damagePerTick = (7 + bulletReload * 3) * bulletDefinition.damage;
    }
}
