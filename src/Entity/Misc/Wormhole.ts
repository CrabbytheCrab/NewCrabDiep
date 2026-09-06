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

import GameServer from "../../Game";
import ObjectEntity from "../Object";
import * as util from "../../util";

import { PhysicsFlags, Color, StyleFlags, Tank, PositionFlags, Stat, StatCount, CameraFlags } from "../../Const/Enums";
import LivingEntity from "../Live";
import TankBody, { BarrelBase } from "../Tank/TankBody";
import { TeamEntity } from "./TeamEntity";
import { GuardObject } from "../Tank/Addons";
import { Entity } from "../../Native/Entity";
import { Inputs } from "../AI";
import Bullet from "../Tank/Projectile/Bullet";
import AbstractShape from "../Shape/AbstractShape";
import ClientCamera from "../../Native/Camera";
import AbstractBoss from "../Boss/AbstractBoss";
import { tps } from "../../config";
import Particle, { ParticleState } from "./Particle";
import { games, gamesMap } from "../..";

// The size of a Wormhole by default
const WORMHOLE_SIZE = 150;
/**
 * The Wormhole class in.
 */
export default class Wormhole extends ObjectEntity{
    /** Life length in ticks before the Wormhole dies. */
    public lifeLength = 0;
    /** The tick this entity was created in. */
    protected spawnTick = 0;
    /** The tick this entity was created in. */
    protected pulseTick = 0;
    /** If the wormhole is shattered or not. */
    public shattered: boolean;
    /** If the wormhole is visually shattered or not. */
    public visualShattered: boolean;
    /** The spikes of a shattered wormhole.*/
    public shatteredParts: ObjectEntity[] = [];
    /** The white part of a shattered wormhole when its starting to closing. */
    public whiteShattered: ObjectEntity[] = [];
    /** If the worm hole is shattered or not. */
    public body: ObjectEntity
    /** The white part of it when its starting to closing. */
    public whiteBody: ObjectEntity
    /** If the icon for the wormhole on the map. */
    public mapicon: ObjectEntity;
    /** The game mode it will send you to. */
    public targetGameId: string | undefined;
    public players: ObjectEntity[] = [];
    public constructor(game: GameServer, shattered: boolean, visualShattered: boolean, targetGameId?: string | "sanctuary") {
        super(game);
        this.spawnTick = game.tick;
        this.lifeLength = tps * (6 + (Math.random() * 9)); //Lasts for 2-5 minutes 
        this.shattered = shattered;
        this.visualShattered = visualShattered;
        this.physicsData.values.size = WORMHOLE_SIZE;
        this.physicsData.values.sides = 1;
        this.styleData.values.color = Color.kMaxColors;
        this.physicsData.values.pushFactor = 0;
        this.physicsData.values.absorbtionFactor = 0;

        this.styleData.zIndex = 1;
        this.relationsData.values.team = this.game.arena;
        if(this.styleData.flags & StyleFlags.isVisible) this.styleData.flags ^= StyleFlags.isVisible;

        this.mapicon = new ObjectEntity(this.game);

        this.mapicon.setParent(this);
        this.mapicon.relationsData.values.owner = this;
        this.mapicon.relationsData.values.team = this.relationsData.values.team;

        this.mapicon.physicsData.values.size = this.physicsData.size;

        this.mapicon.styleData.values.color = this.styleData.values.color;
        this.mapicon.physicsData.values.size = WORMHOLE_SIZE - 50;
        this.mapicon.physicsData.values.sides = 1000;
        this.mapicon.setGlobalEntity(true);

        this.body = new ObjectEntity(this.game);

        this.body.setParent(this);
        this.body.relationsData.values.owner = this;
        this.body.relationsData.values.team = this.relationsData.values.team;

        this.body.physicsData.values.size = this.physicsData.size;

        this.body.styleData.values.color = this.styleData.values.color;
        this.body.physicsData.values.size = this.physicsData.values.size;
        this.body.physicsData.values.sides = 1;
        this.body.styleData.borderWidth = 0;

        this.whiteBody = new ObjectEntity(this.game);

        this.whiteBody.setParent(this);
        this.whiteBody.relationsData.values.owner = this;
        this.whiteBody.relationsData.values.team = this.relationsData.values.team;
        this.whiteBody.styleData.borderWidth = 0;
        this.whiteBody.physicsData.values.size = this.physicsData.size;

        this.whiteBody.styleData.values.color = Color.White;
        this.whiteBody.styleData.values.opacity = 0;
        this.whiteBody.physicsData.values.size = this.physicsData.values.size;
        this.whiteBody.physicsData.values.sides = 1;

        this.targetGameId = "sanctuary"
    }

    public tick(tick: number) {
        super.tick(tick);
        const FadePoint = this.lifeLength * 0.8;
        const entities = this.game.entities.collisionManager.retrieve(
            this.positionData.values.x, this.positionData.values.y,
            this.physicsData.size, this.physicsData.size
        );
        let size = WORMHOLE_SIZE;
        let playerAmount = 0;
        for (let i = 0; i < entities.data.length; ++i) {
            let chunk = entities.data[i];

            while (chunk) {
                const bitValue = chunk & -chunk;
                const bitIdx = 31 - Math.clz32(bitValue);
                chunk ^= bitValue;
                const id = 32 * i + bitIdx;

                const entity = this.game.entities.inner[id] as ObjectEntity;
                if (!entity || entity.hash === 0) continue;
                if (!Wormhole.isColliding(this, entity)) continue;
                if (!(entity instanceof LivingEntity)) continue; // Check if the target is living

                let kbAngle: number;
                let diffY = this.positionData.values.y - entity.positionData.values.y;
                let diffX = this.positionData.values.x - entity.positionData.values.x;
                if (diffX === 0 && diffY === 0) kbAngle = Math.random() * util.PI2;
                else kbAngle = Math.atan2(diffY, diffX);
                if ((entity instanceof TankBody)) {
                    if(entity.scoreData.score < 5000 && !this.shattered) {
                        entity.addVelocity(kbAngle, -4);
                    } else {
                        entity.addVelocity(kbAngle, 0.5);
                        playerAmount += 1;
                        size += entity.physicsData.size/(1.25 + playerAmount/4);
                    }
                } else {
                    entity.addVelocity(kbAngle, -4);
                }
            }
        }
        this.physicsData.size = this.physicsData.size + ((size - this.physicsData.size) * 0.5);
        this.whiteBody.physicsData.size = this.physicsData.size + 0.4;
        this.body.physicsData.size = this.physicsData.size;
        if (tick - this.spawnTick > FadePoint && this.whiteBody.styleData.opacity < 1) {
            this.whiteBody.styleData.opacity = util.constrain(this.whiteBody.styleData.opacity + 1/(this.lifeLength * 0.1) + (this.whiteBody.styleData.opacity)/500, 0, 1);
        }
        if (tick > this.pulseTick) {
            this.pulseTick = tick + tps * 2;
            const particle = new Particle(this, 0, this.physicsData.size, Color.White, 0, 0, tps * 10, 3);
            particle.sizeTime = tps * 3;
            particle.styleData.opacity = 0.4;
            particle.styleData.flags |= StyleFlags.renderFirst;
            switch(this.targetGameId) {
                case 'ffa': {
                    particle.styleData.color = Color.TeamRed;
                    break;
                }
                case 'teams': {
                    particle.styleData.color = Color.TeamPurple;
                    break;
                }
                case '4teams': {
                    particle.styleData.color = Color.TeamGreen;
                    break;
                }
                case 'maze': {
                    particle.styleData.color = Color.TeamBlue;
                    break;
                }
            }
            particle.sizeDelay = 0
            particle.state = ParticleState.Growth;
            const {x, y} = this.getWorldPosition();
            particle.positionData.values.x = x;
            particle.positionData.values.y = y;
            const tickParticle = particle.tick;
            particle.tick = (tick: number) => {
                particle.styleData.opacity -= 0.2/particle.sizeTime;
                tickParticle.call(particle, tick);
                if(particle.styleData.opacity <= 0) particle.delete();
            }
        }
        if(tick % 3 == 0) {
            const Angle = util.PI2 * Math.random(); 
            const particle = new Particle(this, Angle, 30 + (Math.random() * 40), Color.White, 20 + Math.random() * 10, 5 + Math.random() * 25, 5 + Math.random() * 15, 1);
            const {x, y} = this.getWorldPosition();
            const Rng = (Math.random()/2) + 0.5;
            particle.positionData.values.x = x + Math.cos(Angle) * this.physicsData.size * Rng;
            particle.positionData.values.y = y + Math.sin(Angle) * this.physicsData.size * Rng;
            particle.styleData.zIndex = this.styleData.zIndex - 1;
        }
        if (tick - this.spawnTick >= this.lifeLength) this.destroy(true);
    }

    public destroy(animate = true) {
        if(!this.deletionAnimation){ 
            const entities = this.game.entities.collisionManager.retrieve(
                this.positionData.values.x, this.positionData.values.y,
                this.physicsData.size, this.physicsData.size
            );
            for (let i = 0; i < 20; ++i) {
                const Angle = util.PI2 * Math.random(); 
                const particle = new Particle(this, Angle, 30 + (Math.random() * 40), Color.White, 20 + Math.random() * 10, 5 + Math.random() * 25, 5 + Math.random() * 15, 1);
                const {x, y} = this.getWorldPosition();
                const Rng = (Math.random()/2) + 0.5;
                particle.positionData.values.x = x + Math.cos(Angle) * this.physicsData.size * Rng;
                particle.positionData.values.y = y + Math.sin(Angle) * this.physicsData.size * Rng;
                particle.styleData.zIndex = this.styleData.zIndex - 1;
            }
            for (let i = 0; i < entities.data.length; ++i) {
                let chunk = entities.data[i];

                while (chunk) {
                    const bitValue = chunk & -chunk;
                    const bitIdx = 31 - Math.clz32(bitValue);
                    chunk ^= bitValue;
                    const id = 32 * i + bitIdx;

                    const entity = this.game.entities.inner[id] as ObjectEntity;
                    if (!entity || entity.hash === 0) continue;
                    if (!Wormhole.isColliding(this, entity)) continue;
                    if (!(entity instanceof LivingEntity)) continue; // Check if the target is living

                    let kbAngle: number;
                    let diffY = this.positionData.values.y - entity.positionData.values.y;
                    let diffX = this.positionData.values.x - entity.positionData.values.x;
                    if (diffX === 0 && diffY === 0) kbAngle = Math.random() * util.PI2;
                    else kbAngle = Math.atan2(diffY, diffX);
                    if ((entity instanceof TankBody)) {
                        if(entity.scoreData.score < 5000 && !this.shattered) {
                            entity.addVelocity(kbAngle, -40);
                        } else {
                            const camera = entity.cameraEntity;
                            if (!(camera instanceof ClientCamera)) continue;
                            const target = this.targetGameId !== undefined ? gamesMap.get(this.targetGameId) : games[(Math.floor(Math.random() * games.length))];
                            target?.transferClient(camera.client);
                        }
                    } else {
                        entity.addVelocity(kbAngle, -40);
                    }
                }
            }
        }
        super.destroy(animate);
    }
}
