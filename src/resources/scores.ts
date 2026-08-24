import { encode, type ClientTransport } from "../core.js";
import type { MatchScore } from "../types.js";

export class ScoresResource {
	constructor(private readonly transport: ClientTransport) {}
	updatePlaceholder(input: { scoreGuid: string; body: Partial<MatchScore> }) {
		return this.transport.patch<MatchScore>(
			`/scores/${encode(input.scoreGuid)}`,
			{ body: input.body },
		);
	}
	removePlaceholder(input: { scoreGuid: string }) {
		return this.transport.delete<void>(
			`/scores/${encode(input.scoreGuid)}`,
		);
	}
}
