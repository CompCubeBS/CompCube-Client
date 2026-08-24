import type { ClientTransport } from "../core.js";
import type { User } from "../types.js";

export interface HealthResponse {
	ok: boolean;
	service?: string;
	timestamp?: string;
}
export interface ServerStatusResponse {
	status: string;
	supportedPluginVersions: string[];
	time: string;
}
export class ServerResource {
	constructor(private readonly transport: ClientTransport) {}
	health() {
		return this.transport.get<HealthResponse>("/health");
	}
	getStatus() {
		return this.transport.get<ServerStatusResponse>("/server/status");
	}
	contributors() {
		return this.transport.get<User[]>("/contributors");
	}
	getContributors() {
		return this.contributors();
	}
	openApi() {
		return this.transport.get<Record<string, unknown>>("/openapi.json");
	}
	asyncApi() {
		return this.transport.get<Record<string, unknown>>("/socket-docs.json");
	}
	template() {
		return this.transport.get<Record<string, unknown>>("/function_here");
	}
}
