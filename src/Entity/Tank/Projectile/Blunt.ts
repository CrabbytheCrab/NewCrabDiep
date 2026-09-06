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

import { Color, InputFlags, PhysicsFlags, PositionFlags, Stat, StyleFlags, Tank } from "../../../Const/Enums";
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
import ObjectEntity from "../../Object";

/**
 * Represents all blunt bullets in game.
 */
export default class Blunt extends Bullet implements BarrelBase{
    /** The size ratio of the blunt. */
    public sizeFactor: number;
    /** The camera entity (used as team) of the blunt. */
    public cameraEntity: CameraEntity;
    /** The reload time of the blunt's barrel. */
    public reloadTime = 15;
    public deff: boolean
    /** The inputs for when to shoot or not. (blunt) */
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
    
        this.physicsData.pushFactor = ((7 / 3) + bulletDamage) * bulletDefinition.damage/bulletDefinition.absorbtionFactor;

        if(this.styleData.flags & StyleFlags.isVisible) this.styleData.flags ^= StyleFlags.isVisible;
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this);
        body2.relationsData.values.owner = this;
        body2.relationsData.values.team = this.relationsData.values.team;

        body2.physicsData.values.size = this.physicsData.size;

        body2.styleData.values.color = Color.Border;
        body2.physicsData.values.sides = 1;
        body2.physicsData.values.sides = 1;
        body2.styleData.values.borderWidth = 7.5 * 2 * Math.SQRT2
        body2.tick = () => {
            body2.physicsData.size = this.physicsData.size;
            body2.styleData.values.borderWidth = 7.5 * 2 * Math.SQRT2
        }
        const body = new ObjectEntity(this.game);

        body.setParent(this);
        body.relationsData.values.owner = this;
        body.relationsData.values.team = this.relationsData.values.team;

        body.physicsData.values.size = this.physicsData.size;

        body.styleData.values.color = this.styleData.values.color;
        body.physicsData.values.sides = 1;
        body.tick = () => {
            body.physicsData.size = this.physicsData.size;
        }

    }
}
