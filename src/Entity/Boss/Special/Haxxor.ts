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


import { StyleFlags,Color, PositionFlags } from "../../../Const/Enums";
import { BarrelDefinition } from "../../../Const/TankDefinitions";
import GameServer from "../../../Game";
import { PI2, normalizeAngle } from "../../../util";
import { AI, AIState } from "../../AI";
import AiTank from "../../Misc/AiTank";
import ObjectEntity from "../../Object";
import AutoTurret, { AutoTurretDefinition } from "../../Tank/AutoTurret";
import TankBody from "../../Tank/TankBody";
import AbstractBoss from "../AbstractBoss";



/**
 * Class which represents the boss "H4XX0R"
 */

const TURN_TIMEOUT = 300;

const MountedTurretDefinition: BarrelDefinition = {
    ...AutoTurretDefinition,
    width: 10.5,
    size: 25,
    reload: 1.5,
    bullet: {
    
        ...AutoTurretDefinition.bullet,
        speed: 3,
        damage: 2,
        health: 5.75,
    }
};

const enum HaxxorState {
    Idle = 0,
    Dash = 1,
}

export default class Haxxor extends AbstractBoss {
    /** The speed to maintain during movement. */
    public movementSpeed = 0;

    protected static BASE_ROTATION = AI.PASSIVE_ROTATION;
    /** Used to calculate the speed at which the boss orbits. Radians Per Tick. */
    protected static BASE_ORBIT = 0.005;
    /** The velocity of the boss's orbits. */
    protected static BASE_VELOCITY = 3;
    
    protected doIdleRotate: boolean = true;
    /** The current direction of the boss's orbit. */
    protected orbitAngle: number;
    /** The decided orbit rate, based on the constructor's BASE_ORBIT. *//* @ts-ignore */
    protected orbitRate = (Math.random() < .5 ? -1 : 1) * this.constructor.BASE_ORBIT
    /** The decided rotation rate, based on the constructor's BASE_ROTATION. *//* @ts-ignore */
    public rotationRate = (Math.random() < .5 ? -1 : 1) * this.constructor.BASE_ROTATION
    /** The decided velocity of the boss, based on the constructor's BASE_VELOCITY. *//* @ts-ignore */
    protected bossVelocity = this.constructor.BASE_VELOCITY;
    /** Whether or not the tank is turning */
    protected isTurning: number = 0;
    /** The destination for the angle of the boss's orbit - it slowly becomes this */
    protected targetTurningAngle: number = 0;
    /** The amount of ticks it takes for H4XX0R to spawn a tank */
    public tankSpawnTimer = 60
    /** The amount of ticks it takes for H4XX0R to preform a dash*/
    public dashTimer: number
    /** What state H4XX0R is in*/
    public haxxorState: number
    /** How many tanks H4XX0R has spawned*/
    public currentTankAmount = 0;
    public angleX:number
    public angleY:number
    public posX:number
    public posY:number

    public constructor(game: GameServer) {
        super(game);
        this.physicsData.values.size = 200 * Math.SQRT1_2;
        this.orbitAngle = this.positionData.values.angle = (Math.random() * PI2);
        this.physicsData.sides = 8
        this.styleData.color = Color.ScoreboardBar
        this.nameData.values.name = 'H4XX0R';
        this.dashTimer = 0
        this.angleX = 0
        this.angleY = 0
        this.posX = 0
        this.posY = 0
        this.haxxorState = 0
        this.physicsData.absorbtionFactor = 0
        this.healthData.values.health = this.healthData.values.maxHealth = 6000;
        this.scoreReward = 75000 * this.game.arena.shapeScoreRewardMultiplier;
        this.ai.passiveRotation *= 2;
        const pronounce = new ObjectEntity(this.game);
        const size = this.physicsData.values.size;

        pronounce.setParent(this);
        pronounce.relationsData.values.owner = this;
        pronounce.relationsData.values.team = this.relationsData.values.team

        pronounce.physicsData.values.size = size * 1.2;

        pronounce.styleData.values.color = Color.Border;
        pronounce.physicsData.values.sides = 8;
        const tickBase = pronounce.tick;

        pronounce.tick = (tick: number) => {
            const size = this.physicsData.values.size;

            pronounce.physicsData.size = size * 1.2;
            tickBase.call(pronounce, tick);
        }


        const pronounce2 = new ObjectEntity(this.game);

        pronounce2.setParent(this);
        pronounce2.relationsData.values.owner = this;
        pronounce2.relationsData.values.team = this.relationsData.values.team

        pronounce2.physicsData.values.size = size * 0.8;

        pronounce2.styleData.values.color = Color.Barrel;
        pronounce2.styleData.values.flags |= StyleFlags.showsAboveParent
        pronounce2.physicsData.values.sides = 8;
        const tickBase2 = pronounce2.tick;

        pronounce2.tick = (tick: number) => {
            const size = this.physicsData.values.size;
            pronounce2.styleData.opacity = this.styleData.values.opacity;
            pronounce2.physicsData.size = size * 0.8;
            tickBase2.call(pronounce2, tick);
            pronounce2.styleData.opacity = this.styleData.values.opacity;
        }



        const pronounce3 = new ObjectEntity(this.game);

        pronounce3.setParent(this);
        pronounce3.relationsData.values.owner = this;
        pronounce3.relationsData.values.team = this.relationsData.values.team

        pronounce3.physicsData.values.size = size * 0.75;

        pronounce3.styleData.values.color = Color.kMaxColors;
        pronounce3.styleData.values.flags |= StyleFlags.showsAboveParent
        pronounce3.physicsData.values.sides = 1;
        const tickBase3 = pronounce3.tick;

        pronounce3.tick = (tick: number) => {
            const size = this.physicsData.values.size;
            pronounce3.styleData.opacity = this.styleData.values.opacity;

            pronounce3.physicsData.size = size * 0.75;
            tickBase3.call(pronounce3, tick);
            pronounce3.styleData.opacity = this.styleData.values.opacity;

        }
        for (let i = 0; i < 8; ++i) {
            const base = new AutoTurret(this, MountedTurretDefinition);
            base.influencedByOwnerInputs = true;
            const MAX_ANGLE_RANGE = PI2 / 16; // keep within 22.5º each side
            base.baseSize *= 0.325
            const angle = base.ai.inputs.mouse.angle = PI2 * (i / 8);
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + this.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }
            base.positionData.values.y = this.physicsData.values.size * Math.sin(angle) * 1.35;
            base.positionData.values.x = this.physicsData.values.size * Math.cos(angle) * 1.35;

            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.physicsData.values.size * Math.sin(angle) * 1.35;
                base.positionData.x = this.physicsData.values.size * Math.cos(angle) * 1.35;

                tickBase.call(base, tick);
                if (base.ai.state === AIState.idle) base.positionData.angle = angle + this.positionData.values.angle;
            }
        }
    }

    protected turnTo(angle: number) {
        if (normalizeAngle(this.orbitAngle - angle) < 0.20) return;
        this.targetTurningAngle = angle;
        this.isTurning = TURN_TIMEOUT;
    }

    protected moveAroundMap() {
            const y = this.positionData.values.y;
            const x = this.positionData.values.x;
    
            // goes down too much
            if (this.isTurning === 0) {
                if (x > this.game.arena.arenaData.values.rightX - 400
                    || x < this.game.arena.arenaData.values.leftX + 400
                    || y < this.game.arena.arenaData.values.topY + 400
                    || y > this.game.arena.arenaData.values.bottomY - 400) {
                    this.turnTo(Math.PI + Math.atan2(y, x));
                } else if (x > this.game.arena.arenaData.values.rightX - 500) {
                    this.turnTo(Math.sign(this.orbitRate) * Math.PI / 2);
                } else if (x < this.game.arena.arenaData.values.leftX + 500) {
                    this.turnTo(-1 * Math.sign(this.orbitRate) * Math.PI / 2);
                } else if (y < this.game.arena.arenaData.values.topY + 500) {
                    this.turnTo(this.orbitRate > 0 ? 0 : Math.PI);
                } else if (y > this.game.arena.arenaData.values.bottomY - 500) {
                    this.turnTo(this.orbitRate > 0 ? Math.PI : 0);
                }
            }
            this.positionData.angle += this.rotationRate;
            this.orbitAngle += this.orbitRate + (this.isTurning === TURN_TIMEOUT ? this.orbitRate * 10 : 0);
            if (this.isTurning === TURN_TIMEOUT && (((this.orbitAngle - this.targetTurningAngle) % (PI2)) + (PI2)) % (PI2) < 0.20) {
                this.isTurning -= 1;
            } else if (this.isTurning !== TURN_TIMEOUT && this.isTurning !== 0) this.isTurning -= 1;
    
            // convert from angle to orbit angle: angle / (10 / 3)
            // convert from orbit angle to angle: orbitAngle * (10 / 3)
            if(this.haxxorState == HaxxorState.Idle){
                if(this.healthData.health <= this.healthData.maxHealth/5){
                this.maintainVelocity(this.orbitAngle, this.bossVelocity * 3);
                }else{
                    this.maintainVelocity(this.orbitAngle, this.bossVelocity)
                }
            }
           // this.positionData.angle = Math.atan2(this.ai.inputs.mouse.y - y, this.ai.inputs.mouse.x - x)
    }
    public Attack(){
        this.dashTimer ++
        if(this.dashTimer <= 45){
            this.inputs.movement.x = Math.cos(Math.atan2(this.angleY - this.posY,this.angleX - this.posX));
            this.inputs.movement.y = Math.sin(Math.atan2(this.angleY - this.posY,this.angleX - this.posX));
            this.accel.add({
                x: this.inputs.movement.x * 5,
                y: this.inputs.movement.y * 5,
            });
        }
        if(this.dashTimer >= 45){
            this.dashTimer = 0
            this.haxxorState = HaxxorState.Idle
        }
    }

    public tick(tick: number) {
        super.tick(tick);
        this.moveAroundMap()

        if(this.haxxorState == HaxxorState.Dash){
            this.Attack()
        }
        if(this.ai.state == AIState.hasTarget) {
            if(this.haxxorState == HaxxorState.Idle){
                if(this.ai.target instanceof TankBody){
                    this.dashTimer ++
                    if(this.dashTimer >= 90){
                        this.angleX = this.ai.inputs.mouse.x
                        this.angleY = this.ai.inputs.mouse.y
                        this.posX = this.positionData.x
                        this.posY = this.positionData.y
                        this.haxxorState = HaxxorState.Dash
                        this.dashTimer = 0
                    }
                }
                this.tankSpawnTimer--
                if(this.currentTankAmount > 20) return;
                if(this.tankSpawnTimer <= 0){
                    if(this.healthData.health <= this.healthData.maxHealth/4){
                        this.tankSpawnTimer = 120
                        for(let i = 0; i < 3; i++){    
                            setTimeout(() =>{
                                const tonk = new AiTank(this.game,this, true)
                                tonk.positionData.values.x = this.rootParent.positionData.values.x
                                tonk.positionData.values.y = this.rootParent.positionData.values.y
                                tonk.relationsData = this.rootParent.relationsData
                                tonk.styleData.color = this.rootParent.styleData.color
                                this.currentTankAmount += 1;
                            }, 300 * i)
                        }
                    }else{
                        this.tankSpawnTimer = 30
                        const tonk = new AiTank(this.game,this)
                        tonk.positionData.values.x = this.rootParent.positionData.values.x
                        tonk.positionData.values.y = this.rootParent.positionData.values.y
                        tonk.relationsData = this.rootParent.relationsData
                        tonk.styleData.color = this.rootParent.styleData.color
                        this.currentTankAmount += 1;
                    }
                }
            }
        }
    }
}
