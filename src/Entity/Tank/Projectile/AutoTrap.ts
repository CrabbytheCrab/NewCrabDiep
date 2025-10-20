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
import { Inputs } from "../../AI";
import { InputFlags, Tank } from "../../../Const/Enums";
import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import {BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { BarrelBase } from "../TankBody";
import { DevTank } from "../../../Const/DevTankDefinitions";
import AutoTurret from "../AutoTurret";
import { Entity } from "../../../Native/Entity";
import { normalizeAngle } from "../../../util";
import Trap from "./Trap";
import { CameraEntity } from "../../../Native/Camera";
/**
 * The auto trap class represents the auto trap (projectile) entity in crab diep.
 */
/**
 * Barrel definition for the auto trap's auto cannon barrel.
 */
const EngineerTurretDefinition: BarrelDefinition = {
        angle: 0,
        offset: 0,
        size: 65,
        width: 33.6,
        delay: 0.01,
        reload: 1.75,
        recoil: 0,
        isTrapezoid: false,
        trapezoidDirection: 0,
        addon: null,
        bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 0.65,
        damage: 0.5,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.75,
        absorbtionFactor: 1
    }
};

export default class AutoTrap extends Trap implements BarrelBase {

    /** The camera entity (used as team) of the rocket. */
    public cameraEntity: CameraEntity;
    /** The reload time of the traps's auto cannon barrel. */
    public reloadTime = 15;
    /** The inputs for when to shoot or not. (Rocket) */
    public inputs = new Inputs();

    public autoTurret: AutoTurret;

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number, turretDefinition: BarrelDefinition[] | BarrelDefinition = EngineerTurretDefinition) {
        super(barrel, tank, tankDefinition, shootAngle);
        
        this.cameraEntity = tank.cameraEntity;
        this.reloadTime = tank.reloadTime;
        const bulletDefinition = barrel.definition.bullet;

        this.autoTurret = new AutoTurret(this, turretDefinition, 25 * (bulletDefinition.generalMultiplier ?? 1.25));
        this.autoTurret.reloadTime = tank.reloadTime;
        this.autoTurret.ai.viewRange = bulletDefinition.aiRange ?? 900;
        this.autoTurret.positionData.values.angle = this.positionData.angle;
        this.autoTurret.styleData.values.flags |= StyleFlags.showsAboveParent;
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    public tick(tick: number) {
        this.reloadTime = this.tank.reloadTime;
        super.tick(tick);
    }
}
