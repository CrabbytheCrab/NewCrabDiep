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

import { Color, PhysicsFlags, StyleFlags, Tank } from "../../../Const/Enums";
import TankDefinitions, { BarrelDefinition } from "../../../Const/TankDefinitions";
import GameServer from "../../../Game";
import { AIState } from "../../AI";
import ObjectEntity from "../../Object";
import AutoTurret from "../../Tank/AutoTurret";
import Barrel from "../../Tank/Barrel";
import AbstractBoss from "../AbstractBoss";


// The size of a Peacekeeper by default
const PEACEKEEPER_SIZE = 150;

const PeacekeeperFrontDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 115,
    width: 42,
    delay: 0,
    reload: 6,
    recoil: 1,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        sizeRatio:1,
        health: 2,
        damage: 12,
        speed: 2.5,
        scatterRate: 0.3,
        lifeLength: 1,
        absorbtionFactor: 0.5,
        color: Color.Radiant
    }
};
const PeacekeeperBackDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 90,
    width: 42,
    delay: 0,
    reload: 0.35,
    recoil: 2,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    forceFire: true,
    bullet: {
        type: "bullet",
        sizeRatio: 0.9,
        health: 2,
        damage: 1.5,
        speed: 1.5,
        scatterRate: 2,
        lifeLength: 0.2,
        absorbtionFactor: 1,
        color: Color.Radiant
    }
};
const PeacekeeperBackDefinition2: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 70,
    width: 42 * 1.5,
    delay: 0,
    reload: 0.7,
    recoil: 2,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    forceFire: true,
    bullet: {
        type: "bullet",
        sizeRatio: 0.7,
        health: 2,
        damage: 1.5,
        speed: 1.5,
        scatterRate: 3,
        lifeLength: 0.2,
        absorbtionFactor: 1,
        color: Color.Radiant
    }
};
/**
 * Class which represents the boss "Peacekeeper"
 */
export default class Peacekeeper extends AbstractBoss {
    /** The speed to maintain during movement. */
    public movementSpeed = 0.7;

    public constructor(game: GameServer) {
        super(game);

        this.nameData.values.name = "Peacekeeper";
        this.styleData.values.color = Color.Radiant;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.sides = 3;
        this.physicsData.values.size = PEACEKEEPER_SIZE * Math.SQRT1_2;

                const size = this.physicsData.values.size;

        const pronounce = new ObjectEntity(this.game);
        pronounce.setParent(this);
        pronounce.relationsData.values.owner = this;
        pronounce.relationsData.values.team = this.relationsData.values.team

        pronounce.physicsData.values.size = size * 1.4;

        pronounce.styleData.values.color = Color.Border;
        pronounce.physicsData.values.sides = 3;
        const tickBase = pronounce.tick;
        pronounce.tick = (tick: number) => {
            const size = this.physicsData.values.size;

            pronounce.physicsData.size = size * 1.4;
            tickBase.call(pronounce, tick);
        }
        this.barrels.push(new Barrel(this, PeacekeeperFrontDefinition), new Barrel(this, PeacekeeperBackDefinition), new Barrel(this, PeacekeeperBackDefinition2));

        const pronounce2 = new ObjectEntity(this.game);
        const sizeRatio = 65 / 50;
        const widthRatio = 42 / 50;
        const offsetRatio = 25 / 50;

        pronounce2.setParent(this);
        pronounce2.relationsData.values.owner = this;
        pronounce2.relationsData.values.team = this.relationsData.values.team

        pronounce2.physicsData.values.size = sizeRatio * size;
        pronounce2.physicsData.values.width = widthRatio * size;
        pronounce2.positionData.values.x = offsetRatio * size;
        pronounce2.positionData.values.angle = Math.PI;

        pronounce2.styleData.values.color = Color.Barrel;
        pronounce2.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce2.physicsData.values.sides = 2;

        pronounce2.tick = () => {
            const size = this.physicsData.values.size;

            pronounce2.physicsData.size = sizeRatio * size;
            pronounce2.physicsData.width = widthRatio * size;
            pronounce2.positionData.x = offsetRatio * size;
        }

        const pronounce3 = new ObjectEntity(this.game);
        pronounce3.setParent(this);
        pronounce3.relationsData.values.owner = this;
        pronounce3.relationsData.values.team = this.relationsData.values.team

        pronounce3.physicsData.values.size = size * 0.7;
        pronounce3.styleData.values.flags |= StyleFlags.showsAboveParent;
        pronounce3.styleData.values.color = this.styleData.color;
        pronounce3.physicsData.values.sides = 3;
        const tickBase3 = pronounce3.tick;
        pronounce3.tick = (tick: number) => {
            const size = this.physicsData.values.size;
            pronounce3.styleData.opacity = this.styleData.opacity;
            pronounce3.physicsData.size = size * 0.7;
            tickBase3.call(pronounce3, tick);
            pronounce3.styleData.opacity = this.styleData.opacity;
        }
        const atuo = new AutoTurret(this, {
            angle: 0,
            offset: 0,
            size: 75,
            width: 42,
            delay: 0,
            reload: 3,
            recoil: 0,
            isTrapezoid: false,
            trapezoidDirection: 0,
            addon: null,
            bullet: {
                type: "bullet",
                sizeRatio: 1,
                health: 2,
                damage: 3,
                speed: 2,
                scatterRate: 0.3,
                lifeLength: 1,
                absorbtionFactor: 0.1,
            }
        }, 30);
        atuo.ai.viewRange = 2000;
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    protected moveAroundMap() {
      const x = this.positionData.values.x,
      y = this.positionData.values.y
        if (this.ai.state === AIState.idle) {
            super.moveAroundMap();
            this.positionData.angle = Math.atan2(this.inputs.movement.y, this.inputs.movement.x)
        } else {
            this.positionData.angle = Math.atan2(this.ai.inputs.mouse.y - y, this.ai.inputs.mouse.x - x)
        }
    }

    public tick(tick: number) {
        super.tick(tick);
    }
}
