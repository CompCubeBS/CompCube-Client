import { encode, type ClientTransport } from "../core.js";
import type {
	CompetitiveStatistics,
	MatchParticipant,
	Permission,
	User,
} from "../types.js";

export interface UpdateUserInput {
	banned?: boolean;
	permissions?: Permission[];
	username?: string;
	avatarUrl?: string | null;
	beatKhanaGuid?: string | null;
	discordId?: string | null;
	platformId?: string | null;
}

export class UsersResource {
	constructor(private readonly transport: ClientTransport) {}
	list() {
		return this.transport.get<User[]>("/users");
	}
	get(input: { userGuid: string }) {
		return this.transport.get<
			User & {
				competitiveStatistics?: CompetitiveStatistics[];
				matchParticipants?: MatchParticipant[];
			}
		>(`/users/${encode(input.userGuid)}`);
	}
	getByPlatformId(input: { platformId: string }) {
		return this.transport.get<User>(`/user/id/${encode(input.platformId)}`);
	}
	getById(input: { id: string }) {
		return this.getByPlatformId({ platformId: input.id });
	}
	getByDiscordId(input: { discordId: string }) {
		return this.transport.get<User>(
			`/user/discord/${encode(input.discordId)}`,
		);
	}
	matches(input: { userGuid: string }) {
		return this.transport.get<MatchParticipant[]>(
			`/users/${encode(input.userGuid)}/matches`,
		);
	}
	statistics(input: { userGuid: string }) {
		return this.transport.get<CompetitiveStatistics[]>(
			`/users/${encode(input.userGuid)}/statistics`,
		);
	}
	update(input: UpdateUserInput & { userGuid: string }) {
		const { userGuid, ...body } = input;
		return this.transport.patch<User>(`/users/${encode(userGuid)}`, {
			body,
		});
	}
	ban(input: { userGuid: string; banned?: boolean }) {
		return this.update({
			userGuid: input.userGuid,
			banned: input.banned ?? true,
		});
	}
	setPermissions(input: { userGuid: string; permissions: Permission[] }) {
		return this.update(input);
	}
	remove(input: { userGuid: string }) {
		return this.transport.delete<void>(`/users/${encode(input.userGuid)}`);
	}
}
