import { encode, type ClientTransport } from "../core.js";
import type { LeaderboardEntry } from "../types.js";

export class LeaderboardResource {
	constructor(private readonly transport: ClientTransport) {}
	getRange(input: { start?: number; range?: number } = {}) {
		return this.transport.get<LeaderboardEntry[]>("/leaderboard/range", {
			query: input,
		});
	}
	getAroundUser(input: { userId: string }) {
		return this.transport.get<LeaderboardEntry[]>(
			`/leaderboard/aroundUser/${encode(input.userId)}`,
		);
	}
	forSeason(input: { seasonGuid: string; start?: number; limit?: number }) {
		const { seasonGuid, ...query } = input;
		return this.transport.get<LeaderboardEntry[]>(
			`/seasons/${encode(seasonGuid)}/leaderboard`,
			{ query },
		);
	}
}
