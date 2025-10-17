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

import { Color, PhysicsFlags, StyleFlags } from "../../Const/Enums";
import { barrelAddonId } from "../../Const/TankDefinitions";
import GameServer from "../../Game";
import ObjectEntity from "../Object";
import Barrel from "./Barrel";

/**
 * Abstract class to represent a barrel's addon in game.
 * 
 * For more information on an addon, see Addons.ts - BarrelAddons are the same thing except they are applied on the barrel after it is made.
 * 
 * Read [addons.md on diepindepth](https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md) 
 * for more details and examples.
 */

export class BarrelAddon {
    /** The current game server */
    protected game: GameServer; 
    /** Helps the class determine size  */
    protected owner: Barrel;

    public constructor(owner: Barrel) {
        this.owner = owner;
        this.game = owner.game;
    }
}

/**
 * Entity attached to the edge of a trapper barrel
 */
export class TrapLauncher extends ObjectEntity {
    /** The barrel that this trap launcher is placed on. */
    public barrelEntity: Barrel;

    /** Resizes the trap launcher; when its barrel owner gets bigger, the trap launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.isTrapezoid | PhysicsFlags.doChildrenCollision;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width;
        this.physicsData.values.size = barrel.physicsData.values.width * (20 / 42);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (20 / 42);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}

/** Trap launcher - added onto traps */
export class TrapLauncherAddon extends BarrelAddon {
    /** The actual trap launcher entity */
    public launcherEntity: TrapLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        this.launcherEntity = new TrapLauncher(owner);
    }
}

/**
 * Entity attached to the edge of a bomber barrel
 */
export class BombLauncherAddon extends ObjectEntity {
    /** The barrel that this bomb launcher is placed on. */
    public barrelEntity: Barrel;

    /** Resizes the bomb launcher; when its barrel owner gets bigger, the bomb launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.2;
        this.physicsData.values.size = barrel.physicsData.values.width * (35 / 42);
        this.positionData.values.x = ((this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2) - this.physicsData.values.size/2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.2;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (35 / 42);
        this.positionData.x = ((this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2) - this.physicsData.values.size/2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}

/** Bomb launcher - added onto bombs */
export class BombLauncherAddonAddon extends BarrelAddon {
    /** The actual bomb launcher entity */
    public launcherEntity: BombLauncherAddon;

    public constructor(owner: Barrel) {
        super(owner);

        this.launcherEntity = new BombLauncherAddon(owner);
    }
}

export class ClaymoreLauncher extends ObjectEntity {
    /** The barrel that this claymore launcher is placed on. */
    public barrelEntity: Barrel;
    /** The second object to make the launcher. */
    public secondAddon: ObjectEntity
    /** Resizes the claymore launcher; when its barrel owner gets bigger, the claymore launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.2;
        this.physicsData.values.size = barrel.physicsData.values.width * (35 / 42);
        this.positionData.values.x = ((this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2) - this.physicsData.values.size/2;

        this.secondAddon = new ObjectEntity(barrel.game)
        this.secondAddon.setParent(barrel);
        this.secondAddon.relationsData.values.team = barrel;
        this.secondAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.secondAddon.styleData.values.color = Color.Barrel;
        this.secondAddon.physicsData.values.sides = 2;
        this.secondAddon.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.secondAddon.physicsData.values.width = barrel.physicsData.values.width * 1.3;
        this.secondAddon.physicsData.values.size = barrel.physicsData.values.width * (17.5 / 42);
        this.secondAddon.positionData.values.x = (barrel.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.2;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (35 / 42);
        this.positionData.x = ((this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2) - this.physicsData.values.size/2;

        this.secondAddon.physicsData.width = this.barrelEntity.physicsData.values.width * 1.3;
        this.secondAddon.physicsData.size = this.barrelEntity.physicsData.values.width * (17.5 / 42);
        this.secondAddon.positionData.x = (this.barrelEntity.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}

/** Bomb launcher - added onto bombs */
export class ClaymoreLauncherAddon extends BarrelAddon {
    /** The actual bomb launcher entity */
    public launcherEntity: ClaymoreLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        this.launcherEntity = new ClaymoreLauncher(owner);
    }
}
/**
 * Entity attached to the edge of a engineer barrel
 */
export class EngineerLauncher extends ObjectEntity {
    /** The barrel that this auto trap launcher is placed on. */
    public barrelEntity: Barrel;
    /** The second object to make the launcher. */
    public secondAddon: ObjectEntity
    /** Resizes the trap launcher; when its barrel owner gets bigger, the auto trap launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.isTrapezoid | PhysicsFlags.doChildrenCollision;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width;
        this.physicsData.values.size = barrel.physicsData.values.width * (15 / 42);
        this.positionData.values.x = ((barrel.physicsData.values.size + this.physicsData.values.size) / 2) -  (barrel.physicsData.values.width * (5 / 42));


        this.secondAddon = new ObjectEntity(barrel.game)
        this.secondAddon.setParent(barrel);
        this.secondAddon.relationsData.values.team = barrel;
        this.secondAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.secondAddon.styleData.values.color = Color.Barrel;

        this.secondAddon.physicsData.values.sides = 2;
        this.secondAddon.physicsData.values.width = barrel.physicsData.values.width * 1.75;
        this.secondAddon.physicsData.values.size = barrel.physicsData.values.width * (10 / 42);
        this.secondAddon.positionData.values.x = (this.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (15 / 42);
        this.positionData.x = ((this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2) -  (this.barrelEntity.physicsData.values.width * (5 / 42));
        
        this.secondAddon.physicsData.width = this.barrelEntity.physicsData.values.width * 1.75;
        this.secondAddon.physicsData.size = this.barrelEntity.physicsData.values.width * (10 / 42);
        this.secondAddon.positionData.x = this.positionData.x + (this.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}

/** Auto Trap launcher - added onto auto traps */
export class EngineerLauncherAddon extends BarrelAddon {
    /** The actual engineer launcher entity */
    public launcherEntity: EngineerLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        this.launcherEntity = new EngineerLauncher(owner);
    }
}

export class ReverseTrapLauncher extends ObjectEntity {
    /** The barrel that this trap launcher is placed on. */
    public barrelEntity: Barrel;

    /** Resizes the trap launcher; when its barrel owner gets bigger, the trap launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.isTrapezoid | PhysicsFlags.doChildrenCollision;
        this.styleData.color = this.barrelEntity.styleData.color;
        this.positionData.values.angle = Math.PI;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width;
        this.physicsData.values.size = barrel.physicsData.values.width * (20 / 42);
        this.positionData.values.x = (-barrel.physicsData.values.size - this.physicsData.values.size) / 2;
    }

    public resize() {
        this.styleData.color = this.barrelEntity.styleData.color;
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width;
        this.physicsData.size = this.barrelEntity.physicsData.values.width * (20 / 42);
        this.positionData.x = (-this.barrelEntity.physicsData.values.size - this.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}
export class StrikerAddon extends BarrelAddon {
    /** The actual trap launcher entity */
    public launcherEntity: ReverseTrapLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        //this.launcherEntity = new StrikerLauncher(owner);
        this.launcherEntity = new ReverseTrapLauncher(owner);
    }
}

/**
 * Entity attached to the edges of a minion barrel
 */
export class MinionLauncher extends ObjectEntity {
    /** The barrel that this minion launcher is placed on. */
    public barrelEntity: Barrel;
    /** The second object to make the minion launcher. */
    public secondAddon: ObjectEntity
    /** The third object to make the minion launcher. */
    public thirdAddon: ObjectEntity
    /** Resizes the trap minion; when its barrel owner gets bigger, the minion launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);
        barrel.spawnOffset = 15;

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width * 1.25;
        this.physicsData.values.size = barrel.physicsData.values.size;
        this.positionData.values.x = (-barrel.physicsData.values.size + this.physicsData.values.size) / 2;
        //second addon
        this.secondAddon = new ObjectEntity(barrel.game)
        this.secondAddon.setParent(barrel);
        this.secondAddon.relationsData.values.team = barrel;
        this.secondAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision;
        this.secondAddon.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.secondAddon.styleData.values.color = Color.Barrel;

        this.secondAddon.physicsData.values.sides = 2;
        this.secondAddon.physicsData.values.width = barrel.physicsData.values.width * 1.75;
        this.secondAddon.physicsData.values.size = this.barrelEntity.tank.sizeFactor * 15;
        this.secondAddon.positionData.values.x = (barrel.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
        //third addon
        this.thirdAddon = new ObjectEntity(barrel.game)
        this.thirdAddon.setParent(barrel);
        this.thirdAddon.relationsData.values.team = barrel;
        this.thirdAddon.physicsData.values.flags = PhysicsFlags.doChildrenCollision | PhysicsFlags.isTrapezoid;
        this.thirdAddon.styleData.values.flags |= StyleFlags.showsAboveParent;
        this.thirdAddon.styleData.values.color = Color.Barrel;

        this.thirdAddon.physicsData.values.sides = 2;
        this.thirdAddon.physicsData.values.width = barrel.physicsData.values.width * 1;
        this.thirdAddon.physicsData.values.size = barrel.physicsData.values.size - this.secondAddon.physicsData.values.size/1.5;
        this.thirdAddon.positionData.values.x = (-barrel.physicsData.values.size + this.thirdAddon.physicsData.values.size) / 2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width * 1.25;
        this.physicsData.size = this.barrelEntity.physicsData.values.size;
        this.positionData.x = (-this.barrelEntity.physicsData.values.size + this.physicsData.values.size)/ 2;
        this.secondAddon.physicsData.sides = 2;
        this.secondAddon.physicsData.width = this.barrelEntity.physicsData.values.width * 1.75;
        this.secondAddon.physicsData.size = this.barrelEntity.tank.sizeFactor * 15;
        this.secondAddon.positionData.x = (this.barrelEntity.physicsData.values.size + this.secondAddon.physicsData.values.size) / 2;
        this.thirdAddon.physicsData.sides = 2;
        this.thirdAddon.physicsData.width = this.barrelEntity.physicsData.values.width * 1;
        this.thirdAddon.physicsData.size = this.barrelEntity.physicsData.values.size - this.secondAddon.physicsData.values.size/1.5;
        this.thirdAddon.positionData.x = (-this.barrelEntity.physicsData.values.size + this.thirdAddon.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}

/** Minion launcher - added onto spawners */
export class MinionLauncherAddon extends BarrelAddon {
    /** The actual trap launcher entity */
    public launcherEntity: MinionLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        this.launcherEntity = new MinionLauncher(owner);
    }
}

export class PurpleBarrelAddon extends BarrelAddon {
    public constructor(owner: Barrel) {
        super(owner);
        owner.styleData.color = Color.TeamPurple;
    }
}

export class NoScaleTrapLauncher extends ObjectEntity {
    /** The barrel that this trap launcher is placed on. */
    public barrelEntity: Barrel;

    /** Resizes the trap launcher; when its barrel owner gets bigger, the trap launcher must as well. */
    public constructor(barrel: Barrel) {
        super(barrel.game);

        this.barrelEntity = barrel;
        this.setParent(barrel);
        this.relationsData.values.team = barrel;
        this.physicsData.values.flags = PhysicsFlags.isTrapezoid | PhysicsFlags.doChildrenCollision;
        this.styleData.values.color = Color.Barrel;

        this.physicsData.values.sides = 2;
        this.physicsData.values.width = barrel.physicsData.values.width;
        this.physicsData.values.size = (42 * this.barrelEntity.tank.sizeFactor) * (20 / 42);
        this.positionData.values.x = (barrel.physicsData.values.size + this.physicsData.values.size) / 2;
    }

    public resize() {
        this.physicsData.sides = 2;
        this.physicsData.width = this.barrelEntity.physicsData.values.width;
        this.physicsData.size = (42 * this.barrelEntity.tank.sizeFactor) * (20 / 42);
        this.positionData.x = (this.barrelEntity.physicsData.values.size + this.physicsData.values.size) / 2;
    }


    public tick(tick: number) {
        super.tick(tick);

        this.resize();
    }
}
export class NoScaleTrapLauncherAddon extends BarrelAddon {
    /** The actual trap launcher entity */
    public launcherEntity: NoScaleTrapLauncher;

    public constructor(owner: Barrel) {
        super(owner);

        //this.launcherEntity = new StrikerLauncher(owner);
        this.launcherEntity = new NoScaleTrapLauncher(owner);
    }
}

/**
 * All barrel addons in the game by their ID.
 */
 export const BarrelAddonById: Record<barrelAddonId, typeof BarrelAddon | null> = {
    bombLauncher: BombLauncherAddonAddon,
    claymoreLauncher: ClaymoreLauncherAddon,
    reversetrap : StrikerAddon,
    engineerLauncher: EngineerLauncherAddon,
    trapLauncher: TrapLauncherAddon,
    noScaleTrapLauncher: NoScaleTrapLauncherAddon,
    minionLauncher: MinionLauncherAddon,
    purplebarrel: PurpleBarrelAddon
}
