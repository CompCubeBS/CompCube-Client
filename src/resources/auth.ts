import type { ClientTransport } from "../core.js";
import type { AccountResponse, OAuthToken } from "../types.js";

export class AuthResource {
	constructor(private readonly transport: ClientTransport) {}
	/** Backend-owned OAuth entrypoint. It creates and verifies state without exposing secrets. */
	loginUrl(
		input: { returnTo?: string; mode?: "redirect" | "json" } = {},
	): string {
		const url = new URL(`${this.transport.getBaseUrl()}/oauth/login`);
		if (input.returnTo) url.searchParams.set("returnTo", input.returnTo);
		if (input.mode) url.searchParams.set("mode", input.mode);
		return url.toString();
	}
	login(input: { returnTo?: string; mode?: "redirect" | "json" } = {}) {
		return this.transport.get<void>("/oauth/login", {
			query: input,
			auth: false,
		});
	}
	callback(input: { code: string; state: string }) {
		return this.transport.get<OAuthToken & AccountResponse>(
			"/oauth/callback",
			{ query: input, auth: false },
		);
	}
	refresh(refreshToken?: string) {
		return this.transport.post<OAuthToken>("/oauth/refresh", {
			body: refreshToken ? { refreshToken } : undefined,
			auth: false,
			retryAuth: false,
		});
	}
	logout() {
		this.transport.setAuthToken(null);
		return this.transport.post<void>("/oauth/logout", {
			auth: false,
			retryAuth: false,
		});
	}
}
