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

import { BarrelBase } from "../Tank/TankBody";
import Crasher from "./Crasher";
import Barrel from "../Tank/Barrel";
import { CameraEntity } from "../../Native/Camera";
import { Inputs } from "../AI";

/**
 * Sentry entity class.
*/

export class Sentry extends Crasher implements BarrelBase {
    /** The reload time calculation property. Used for calculating reload of barrels. */
    public reloadTime = 15;

    /** The AI's inputs (for fullfilling BarrelBase typedef). */
    public inputs: Inputs;

    /** The sentry's "camera entity" */
    public cameraEntity: CameraEntity = this as unknown as CameraEntity;

    /** List of the sentry's barrels. */
    protected barrels: Barrel[] = [];

    public constructor(game: GameServer, large=true) {
        super(game, large);
        this.inputs = this.ai.inputs;
        this.isLarge = true
        this.healthData.values.health = this.healthData.values.maxHealth = 500;
        this.physicsData.values.size =  85 * Math.SQRT1_2;
        this.physicsData.values.sides = 3;
        this.physicsData.values.absorbtionFactor = 0.1;
        this.physicsData.values.pushFactor =  12;
       
        this.targettingSpeed = 1.4;

        this.scoreReward = 450;
        this.damagePerTick = 5;
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }
}
