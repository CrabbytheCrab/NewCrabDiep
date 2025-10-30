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
import Drone from "./Drone";

import { InputFlags, PhysicsFlags, StyleFlags } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { AIState, Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";
import Mine from "./Mine";
import Minion, { MinionBarrelDefinition } from "./Minion";
import { PI2 } from "../../../util";
import { BarrelAddon } from "../BarrelAddons";
import ObjectEntity from "../../Object";
import AutoTurret from "../AutoTurret";



const SynopeTurretDefinition: BarrelDefinition = {
        angle: 0,
        offset: 0,
        size: 60,
        width: 42 * 0.7,
        delay: 0.01,
        reload: 1.5,
        recoil: 0,
        isTrapezoid: false,
        trapezoidDirection: 0,
        addon: null,
        bullet: {
        type: "bullet",
        sizeRatio: 1,
        health: 1,
        damage: 0.5,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        absorbtionFactor: 1
    }
};

/**
 * The drone class represents the synope minion (projectile) entity in diep.
 */
export default class SynopeMinion extends Minion {
    public autoCannon: AutoTurret;
    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number, barrelDefinition: BarrelDefinition[] = MinionBarrelDefinition) {
        super(barrel, tank, tankDefinition, shootAngle);
        this.barrels[0].delete();
        this.barrels = []
        for (let i = 0; i < barrelDefinition.length; ++i) {
            this.barrels.push(new Barrel(this, barrelDefinition[i]));
        }
        if(this.styleData.flags & StyleFlags.isVisible) this.styleData.flags ^= StyleFlags.isVisible;
        
        const body = new ObjectEntity(this.game);

        body.setParent(this);
        body.relationsData.values.owner = this;
        body.relationsData.values.team = this.relationsData.values.team;

        body.physicsData.values.size = this.physicsData.size;

        body.styleData.values.color = this.styleData.color;
        body.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body.tick = () => {
            body.physicsData.size = this.physicsData.size;
        }
        const body2 = new ObjectEntity(this.game);

        body2.setParent(this);
        body2.relationsData.values.owner = this;
        body2.relationsData.values.team = this.relationsData.values.team;

        body2.physicsData.values.size = body.physicsData.values.size * 0.7;

        body2.styleData.values.color = this.styleData.color;
        body2.physicsData.values.sides = 3;
        //pronounce.styleData.values.borderWidth = 0
        body2.tick = () => {
            body2.physicsData.size = body.physicsData.values.size * 0.7;
        }
        this.autoCannon = new AutoTurret(this, SynopeTurretDefinition)
        
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }
}