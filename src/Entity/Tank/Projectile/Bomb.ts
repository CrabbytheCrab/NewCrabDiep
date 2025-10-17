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

import { PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { BarrelBase } from "../TankBody";
import { DevTank } from "../../../Const/DevTankDefinitions";
import { PI2 } from "../../../util";
import Trap from "./Trap";
import ObjectEntity from "../../Object";
import Particle, { ParticleState } from "../../Misc/Particle";
import Explosion from "./Explosion";
import { CameraEntity } from "../../../Native/Camera";
import { Inputs } from "../../AI";

/**
 * The bomb class represents the bomb (projectile) entity in diep.
 */
export default class Bomb extends Trap implements BarrelBase  {
    /** The camera entity (used as team) of the rocket. */
    public cameraEntity: CameraEntity;
    /** The reload time of the rocket's barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. (Rocket) */
    public inputs = new Inputs();
    /** An addon to make it more like a bomb*/
    public bombAddon: ObjectEntity
    /** The tick when a particle will spawn*/
    public particleTick: number
    /** The time it takes inbetween particles*/
    public particleTime = 5;
    /** If the proejctile has went off or not*/
    public exploded = false;
    /** How the proejctile should rotate*/
    public spinning = true;
    public direction = (Math.random() < .5 ? -1 : 1);
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
            damage: 3.5,
            speed: 0,
            scatterRate: 0,
            lifeLength: 0,
            sizeRatio: 5,
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

        this.bombAddon = new ObjectEntity(this.game)
        this.bombAddon.setParent(this);
        this.bombAddon.relationsData.values.team = this.relationsData.values.team;
        this.bombAddon.relationsData.values.owner = this.relationsData.values.owner;
        this.bombAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.bombAddon.styleData.values.color = this.styleData.values.color;

        this.bombAddon.physicsData.values.sides = 2;
        this.bombAddon.physicsData.values.width = this.physicsData.values.size  * 1.1;
        this.bombAddon.physicsData.values.size = this.physicsData.values.size * (42.5 / 50);
        this.bombAddon.positionData.values.x = (this.physicsData.values.size + this.bombAddon.physicsData.values.size) / 2;
        this.particleTick = this.game.tick + this.particleTime;
    }
    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }
    public tick(tick: number) {
        this.bombAddon.physicsData.width = this.physicsData.values.size * 1.1;
        this.bombAddon.physicsData.size = this.physicsData.values.size * (42.5 / 50);
        this.bombAddon.positionData.x = (this.physicsData.values.size + this.bombAddon.physicsData.values.size) / 2;
        if (!this.deletionAnimation && this.particleTick <= tick) {
            const SpreadAngle = (Math.PI / 180) * (Math.random() - .5) * 30;
            this.particleTick = this.game.tick + this.particleTime;
                const particle = new Particle(this, this.positionData.values.angle + SpreadAngle, 25 * this.sizeFactor, this.tank.styleData.color, 0, 30, 10, 0.3);
                particle.sizeTime = 3
                particle.sizeDelay = 7
                particle.state = ParticleState.Shrink
                this.styleData.zIndex = this.bombAddon.game.entities.zIndex++;
                const {x, y} = this.getWorldPosition();
                particle.positionData.values.x = x + (Math.cos(this.positionData.values.angle) * this.bombAddon.physicsData.values.size) - Math.sin(this.positionData.values.angle) * this.sizeFactor + Math.cos(this.positionData.values.angle);
                particle.positionData.values.y = y + (Math.sin(this.positionData.values.angle) * this.bombAddon.physicsData.values.size ) + Math.cos(this.positionData.values.angle) * this.sizeFactor + Math.sin(this.positionData.values.angle);
        }
        super.tick(tick);
        if(this.spinning && tick > this.spawnTick + 2) {
            this.positionData.angle += (Math.min(1, this.velocity.magnitude/50) * this.direction);
            if(this.velocity.magnitude <= 1) this.spinning = false;
        }
    }
    public destroy(animate=true) {
        if(!this.exploded) {
            this.exploded = true;
            this.explode()
            this.styleData.zIndex = this.bombAddon.game.entities.zIndex++;
            this.delete();
        }
        super.destroy(animate);
    }
    public explode(){
        let barrel = new Barrel(this, this.ExplosionBarrelDefinition);
        let boom = new Explosion(barrel, this.tank, this.tankDefinition, 0)
        barrel.delete();
        const {x, y} = this.getWorldPosition();
        boom.positionData.values.x = x;
        boom.positionData.values.y = y;
    }
}
