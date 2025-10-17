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

import { HealthFlags, PhysicsFlags, Stat, StyleFlags } from "../../../Const/Enums";
import { TankDefinition } from "../../../Const/TankDefinitions";
import { BarrelBase } from "../TankBody";
import { DevTank } from "../../../Const/DevTankDefinitions";
import { PI2 } from "../../../util";
import LivingEntity from "../../Live";
import ObjectEntity, { DeletionAnimation } from "../../Object";

/**
 * The explosion class represents the explosion (projectile) entity in diep.
 */
/**
 * The animator for how entities delete (the opacity and size fade out).
 */
class ExplosiveDeletionAnimation extends DeletionAnimation {
    /** The current frame of the deletion animation. */
    public frame = 8;

    public constructor(entity: ObjectEntity) {
        super(entity);
    }

    /** Animates the death animation. Called by the owner's internal tick. */
    public tick() {
        if (this.frame === -1) throw new Error("Animation failed. Entity should be gone by now");

        switch (this.frame) {
            case 0: {
                this.entity.destroy(false);
                this.frame = -1;
                return;
            }
            case 8:
                this.entity.styleData.opacity = 1 - (1 / 9);
                this.entity.physicsData.size = this.entity.physicsData.size/2
                this.entity.physicsData.size /= (1 + ((this.frame * 2)/50))
            default:
                this.entity.physicsData.size *= (1 + ((this.frame * 2)/50));
                this.entity.physicsData.width *= (1 + ((this.frame * 2)/50));
                this.entity.styleData.opacity -= 1 / 9;
                if (this.entity.styleData.values.opacity < 0) this.entity.styleData.opacity = 0;
                break;
        }

        this.frame -= 1;
    }
}

export default class Explosion extends Bullet {
    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        const bulletDefinition = barrel.definition.bullet;
        const statLevels = tank.cameraEntity.cameraData?.values.statLevels.values;
        const bulletDamage = statLevels ? statLevels[Stat.BulletDamage] : 0;
        const bulletPenetration = statLevels ? statLevels[Stat.BulletPenetration] : 0;
        this.minDamageMultiplier = 0; // It shouldn't take damage
        this.damageReduction = 0
        this.baseSpeed = 0;
        this.baseAccel = 0;
        this.lifeLength = 0
        this.physicsData.values.absorbtionFactor = 0;
        this.physicsData.values.size *= 1 + (0.075 * bulletPenetration + -0.325);
        this.physicsData.values.pushFactor = ((7 / 3) + bulletDamage) * bulletDefinition.damage;
    }

    public tick(tick: number) {
        if(!this.deletionAnimation) {
            const collidedEntities = this.findCollisions();

            for (let i = 0; i < collidedEntities.length; ++i) {
                if (!(collidedEntities[i] instanceof Object)) continue;

                collidedEntities[i].receiveKnockback(this);
                
                if (!(collidedEntities[i] instanceof LivingEntity)) continue;

                if (collidedEntities[i].relationsData.values.team !== this.relationsData.values.team) {
                    LivingEntity.applyDamage(collidedEntities[i] as LivingEntity, this);
                }
            }
        }
        this.destroy()
       if(this.deletionAnimation)super.tick(tick);
    }
    public destroy(animate=true) {
        if(!this.deletionAnimation)this.deletionAnimation = new  ExplosiveDeletionAnimation(this);
        super.destroy(animate);
    }
}
