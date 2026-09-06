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

import { HealthFlags, PhysicsFlags, Stat, StyleFlags } from "../../Const/Enums";
import { TankDefinition } from "../../Const/TankDefinitions";
import LivingEntity from "../Live";
import ObjectEntity, { DeletionAnimation } from "../Object";
import Barrel from "./Barrel";
import Bullet from "./Projectile/Bullet";
import { BarrelBase } from "./TankBody";
import * as util from "../../util";



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
                //this.entity.physicsData.size = this.entity.physicsData.size/2
                //this.entity.physicsData.size /= (1 + ((this.frame * 2)/50))
            default:
                //this.entity.physicsData.size *= (1 + ((this.frame * 2)/50));
                //this.entity.physicsData.width *= (1 + ((this.frame * 2)/50));
                this.entity.styleData.opacity -= 1 / 9;
                if (this.entity.styleData.values.opacity < 0) this.entity.styleData.opacity = 0;
                break;
        }

        this.frame -= 1;
    }
}

export default class Explosion extends LivingEntity {
    /** Whether or not two objects are touching */
    public static isCollidingExplosion(objA: ObjectEntity, objB: ObjectEntity): boolean {
        if (objA === objB) return false;
        if (!objA.isPhysical || !objB.isPhysical) return false;
        const physicsA = objA.physicsData.values;
        const physicsB = objB.physicsData.values;
        const relationsA = objA.relationsData.values;
        const relationsB = objB.relationsData.values;
        const positionA = objA.positionData.values;
        const positionB = objB.positionData.values;

        // Entities with 0 sides do not collide
        if (physicsA.sides === 0) return false;
        if (physicsB.sides === 0) return false;

        // Entities that are actively deleting do not collide
        if (objA.deletionAnimation) return false;
        if (objB.deletionAnimation) return false;

        // Team and owner based collision rules
        if (relationsA.team === relationsB.team) {
            if (
                (physicsA.flags & PhysicsFlags.noOwnTeamCollision) ||
                (physicsB.flags & PhysicsFlags.noOwnTeamCollision)
            ) {
                return false;
            }
            if (relationsA.owner !== relationsB.owner && relationsA.owner !== objB) {
                if (
                    (physicsA.flags & PhysicsFlags.onlySameOwnerCollision) ||
                    (physicsB.flags & PhysicsFlags.onlySameOwnerCollision)
                )  {
                    return false;
                }

                
            }
        }
        
        // Bases do not collide with shapes and etc
        if (
            relationsB.team === objB.game.arena &&
            (physicsA.flags & PhysicsFlags.isBase)
        ) {
            return false;
        }
        const isARect = physicsA.sides === 2;
        const isBRect = physicsB.sides === 2;

        if (isARect && isBRect) {
            // in Diep.io source code, rectangles do not support collisions with other rectangles
            // uncomment the following code to enable rect on rect collisions
            // TODO: Implement this properly for all rectangles
            return false;
        } else if (isARect && !isBRect) {
            // TODO: Check if this supports rotated rectangles properly
            const dX = util.constrain(positionB.x, positionA.x - physicsA.size / 2, positionA.x + physicsA.size / 2) - positionB.x;
            const dY = util.constrain(positionB.y, positionA.y - physicsA.width / 2, positionA.y + physicsA.width / 2) - positionB.y;

            return dX*dX + dY*dY <= physicsB.size*physicsB.size
        } else if (physicsB.sides === 2 && physicsA.sides !== 2) {
            // TODO: Check if this supports rotated rectangles properly
            const dX = util.constrain(positionA.x, positionB.x - physicsB.size / 2, positionB.x + physicsB.size / 2) - positionA.x;
            const dY = util.constrain(positionA.y, positionB.y - physicsB.width / 2, positionB.y + physicsB.width / 2) - positionA.y;

            return dX*dX + dY*dY <= physicsA.size*physicsA.size;
        } else {
            const dX = positionA.x - positionB.x;
            const dY = positionA.y - positionB.y;
            const rSum = physicsA.size + physicsB.size;

            return dX*dX + dY*dY <= rSum*rSum;
        }
    }

    /** Applies damage to two entity after colliding with eachother. */
    public static handleCollisionExplosion(explosion: Explosion, entity: LivingEntity) {
        if (explosion.relationsData.values.team && explosion.relationsData.values.team === entity.relationsData.values.team) return;

        if (explosion.healthData.values.health <= 0 || entity.healthData.values.health <= 0) return;
        if (explosion.damagedEntities.includes(entity) || entity.damagedEntities.includes(explosion)) return;
        if (explosion.damageReduction === 0 && entity.damageReduction === 0) return;
        if (explosion.damagePerTick === 0 && explosion.physicsData.values.pushFactor === 0 || entity.damagePerTick === 0 && entity.physicsData.values.pushFactor === 0) return;

        const fallOffPoint = (explosion.physicsData.size * explosion.fallOffPoint) ** 2;
        let fallOffMult = 1;
        const dist = (entity.positionData.x - explosion.positionData.x) ** 2 + (entity.positionData.y - explosion.positionData.y) ** 2;;

        if (dist > fallOffPoint) {
            const DistSquared = Math.sqrt(dist);
            fallOffMult = Math.max(0.2, 1 - ((DistSquared - (explosion.physicsData.size * explosion.fallOffPoint))/(explosion.physicsData.size) * 1.5))
        }
        let common = Math.max(entity.minDamageMultiplier, explosion.minDamageMultiplier);
        common *= Math.min(entity.maxDamageMultiplier, explosion.maxDamageMultiplier);
        const dF1 = (explosion.damagePerTick * common * fallOffMult) * entity.damageReduction;
        const dF2 = (entity.damagePerTick * common) * explosion.damageReduction;
        // Damage can't be more than enough to kill health
        const ratio = Math.max(1 - explosion.healthData.values.health / dF2, 1 - entity.healthData.values.health / dF1)
        const damage1to2 = dF1 * Math.min(1, 1 - ratio);
        
        entity.receiveDamage(explosion, damage1to2);
    }

    /** The tank who caused the explosion. */
    protected tank: BarrelBase;

    protected fallOffPoint = 0.5;

    public constructor(spawner: ObjectEntity, tank: BarrelBase, baseDamage: number, baseSize: number) {
        super(tank.game);

        this.tank = tank

        this.styleData.values.color = tank.rootParent.styleData.values.color;
        this.styleData.values.flags |= StyleFlags.hasNoDmgIndicator;
        this.healthData.values.flags = HealthFlags.hiddenHealthbar;
        this.physicsData.values.sides = 1;
        const statLevels = tank.cameraEntity.cameraData?.values.statLevels.values;
        const bulletDamage = statLevels ? statLevels[Stat.BulletDamage] : 0;
        const bulletPenetration = statLevels ? statLevels[Stat.BulletPenetration] : 0;
        this.minDamageMultiplier = 0; // It shouldn't take damage
        this.damageReduction = 0;
        this.maxDamageMultiplier = 1;
        this.physicsData.values.absorbtionFactor = 0;
        this.physicsData.values.size = baseSize * (1 + (0.1 * bulletPenetration));
        this.physicsData.values.pushFactor = ((7 / 3) + bulletDamage) * baseDamage;
        this.damagePerTick = (7 + bulletDamage * 3) * bulletDamage;
        this.relationsData.values.team = tank.relationsData.values.team;
        this.relationsData.values.owner = tank;
        this.healthData.values.health = this.healthData.values.maxHealth = 300;
        this.physicsData.values.flags |= PhysicsFlags.canEscapeArena | PhysicsFlags.onlySameOwnerCollision;

        const {x, y} = spawner.getWorldPosition();
        this.positionData.values.x = x;
        this.positionData.values.y = y;
    }
    
    /** Extends LivingEntity.onKill - passes kill to the owner. */
    public onKill(killedEntity: LivingEntity) {
        (this.tank as unknown as LivingEntity)?.onKill?.(killedEntity);
    }

    public tick(tick: number) {
        if(!this.deletionAnimation) {
            const entities = this.game.entities.collisionManager.retrieve(
                this.positionData.values.x, this.positionData.values.y,
                this.physicsData.size, this.physicsData.size
            );


            for (let i = 0; i < entities.data.length; ++i) {
                let chunk = entities.data[i];

                while (chunk) {
                    const bitValue = chunk & -chunk;
                    const bitIdx = 31 - Math.clz32(bitValue);
                    chunk ^= bitValue;
                    const id = 32 * i + bitIdx;

                    const entity = this.game.entities.inner[id] as ObjectEntity;
                    if (!entity || entity.hash === 0) continue;

                    if (Explosion.isCollidingExplosion(this, entity)) {
                        if (entity.relationsData.values.owner === this.relationsData.values.owner || entity == this.relationsData.owner) {
                            entity.receiveKnockback(this);
                        }
                        if (entity.relationsData.values.team !== this.relationsData.values.team) {
                            entity.receiveKnockback(this);
                            Explosion.handleCollisionExplosion(this, entity as LivingEntity);
                        }
                    }
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
