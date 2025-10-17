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

/** The barrels for Arsenal. */
const ArsenalBarrel1: BarrelDefinition = {
    angle: 0,
    offset: -20,
    size: 68,
    width: 25.2,
    delay: 0.01,
    reload: 2.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 0.675,
        damage: 0.4,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.75,
        absorbtionFactor: 0.1
    }
};
const ArsenalBarrel2: BarrelDefinition = {
    angle: 0,
    offset: 20,
    size: 68,
    width: 25.2,
    delay: 0.51,
    reload: 2.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 0.675,
        damage: 0.4,
        speed: 1,
        scatterRate: 1,
        lifeLength: 0.75,
        absorbtionFactor: 0.1
    }
};
export default class AutoTrap extends Trap implements BarrelBase {

    /** The camera entity (used as team) of the rocket. */
    public cameraEntity: CameraEntity;
    /** The reload time of the traps's auto cannon barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. (Rocket) */
    public inputs = new Inputs();


    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        
        this.cameraEntity = tank.cameraEntity;
        if ( tankDefinition && tankDefinition.id === Tank.Raider) {
            const turret = new AutoTurret(this, {
                angle: 0,
                offset: 0,
                size: 85,
                width: 46.2,
                delay: 0.01,
                reload: 5.5,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: null,
                bullet: {
                    type: "bullet",
                    sizeRatio: 1,
                    health: 0.8,
                    damage: 1,
                    speed: 1.3,
                    scatterRate: 0.3,
                    lifeLength: 1,
                    absorbtionFactor: 0.1
                }
            });
            turret.baseSize *= 1.425
            turret.positionData.values.angle = shootAngle
            //turret.ai.passiveRotation = this.movementAngle
            turret.styleData.values.flags |= StyleFlags.showsAboveParent;
            turret.ai.viewRange = 1500
        }
        else if (tankDefinition && tankDefinition.id === Tank.Arsenal){
                const turret  = new AutoTurret(this, ArsenalBarrel1);
                turret.turret.push(new Barrel(turret, ArsenalBarrel2))
                turret.baseSize *= 1.25
                turret.positionData.values.angle = shootAngle
                turret.turret[1].physicsData.values.flags |= PhysicsFlags.doChildrenCollision;
                turret.styleData.values.flags |= StyleFlags.showsAboveParent;
                turret.ai.viewRange = 1000
                this.bouncetrap = true
            }
        else if (tankDefinition && tankDefinition.id === Tank.Mechanic) {
            const turret = new AutoTurret(this, {
                angle: 0,
                offset: 0,
                size: 65,
                width: 33.6,
                delay: 0.01,
                reload: 2,
                recoil: 0,
                isTrapezoid: false,
                trapezoidDirection: 0,
                addon: null,
                bullet: {
                    type: "bullet",
                    sizeRatio: 1,
                    health: 0.5,
                    damage: 0.3,
                    speed: 1,
                    scatterRate: 1,
                    lifeLength: 0.75,
                    absorbtionFactor: 0.1
                }
            });
            turret.baseSize *= 1.25
            turret.positionData.values.angle = shootAngle
            //turret.ai.passiveRotation = this.movementAngle
            turret.styleData.values.flags |= StyleFlags.showsAboveParent;
            turret.ai.viewRange = 1000
        } else {
            const turret = new AutoTurret(this, {
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
                    absorbtionFactor: 0.1
                }
            });
                turret.baseSize *= 1.25
                turret.positionData.values.angle = shootAngle
            //turret.ai.passiveRotation = this.movementAngle
            turret.ai.viewRange = 1000
        }
        //this.styleData.values.flags ^= StyleFlags.isCachable;
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    public tick(tick: number) {
        this.reloadTime = this.tank.reloadTime;
        super.tick(tick);
    }
}
