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

import Client from "../Client";
import { PhysicsFlags, Color, StyleFlags, Tank, PositionFlags, Stat, StatCount, scoreToLevel} from "../Const/Enums";
import Portal from "../Entity/Misc/Portal";
import PrimeCelesial from "../Entity/Misc/PrimeCelesial";
import TeamBase from "../Entity/Misc/TeamBase";
import { TeamEntity } from "../Entity/Misc/TeamEntity";
import ShapeManager from "../Entity/Shape/Manager";
import TankBody from "../Entity/Tank/TankBody";
import GameServer from "../Game";
import ArenaEntity, { ArenaState } from "../Native/Arena";
import ClientCamera, { CameraEntity } from "../Native/Camera";
import { SandboxShapeManager } from "./Sandbox";

/**
 * Sanctuary Gamemode Arena
 */
const baseWidth = 3000;

class CustomShapeManager extends SandboxShapeManager {
    protected get wantedShapes() {
        let i = 0;
        for (const client of this.game.clients) {
            if (client.camera) i += 1;
        }
        return 0;
    }
}

export default class SanctuaryArena extends ArenaEntity {
    static override GAMEMODE_ID: string = "sanctuary";
    public celestial = new TeamEntity(this.game, Color.EnemyCrasher)
	protected shapes: ShapeManager = new CustomShapeManager(this);
    public celestialTeamBase: TeamBase;

    public playerTeamMap: Map<Client, TeamBase> = new Map();

    public constructor(game: GameServer) {
        super(game);
        this.ARENA_COLORS = {
            base: 0x585858,
            border: 0x000000,
            borderAlpha: 0.2,
            grid: 0x000000,
            gridAlpha: 0.5,
            miniMapColor: 0x585858,
            miniMapBorderColor: 0x3F3F3F
        }
        this.updateBounds(8000, 8000);
        this.state = ArenaState.OPEN; // FFA should start instantly, no countdown
        this.celestialTeamBase = new TeamBase(game, this.celestialTeam, 0,0, 3000,3000, true, 0, 0);
        new PrimeCelesial(this, this.celestialTeamBase)
        //new Portal(this.game, 0, 3000, 500,500, "teams")
    }

    public tick(tick: number) {
        super.tick(tick);
        if(tick % 900 == 0){
        }
    }

    public actuallySpawnPlayer(tank: TankBody, client: Client) {
        const base = this.playerTeamMap.get(client) || [this.celestialTeamBase][0];
        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        if(!tank.isCelestial) {
            tank.isCelestial = true;
            client.resetStatQueue();
            tank.setTank(Tank.Nova);
            if (client.camera) {
                for(let i = 0; i < StatCount; ++i) {
                    client.camera.cameraData.statLevels[i as Stat] = 0;
                }
                client.camera.cameraData.values.statsAvailable = ClientCamera.calculateStatCountCelestial(tank.cameraEntity.cameraData.values.level);
            }
        }
        this.spawnCelestials(tank, client)
    }

    public spawnCelestials(tank: TankBody, client: Client) {
        const xOffset = (Math.random() - 0.5) * baseWidth;
        const base = this.playerTeamMap.get(client) || [this.celestialTeamBase][0];
        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        tank.positionData.values.y = base.positionData.values.y + xOffset;
        this.playerTeamMap.set(client, base);
        if (client.camera) client.camera.relationsData.team = tank.relationsData.values.team;
    }
}