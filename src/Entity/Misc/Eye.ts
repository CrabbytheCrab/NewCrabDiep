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

import ObjectEntity from "../Object";

import { Color, InputFlags, PositionFlags, PhysicsFlags, StyleFlags } from "../../Const/Enums";
import { BarrelBase } from "../Tank/TankBody";


/**
 * Sclera of the eye, the actual eyeball entity.
 */
export default class Eye extends ObjectEntity {
    /** What the pupil should attach to. */
    public owner: BarrelBase;
    /** What the eye should attach to. */
    public socket: Socket;
    /** The pupil of the eye, what actually looks around. */
    public pupil: Pupil;
    /** Size of the eye, scales all related parts. */
    public eyeSize: number;

    public constructor(owner: BarrelBase, eyeColor: Color, eyeSize: number = 25, offsetX: number = 0, offsetY: number = 0) {
        super(owner.game);
        this.owner = owner;
        
        this.setParent(owner);
        this.relationsData.values.owner = owner;

        this.relationsData.values.team = owner.relationsData.values.team;

        this.physicsData.values.sides = 1;
        this.eyeSize = eyeSize;
        this.physicsData.values.size = this.eyeSize * this.sizeFactor;

        this.styleData.values.color = Color.kMaxColors;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;

        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        
        this.positionData.values.x += offsetX;
        this.positionData.values.y += offsetY;
        
        this.socket = new Socket(this);
        this.pupil = new Pupil(this, eyeColor);
    }
    
    /**
     * Size factor, used for calculation of the turret and base size.
     */
    public get sizeFactor() {
        return this.owner.sizeFactor;
    }

    public tick(tick: number) {
        this.physicsData.size = this.eyeSize * this.sizeFactor;
        this.styleData.opacity = this.owner.styleData.values.opacity;
    }
}


class Pupil extends ObjectEntity {
    /** The eye the pupil belongs to. */
    public eye: Eye;

    public constructor(eye: Eye, eyeColor: Color) {
        super(eye.game);

        this.eye = eye;
        
        this.setParent(eye);
        this.relationsData.values.owner = eye;

        this.relationsData.values.team = eye;

        this.physicsData.values.sides = 1;
        this.physicsData.values.size = this.eye.physicsData.values.size / 2;

        this.styleData.values.color = eyeColor;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;

        this.positionData.values.flags |= PositionFlags.absoluteRotation;
    }

    public tick(tick: number) {
        this.physicsData.size = this.eye.physicsData.values.size / 2;
        this.styleData.opacity = this.eye.styleData.values.opacity;
        
        const owner = this.eye.owner;
        if (owner.inputs.attemptingShot() || owner.inputs.attemptingRepel()) {
            const target = owner.inputs.mouse;
            const offset = this.eye.physicsData.values.size / 2;

            const flip = owner.inputs.attemptingRepel() ? -1 : 1;
            const { x, y } = this.getWorldPosition();

            const targetAngle = Math.atan2((target.y - y) * flip, (target.x - x) * flip);

            this.positionData.angle = targetAngle;
            this.positionData.y = Math.sin(targetAngle) * offset;
            this.positionData.x = Math.cos(targetAngle) * offset;
        } else {
            this.positionData.x = this.positionData.y = this.positionData.angle = this.eye.positionData.angle = 0;
        }
    }
}

/** Creates the illusion of a socket the eye sits in. */
class Socket extends ObjectEntity {
    /** What the pupil should attach to. */
    public eye: Eye;

    public constructor(eye: Eye) {
        super(eye.game);

        this.eye = eye;
        
        this.setParent(eye);
        this.relationsData.values.owner = eye;

        this.relationsData.values.team = eye.relationsData.values.team;

        this.physicsData.values.sides = 1;
        this.physicsData.values.size = this.eye.physicsData.values.size + this.eye.owner.styleData.values.borderWidth;

        this.styleData.values.color = this.eye.owner.styleData.values.color;

        this.positionData.values.flags |= PositionFlags.absoluteRotation;
    }

    public tick(tick: number) {
        this.physicsData.size = this.eye.physicsData.values.size + this.eye.owner.styleData.values.borderWidth;
        this.styleData.color = this.eye.owner.styleData.values.color;
        this.styleData.opacity = this.eye.styleData.values.opacity;
    }
}