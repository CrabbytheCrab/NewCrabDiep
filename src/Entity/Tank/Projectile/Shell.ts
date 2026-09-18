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

import { InputFlags } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";
import { PI2 } from "../../../util";

/**
 * Barrel definition for the firework shell's back barrel.
 */
const ShellBackBarrelDefinition: BarrelDefinition = {
    angle: Math.PI,
    offset: 0,
    size: 63.9214,
    width: 35.7,
    delay: 0.5,
    reload: 0.5,
    recoil: 5.6,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.3,
        damage: 0.6,
        speed: 0.5,
        scatterRate: 0.2,
        lifeLength: 0.2,
        sizeRatio: 1,
        absorbtionFactor: 1,
        launchSpeed: 1.5,
    }
};

const ShellBurstBarrelDefinition1: BarrelDefinition = {
    angle: -Math.PI + Math.PI/6,
    offset: 0,
    size: 0,
    width: 35.7,
    delay: 0,
    reload: 20,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    rightClickFire: true,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.6,
        speed: 0.4,
        scatterRate: 0.5,
        lifeLength: 0.16,
        sizeRatio: 1,
        absorbtionFactor: 0.25,
        launchSpeed: 0.6
    }
};

const ShellBurstBarrelDefinition2: BarrelDefinition = {
    angle: -Math.PI,
    offset: 0,
    size: 0,
    width: 35.7,
    delay: 0,
    reload: 20,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    rightClickFire: true,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.6,
        speed: 0.6,
        scatterRate: 0.5,
        lifeLength: 0.16,
        sizeRatio: 1,
        absorbtionFactor: 0.25,
        launchSpeed: 0.8
    }
};

const ShellBurstBarrelDefinition3: BarrelDefinition = {
    angle: -Math.PI + Math.PI/6,
    offset: 0,
    size: 0,
    width: 35.7,
    delay: 0,
    reload: 20,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    rightClickFire: true,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.6,
        speed: 0.8,
        scatterRate: 0.5,
        lifeLength: 0.16,
        sizeRatio: 1,
        absorbtionFactor: 0.25,
        launchSpeed: 1
    }
};

const ShellBurstBarrelDefinition4: BarrelDefinition = {
    angle: -Math.PI,
    offset: 0,
    size: 0,
    width: 35.7,
    delay: 0,
    reload: 20,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    rightClickFire: true,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.6,
        speed: 0.2,
        scatterRate: 0.5,
        lifeLength: 0.16,
        sizeRatio: 1,
        absorbtionFactor: 0.25,
        launchSpeed: 0.4
    }
};

/**
 * Represents all firework shells in game.
 */
export default class Shell extends Bullet implements BarrelBase {
    /** shells's barrels */
    private shellBarrels: Barrel[];

    /** The camera entity (used as team) of the shells. */
    public cameraEntity: CameraEntity;
    /** The reload time of the shells's barrel. */
    public reloadTime = 15;
    /** The inputs for when to shoot or not. (shells) */
    public inputs: Inputs;
    /** Whether or not the shell has expoded */
    public hasBursted: Boolean;

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        this.cameraEntity = tank.cameraEntity;

        this.physicsData.values.sides = 6;

        this.hasBursted = false;

        const shellBarrels: Barrel[] = this.shellBarrels =[];

        const f1 = new Barrel(this, {...ShellBackBarrelDefinition});

        f1.styleData.values.color = this.styleData.values.color;
        f1.scale(this.sizeFactor);
        shellBarrels.push(f1);

        //Now for the explosion barrels.
        for (let i = 0; i < 6; ++i) {
            let offset = PI2/6 * i - 1

            let s1Definition = {...ShellBurstBarrelDefinition1};
            s1Definition.angle += offset
            let s1 = new Barrel(this, {...s1Definition});
            s1.styleData.values.color = this.styleData.values.color;
            s1.scale(this.sizeFactor);

            let s2Definition = {...ShellBurstBarrelDefinition2};
            s2Definition.angle += offset
            let s2 = new Barrel(this, {...s2Definition});
            s2.styleData.values.color = this.styleData.values.color;
            s2.scale(this.sizeFactor);

            let s3Definition = {...ShellBurstBarrelDefinition3};
            s3Definition.angle += offset
            let s3 = new Barrel(this, {...s3Definition});
            s3.styleData.values.color = this.styleData.values.color;
            s3.scale(this.sizeFactor);

            let s4Definition = {...ShellBurstBarrelDefinition4};
            s4Definition.angle += offset
            let s4 = new Barrel(this, {...s4Definition});
            s4.styleData.values.color = this.styleData.values.color;
            s4.scale(this.sizeFactor);

            shellBarrels.push(s1, s2, s3, s4);
        }

        this.inputs = new Inputs();
        this.inputs.flags |= InputFlags.leftclick;
    }

    public get sizeFactor() {
        return this.physicsData.values.size * Math.SQRT2 / 50;
    }

    public tick(tick: number) {
        this.reloadTime = this.tank.reloadTime;
        if(!this.hasBursted && this.tank.inputs.attemptingRepel() && tick >= this.spawnTick + 10) {
            this.hasBursted = true
            this.inputs.flags |= InputFlags.rightclick;
        }
        super.tick(tick);

        if (this.deletionAnimation) return;
        if(this.hasBursted) {
            this.destroy(true);
        }
        // Only accurate on current version, but we dont want that
        // if (!Entity.exists(this.barrelEntity.rootParent) && (this.inputs.flags & InputFlags.leftclick)) this.inputs.flags ^= InputFlags.leftclick;
    }
}
