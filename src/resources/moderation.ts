import { encode, type ClientTransport } from "../core.js";
import type { User, UserModerationAction } from "../types.js";

export type AdminDecisionAction = "forfeit" | "set_health" | "declare_winner";
export class ModerationResource {
	constructor(private readonly transport: ClientTransport) {}
	abort(input: { matchGuid: string; reason: string }) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/abort`,
			{ body: { reason: input.reason } },
		);
	}
	pause(input: { matchGuid: string; reason?: string }) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/pause`,
			{ body: { reason: input.reason } },
		);
	}
	resume(input: { matchGuid: string; reason?: string }) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/resume`,
			{ body: { reason: input.reason } },
		);
	}
	decision(input: {
		matchGuid: string;
		action: AdminDecisionAction;
		targetUserGuid?: string;
		health?: number;
		winnerUserGuid?: string;
		winnerMmrGain?: number;
		loserMmrLoss?: number;
		reason: string;
	}) {
		const { matchGuid, ...body } = input;
		return this.transport.post<void>(
			`/matches/${encode(matchGuid)}/decision`,
			{ body },
		);
	}
	undoResult(input: { matchGuid: string; reason?: string }) {
		return this.transport.post<void>(
			`/matches/${encode(input.matchGuid)}/undo-result`,
			{ body: { reason: input.reason } },
		);
	}
	adjustResult(input: {
		matchGuid: string;
		winnerMmrGain: number;
		loserMmrLoss: number;
	}) {
		const { matchGuid, ...body } = input;
		return this.transport.patch<void>(
			`/matches/${encode(matchGuid)}/result`,
			{ body },
		);
	}
	timeouts(input: { userGuid: string }) {
		return this.transport.get<UserModerationAction[]>(`/users/${encode(input.userGuid)}/timeouts`);
	}
	timeout(input: { userGuid: string; reason: string; durationMinutes?: number; endsAt?: string | Date }) {
		const { userGuid, endsAt, ...body } = input;
		return this.transport.post<UserModerationAction>(`/users/${encode(userGuid)}/timeouts`, {
			body: { ...body, endsAt: endsAt instanceof Date ? endsAt.toISOString() : endsAt },
		});
	}
	removeTimeouts(input: { userGuid: string }) {
		return this.transport.delete<{ revoked: UserModerationAction[] }>(`/users/${encode(input.userGuid)}/timeouts/active`);
	}
	ban(input: { userGuid: string; reason: string }) {
		return this.transport.put<User>(`/users/${encode(input.userGuid)}/ban`, { body: { reason: input.reason } });
	}
	unban(input: { userGuid: string }) {
		return this.transport.delete<User>(`/users/${encode(input.userGuid)}/ban`);
	}
}
