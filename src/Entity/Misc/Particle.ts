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

import { PhysicsFlags, PositionFlags, StyleFlags, HealthFlags, Stat, Color } from "../../Const/Enums";
import { EntityStateFlags } from "../../Native/Entity";
import ObjectEntity from "../Object";

/**
 * The particle class represents the particleentity in diep.
 */
/**
 * Used for simplifying the type of particle.
 * - `growth`: Particle grows over time
 * - `shrink`: Particle shrinks over time
 */
export const enum ParticleState {
    Normal = 0,
    Growth = 1,
    Shrink = 2
}
export default class Particle extends ObjectEntity {
    /** The tick this entity was created in. */
    protected spawnTick = 0;
    /** Speed the bullet will accelerate at. */
    protected baseAccel = 0;
    /** Starting velocity of the bullet. */
    protected baseSpeed = 0;
    /** Percent of accel applied when dying. */
    protected deathAccelFactor = 0.5;
    /** Life length in ticks before the bullet dies. */
    protected lifeLength = 0;
    /** Angle the projectile is shot at. */
    protected movementAngle = 0;
    /** Whether or not to use .shootAngle or .position.angle. */
    protected usePosAngle = false;
    /** The object who shot the particle. */
    protected spawner: ObjectEntity;
    /** The state of the particle. */
    public state = ParticleState.Normal;
    /** The scaling for the particle. */
    public sizeMult: number;
    /** The size the particle wants to be*/
    public sizeToScaleTo: number;
    /** The amount of ticks it takes for the particle to become this size*/
    public sizeTime: number;
    /** The amount of ticks it takes for the particle starts to grow*/
    public sizeDelay: number;

    public constructor(spawner : ObjectEntity, shootAngle: number,particleSize: number, particleColor: Color, baseAccel = 20, baseSpeed = 50, lifeLength = 75, sizeMult = 1, sizeDelay = 0) {
        super(spawner.game);

        this.spawner = spawner;
        

        this.movementAngle = shootAngle;
        this.spawnTick = spawner.game.tick;
        this.sizeMult = sizeMult
        this.relationsData.values.owner = spawner;

        this.relationsData.values.team = spawner.relationsData.values.team;
        this.relationsData.values.owner = spawner;

        this.physicsData.values.sides =  1;
        this.physicsData.values.flags |= PhysicsFlags.noOwnTeamCollision | PhysicsFlags.canEscapeArena;
        this.positionData.values.flags |= PositionFlags.canMoveThroughWalls;
        this.physicsData.values.size = particleSize;
        this.styleData.values.color = particleColor;
        this.styleData.values.flags |= StyleFlags.hasNoDmgIndicator;

        this.physicsData.values.absorbtionFactor = 0;
        this.physicsData.values.pushFactor = 0;

        this.baseAccel = baseAccel;
        this.baseSpeed = baseSpeed;

        this.sizeToScaleTo = this.physicsData.values.size * this.sizeMult;
        this.sizeTime = lifeLength;
        this.sizeDelay = this.game.tick + sizeDelay;

        this.lifeLength = lifeLength;
        this.positionData.values.angle = shootAngle;
    }

    public tick(tick: number) {
        super.tick(tick);

        if (tick === this.spawnTick + 1) this.addAcceleration(this.movementAngle, this.baseSpeed);
        else this.maintainVelocity(this.usePosAngle ? this.positionData.values.angle : this.movementAngle, this.baseAccel);
        if (this.deletionAnimation) return;
        if (tick - this.spawnTick >= this.sizeDelay){
            if(this.state == ParticleState.Growth) {
                this.physicsData.size = Math.min(this.sizeToScaleTo, this.physicsData.size + ((this.sizeToScaleTo - this.physicsData.size) * 1/this.sizeTime));
            }
            if(this.state == ParticleState.Shrink) {
                this.physicsData.size = Math.max(this.sizeToScaleTo, this.physicsData.size + ((this.sizeToScaleTo - this.physicsData.size) * 1/this.sizeTime));
            }
        }
        if (tick - this.spawnTick >= this.lifeLength) this.destroy(true);
        // TODO(ABC):
        // This code will be reimplemented in the update that allows for easy camera entity switches
        if ((this.relationsData.values.team?.entityState || 0) & EntityStateFlags.needsDelete) this.relationsData.values.team = null
    }
}
