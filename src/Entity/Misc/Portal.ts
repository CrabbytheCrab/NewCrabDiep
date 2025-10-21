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
import { constrain } from "../../util";
import ObjectEntity from "../Object";
import { games, gamesMap } from "../../.";

import ClientCamera from "../../Native/Camera";
import TankBody from "../Tank/TankBody";

import { PhysicsFlags, Color } from "../../Const/Enums";
/**
 * Only used for maze walls and nothing else.
 */
export default class Portal extends ObjectEntity {
    public targetGameId: string | undefined;
    public constructor(game: GameServer, x: number, y: number, width: number = 750, height: number = 750, targetGameId?: string | undefined) {
        super(game);

        this.positionData.values.x = x;
        this.positionData.values.y = y;

        this.physicsData.values.width = width;
        this.physicsData.values.size = height;
        this.physicsData.values.sides = 2;
        this.physicsData.values.flags |= PhysicsFlags.showsOnMap;
        this.physicsData.values.pushFactor = 0;
        this.physicsData.values.absorbtionFactor = 0;

        this.styleData.values.borderWidth = 0;
        this.styleData.values.color = Color.kMaxColors; // Pure black
        
        this.targetGameId = 'ffa';
    }
    
    public intersects(entity: ObjectEntity): boolean {
        const dX = constrain(entity.positionData.values.x, this.positionData.values.x - this.physicsData.values.size / 2, this.positionData.values.x + this.physicsData.values.size / 2) - entity.positionData.values.x;
        const dY = constrain(entity.positionData.values.y, this.positionData.values.y - this.physicsData.values.width / 2, this.positionData.values.y + this.physicsData.values.width / 2) - entity.positionData.values.y;

        if (dX ** 2 + dY ** 2 <= entity.physicsData.size ** 2) return true;

        return false;
    }

    public tick(tick: number) {
        super.tick(tick);
        const entities = this.game.entities.collisionManager.retrieveEntitiesByEntity(this);
        let entityIntersects = false;
        for (let i = 0; i < entities.data.length; ++i) {
            let chunk = entities.data[i];

            while (chunk) {
                const bitValue = chunk & -chunk;
                const bitIdx = 31 - Math.clz32(bitValue);
                chunk ^= bitValue;
                const id = 32 * i + bitIdx;

                const entity = this.game.entities.inner[id] as ObjectEntity;

                if (!this.intersects(entity)) continue;

                if (entity instanceof TankBody) {
                    const camera = entity.cameraEntity;
                    if (!(camera instanceof ClientCamera)) return;
                    const target = this.targetGameId !== undefined ? gamesMap.get(this.targetGameId) : games[(Math.floor(Math.random() * games.length))];
                    target?.transferClient(camera.client);
                }
            }
        }
    }
}