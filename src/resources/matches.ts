import { encode, type ClientTransport } from "../core.js";
import type {
	Match,
	MatchAuditEvent,
	MatchHand,
	MatchMapAction,
	MatchParticipant,
	MatchStatusHistory,
	ParticipantRole,
} from "../types.js";

export class MatchesResource {
	constructor(private readonly transport: ClientTransport) {}
	list(
		input: {
			userGuid?: string;
			status?: string;
			limit?: number;
			offset?: number;
			includeMock?: boolean;
		} = {},
	) {
		return this.transport.get<Match[]>("/matches", { query: input });
	}
	get(input: { matchGuid: string }) {
		return this.transport.get<Match>(`/matches/${encode(input.matchGuid)}`);
	}
	hands(input: { matchGuid: string }) {
		return this.transport.get<MatchHand[]>(
			`/matches/${encode(input.matchGuid)}/hands`,
		);
	}
	mapActions(input: { matchGuid: string }) {
		return this.transport.get<MatchMapAction[]>(
			`/matches/${encode(input.matchGuid)}/map-actions`,
		);
	}
	auditEvents(input: { matchGuid: string }) {
		return this.transport.get<MatchAuditEvent[]>(
			`/matches/${encode(input.matchGuid)}/audit-events`,
		);
	}
	participants(input: { matchGuid: string }) {
		return this.transport.get<MatchParticipant[]>(
			`/matches/${encode(input.matchGuid)}/participants`,
		);
	}
	statusHistory(input: { matchGuid: string }) {
		return this.transport.get<MatchStatusHistory[]>(
			`/matches/${encode(input.matchGuid)}/status-history`,
		);
	}
	create(input: Partial<Match>) {
		return this.transport.post<Match>("/matches", { body: input });
	}
	addParticipant(input: {
		matchGuid: string;
		userGuid: string;
		role: ParticipantRole;
		initialMmr: number;
	}) {
		const { matchGuid, ...body } = input;
		return this.transport.post<MatchParticipant>(
			`/matches/${encode(matchGuid)}/participants`,
			{ body },
		);
	}
	removeParticipant(input: { matchGuid: string; userGuid: string }) {
		return this.transport.delete<void>(
			`/matches/${encode(input.matchGuid)}/participants/${encode(input.userGuid)}`,
		);
	}
	discardRestPlaceholder(input: { matchGuid: string; mapGuids: string[] }) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/discards`,
			{ body: { mapGuids: input.mapGuids } },
		);
	}
}
