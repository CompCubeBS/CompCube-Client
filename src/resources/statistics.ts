import { encode, type ClientTransport } from "../core.js";
import type { CompetitiveStatistics } from "../types.js";

export type StatisticsUpdate = Partial<
	Pick<
		CompetitiveStatistics,
		| "currentMmr"
		| "startingMmr"
		| "endingMmr"
		| "wins"
		| "totalGames"
		| "winStreak"
		| "bestWinStreak"
	>
>;

export class StatisticsResource {
	constructor(private readonly transport: ClientTransport) {}
	forUser(input: { userGuid: string }) {
		return this.transport.get<CompetitiveStatistics[]>(
			`/users/${encode(input.userGuid)}/statistics`,
		);
	}
	get(input: { seasonGuid: string; userGuid: string }) {
		return this.transport.get<CompetitiveStatistics>(
			`/seasons/${encode(input.seasonGuid)}/statistics/${encode(input.userGuid)}`,
		);
	}
	update(input: StatisticsUpdate & { seasonGuid: string; userGuid: string }) {
		const { seasonGuid, userGuid, ...body } = input;
		return this.transport.patch<CompetitiveStatistics>(
			`/seasons/${encode(seasonGuid)}/statistics/${encode(userGuid)}`,
			{ body },
		);
	}
	setMmr(input: {
		seasonGuid: string;
		userGuid: string;
		currentMmr: number;
		startingMmr?: number;
	}) {
		return this.update(input);
	}
}
