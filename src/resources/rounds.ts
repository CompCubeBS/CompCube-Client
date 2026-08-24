import { encode, type ClientTransport } from "../core.js";
import type { MatchRound, MatchScore } from "../types.js";

export class RoundsResource {
	constructor(private readonly transport: ClientTransport) {}
	list(input: { matchGuid: string }) {
		return this.transport.get<MatchRound[]>(
			`/matches/${encode(input.matchGuid)}/rounds`,
		);
	}
	get(input: { matchGuid: string; roundGuid: string }) {
		return this.transport.get<MatchRound>(
			`/matches/${encode(input.matchGuid)}/rounds/${encode(input.roundGuid)}`,
		);
	}
	scores(input: { matchGuid: string; roundGuid: string }) {
		return this.transport.get<MatchScore[]>(
			`/matches/${encode(input.matchGuid)}/rounds/${encode(input.roundGuid)}/scores`,
		);
	}
	createRestPlaceholder(input: {
		matchGuid: string;
		body: Record<string, unknown>;
	}) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/rounds`,
			{ body: input.body },
		);
	}
	submitScoreRestPlaceholder(input: {
		matchGuid: string;
		roundGuid: string;
		body: Record<string, unknown>;
	}) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/rounds/${encode(input.roundGuid)}/scores`,
			{ body: input.body },
		);
	}
}
