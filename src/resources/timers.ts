import { encode, type ClientTransport } from "../core.js";
import type { MatchTimer } from "../types.js";

export class TimersResource {
	constructor(private readonly transport: ClientTransport) {}
	list(input: { matchGuid: string }) {
		return this.transport.get<MatchTimer[]>(
			`/matches/${encode(input.matchGuid)}/timers`,
		);
	}
	create(input: {
		matchGuid: string;
		dueAt: string;
		idempotencyKey: string;
		payload?: Record<string, unknown>;
	}) {
		const { matchGuid, ...body } = input;
		return this.transport.post<MatchTimer>(
			`/matches/${encode(matchGuid)}/timers`,
			{ body: { ...body, kind: "custom" } },
		);
	}
	skip(input: { matchGuid: string; timerGuid: string }) {
		return this.transport.post<{ skipped: boolean }>(
			`/matches/${encode(input.matchGuid)}/timers/${encode(input.timerGuid)}/skip`,
		);
	}
	updatePlaceholder(input: {
		timerGuid: string;
		body: Record<string, unknown>;
	}) {
		return this.transport.patch<MatchTimer>(
			`/timers/${encode(input.timerGuid)}`,
			{ body: input.body },
		);
	}
	cancel(input: { timerGuid: string }) {
		return this.transport.delete<void>(
			`/timers/${encode(input.timerGuid)}`,
		);
	}
}
