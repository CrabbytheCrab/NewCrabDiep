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

import { InputFlags, Tank } from "../../../Const/Enums";
import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import {BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { Entity } from "../../../Native/Entity";
import { AI, AIState, Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";

/**
 * The drone class represents the drone (projectile) entity in diep.
 */


export default class Boomerang extends Bullet {
    /** The Boomerage orbit distance from the player for Orbiter*/
    public static ORBITING_RADIUS = 850 ** 2;
    /**  */
    public static MAX_RESTING_RADIUS = 400 ** 2;
    /** For when the Boomerage turns back to the player. */
    public turningBackSpeed: boolean = false


    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        const bulletDefinition = barrel.definition.bullet;
        this.usePosAngle = false;
        if (this.physicsData.values.flags & PhysicsFlags.noOwnTeamCollision) this.physicsData.values.flags ^= PhysicsFlags.noOwnTeamCollision;
        this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;
        this.physicsData.values.sides = bulletDefinition.sides ?? 5;
        if (this.physicsData.values.flags & PhysicsFlags.noOwnTeamCollision) this.physicsData.values.flags ^= PhysicsFlags.noOwnTeamCollision;
        this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;
        this.styleData.values.flags &= ~StyleFlags.hasNoDmgIndicator;
    }

    public tick(tick: number) {
        if (this.tankDefinition && this.tankDefinition.id === Tank.Orbiter){
            if(tick - this.spawnTick >= this.lifeLength/24) {


                const delta = {
                    x: this.positionData.values.x - this.tank.positionData.values.x,
                    y: this.positionData.values.y - this.tank.positionData.values.y
                }
                const base = this.baseAccel;
                const dist = Math.atan2(delta.y, delta.x)

                if (dist < Boomerang.ORBITING_RADIUS / 4) { // Half
                    this.movementAngle = this.positionData.values.angle + Math.PI;
                } else if (dist < Boomerang.ORBITING_RADIUS) {
                   this.movementAngle = this.positionData.values.angle;
                } else this.movementAngle = this.positionData.values.angle;
                let unitDist = (delta.x ** 2 + delta.y ** 2) / Boomerang.MAX_RESTING_RADIUS;
                const offset = Math.atan2(delta.y, delta.x) + Math.PI / 2
                delta.x = this.tank.positionData.values.x + Math.cos(offset) * this.tank.physicsData.values.size * 3 - this.positionData.values.x;
                delta.y = this.tank.positionData.values.y + Math.sin(offset) * this.tank.physicsData.values.size * 3 - this.positionData.values.y;
                this.movementAngle = Math.atan2(delta.y, delta.x);
                
                if (unitDist < 0.1){
                    //this.movementAngle = this.positionData.values.angle + Math.PI;
                    // this.baseAccel /= 3;
                //this.destroy()
            }
                    this.baseAccel = base;

            }
        } else if (this.tankDefinition && this.tankDefinition.id === Tank.Roundabout) {
            
            if(tick - this.spawnTick >= this.lifeLength/4) {
                if(this.turningBackSpeed == false){
                    this.turningBackSpeed = true
                    const delta = {
                        x: this.positionData.values.x - this.tank.positionData.values.x,
                        y: this.positionData.values.y - this.tank.positionData.values.y
                    }
                    const base = this.baseAccel;
                
                    let unitDist = (delta.x ** 2 + delta.y ** 2) / Boomerang.MAX_RESTING_RADIUS;
                    const offset = Math.atan2(delta.y, delta.x) + Math.PI / 2
                    delta.x = this.tank.positionData.values.x + Math.cos(offset) * this.tank.physicsData.values.size * 0.5 - this.positionData.values.x;
                    delta.y = this.tank.positionData.values.y + Math.sin(offset) * this.tank.physicsData.values.size * 0.5 - this.positionData.values.y;
                    this.movementAngle = Math.atan2(delta.y, delta.x);
                        this.baseAccel = base;
                this.baseAccel *= 1.5}

            }
        } else {
            
            if(tick - this.spawnTick >= this.lifeLength/8) {
                if(this.turningBackSpeed == false) {
                    this.turningBackSpeed = true
                this.baseSpeed *= 1.5
                }
                const delta = {
                    x: this.positionData.values.x - this.tank.positionData.values.x,
                    y: this.positionData.values.y - this.tank.positionData.values.y
                }
                const base = this.baseAccel;
            
                let unitDist = (delta.x ** 2 + delta.y ** 2) / Boomerang.MAX_RESTING_RADIUS;
                const offset = Math.atan2(delta.y, delta.x) + Math.PI / 2
                delta.x = this.tank.positionData.values.x + Math.cos(offset) * this.tank.physicsData.values.size * 0.5 - this.positionData.values.x;
                delta.y = this.tank.positionData.values.y + Math.sin(offset) * this.tank.physicsData.values.size * 0.5 - this.positionData.values.y;
                this.movementAngle = Math.atan2(delta.y, delta.x);
                if (unitDist < 0.1) { this.baseAccel /= 3;
                this.destroy()}
                    this.baseAccel = base;

            }
        }
        this.positionData.angle += 0.3
        super.tick(tick);
    }
}
