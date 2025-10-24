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

import { DevTank } from "../../Const/DevTankDefinitions";
import { Color, ColorsHexCode, NameFlags, StyleFlags, Tank, ClientBound } from "../../Const/Enums";
import ArenaEntity from "../../Native/Arena";
import ClientCamera, { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs } from "../AI";
import LivingEntity from "../Live";
import Bullet from "../Tank/Projectile/Bullet";
import TankBody from "../Tank/TankBody";
import TeamBase from "./TeamBase";
import { TeamEntity } from "./TeamEntity";

/**
 * Dominator Tank
 */
export default class PrimeCelesial extends TankBody {
    /** Size of a dominator */
    public static SIZE = 600;

    /** The AI that controls how the Dominator aims. */
    public ai: AI;

    /** The base its located on (used to change base color). */
    public base: TeamBase;
    
    public prefix: string | null = "";

    public constructor(arena: ArenaEntity, base: TeamBase) {
        let tankId: Tank;

        const inputs = new Inputs();
        const camera = new CameraEntity(arena.game);

        camera.setLevel(300);

        super(arena.game, camera, inputs);
        this.relationsData.values.team = base.relationsData.values.team;
        this.styleData.values.color = base.styleData.values.color;
        this.setTank(DevTank.PrimeCelesial)

        this.ai = new AI(this, true);
        this.ai.inputs = inputs;
        this.ai.movementSpeed = 0;
        this.ai.viewRange = 8000;
        this.ai.doAimPrediction = true;

        const def = (this.definition = Object.assign({}, this.definition));
        def.speed = camera.cameraData.values.movementSpeed = 0;
        this.nameData.values.name = "Prime Celestial";
        this.nameData.values.flags |= NameFlags.hiddenName;
        this.physicsData.values.absorbtionFactor = 0;
        
        this.positionData.values.x = base.positionData.values.x;
        this.positionData.values.y = base.positionData.values.y;
        
        this.scoreReward = 0;
        camera.cameraData.values.player = this;
        this.base = base;

        Object.defineProperty(this, "damagePerTick", {
            get() {
                return 10;
            },
            set() {}
        });

        if (this.styleData.values.flags & StyleFlags.isFlashing) { // Remove spawn shield
            this.styleData.values.flags ^= StyleFlags.isFlashing;
            this.damageReduction = 0;
        }
        this.setGlobalEntity(false)
    }

    public tick(tick: number) {
        this.inputs = this.ai.inputs;
        this.ai.state = AIState.possessed;
        if (this.ai.state === AIState.possessed) {
            const angle = this.positionData.values.angle + this.ai.passiveRotation;
            const mag = Math.sqrt((this.inputs.mouse.x - this.positionData.values.x) ** 2 + (this.inputs.mouse.y - this.positionData.values.y) ** 2);
            this.inputs.mouse.set({
                x: this.positionData.values.x + Math.cos(angle) * mag,
                y: this.positionData.values.y + Math.sin(angle) * mag
            });
        }

        super.tick(tick);
    }
}
