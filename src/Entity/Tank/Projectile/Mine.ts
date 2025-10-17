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

import { Color, PhysicsFlags, PositionFlags, StyleFlags, Tank } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import TankBody, { BarrelBase } from "../TankBody";
import { DevTank } from "../../../Const/DevTankDefinitions";
import { constrain, PI2 } from "../../../util";
import Trap from "./Trap";
import ObjectEntity from "../../Object";
import Particle, { ParticleState } from "../../Misc/Particle";
import Explosion from "./Explosion";
import { CameraEntity } from "../../../Native/Camera";
import { Inputs } from "../../AI";
import LivingEntity from "../../Live";
import Dominator from "../../Misc/Dominator";
import AbstractShape from "../../Shape/AbstractShape";
import AbstractBoss from "../../Boss/AbstractBoss";

/**
 * The mine class represents the mine (projectile) entity in diep.
 */
export default class Mine extends Trap implements BarrelBase  {
    /** The camera entity (used as team) of the rocket. */
    public cameraEntity: CameraEntity;
    /** The reload time of the rocket's barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. (Rocket) */
    public inputs = new Inputs();
    /** An addon to make it more like a mine*/
    public mineAddon: ObjectEntity
    /** If the mine is ready to explode*/
    public primed = false;
    public viewRange = 400;
    public ExplosionBarrelDefinition: BarrelDefinition = {
        angle: 0,
        offset: 0,
        size: 70,
        width: 100,
        delay: 0.5,
        reload: 0.75,
        nonRandomRecoil: true,
        recoil: 0,
        isTrapezoid: false,
        trapezoidDirection: 0,
        addon: null,
        forceFire: true,
        bullet: {
            type: "drone",
            health: 1,
            damage: 12,
            speed: 0,
            scatterRate: 0,
            lifeLength: 0,
            sizeRatio: 12,
            absorbtionFactor: 1
        }
    };
    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        this.cameraEntity = tank.cameraEntity;
        const bulletDefinition = barrel.definition.bullet;
        this.physicsData.values.sides = bulletDefinition.sides ?? 1;
        this.styleData.values.flags ^= StyleFlags.isStar;
        this.bouncetrap = true

        this.mineAddon = new ObjectEntity(this.game)
        this.mineAddon.setParent(this);
        this.mineAddon.relationsData.values.team = this.relationsData.values.team;
        this.mineAddon.relationsData.values.owner = this.relationsData.values.owner;
        this.mineAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        //this.mineAddon.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.mineAddon.positionData.values.flags |= PositionFlags.absoluteRotation;

        this.mineAddon.styleData.values.color = this.styleData.values.color;
        this.styleData.color = Color.Border;
        this.mineAddon.physicsData.values.sides = 1;
        this.mineAddon.physicsData.values.size = this.physicsData.values.size * (70 / 50);
        this.collisionEnd = 60;
    }
    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }
    public tick(tick: number) {
        this.mineAddon.physicsData.size = this.physicsData.values.size * (70 / 50);
        if (tick - this.spawnTick === this.collisionEnd) {
            this.primed = true
            this.styleData.color = Color.EnemyTriangle;
        }
        if(this.primed){
            this.physicsData.pushFactor = 0
            this.physicsData.absorbtionFactor = 0
            this.minDamageMultiplier = 0.05;
            if(this.nearByTank(tick))this.styleData.opacity += 0.035;
            this.styleData.opacity -= 0.02;
            this.styleData.opacity = constrain(this.styleData.values.opacity, 0, 1)
            const collidedEntities = this.findCollisions();

            for (let i = 0; i < collidedEntities.length; ++i) {
                if (!((collidedEntities[i] instanceof TankBody) || (collidedEntities[i] instanceof AbstractShape) || (collidedEntities[i] instanceof AbstractBoss))) continue;
                this.explode()
                return
            }
        }
        //this.mineAddon.styleData.opacity = this.styleData.opacity;
        super.tick(tick);
    }
    public nearByTank(tick: number) {
        const team = this.relationsData.values.team;
        const entities = this.game.entities.collisionManager.retrieve(this.positionData.values.x, this.positionData.values.y, this.viewRange, this.viewRange);
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
                
            if (!entity) continue;

            if (!entity.positionData || !entity.relationsData || !entity.physicsData || !(entity as ObjectEntity).velocity) continue;
                
            if (entity.relationsData.values.team === team) continue; // Check if target is own team

            if (entity instanceof TankBody) {
                const distSq = (entity.positionData.values.x - this.positionData.x) ** 2 + (entity.positionData.values.y - this.positionData.y) ** 2;
                if (distSq < this.viewRange ** 2) {
                    return true
                }
            }
            continue;
        }
        return false;
    }

    public explode(){
        let barrel = new Barrel(this, this.ExplosionBarrelDefinition);
        let boom = new Explosion(barrel, this.tank, this.tankDefinition, 0)
        barrel.delete();
        const {x, y} = this.getWorldPosition();
        boom.positionData.values.x = x;
        boom.positionData.values.y = y;
        this.delete();
    }
}
