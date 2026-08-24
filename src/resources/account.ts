import type { ClientTransport } from "../core.js";
import type { AccountResponse, Permission, User } from "../types.js";

export class AccountResource {
	constructor(private readonly transport: ClientTransport) {}
	me() {
		return this.transport.get<AccountResponse>("/account/me");
	}
	linkPlatform() {
		return this.transport.post<AccountResponse>("/account/link-platform");
	}
	update(input: Partial<Pick<User, "username" | "avatarUrl">>) {
		return this.transport.patch<User>("/account/me", { body: input });
	}
	remove() {
		return this.transport.delete<void>("/account/me");
	}
	hasPermission(
		user: Pick<User, "permissions"> | null | undefined,
		...permissions: Permission[]
	) {
		return Boolean(
			user?.permissions.some((permission) =>
				permissions.includes(permission),
			),
		);
	}
}
