import {
	ClientTransport,
	type CompCubeClientOptions,
	type RequestOptions,
} from "./core.js";
import { AccountResource } from "./resources/account.js";
import { AuthResource } from "./resources/auth.js";
import { MapCategoriesResource } from "./resources/mapCategories.js";
import { LeaderboardResource } from "./resources/leaderboard.js";
import { MapsResource } from "./resources/maps.js";
import { MatchesResource } from "./resources/matches.js";
import { ModerationResource } from "./resources/moderation.js";
import { MockClientsResource } from "./resources/mockClients.js";
import { PoolsResource } from "./resources/pools.js";
import { QueuesResource } from "./resources/queues.js";
import { RoundsResource } from "./resources/rounds.js";
import { ScoresResource } from "./resources/scores.js";
import { SeasonsResource } from "./resources/seasons.js";
import { ServerResource } from "./resources/server.js";
import { StatisticsResource } from "./resources/statistics.js";
import { TimersResource } from "./resources/timers.js";
import { UsersResource } from "./resources/users.js";
import { CompCubeSocket } from "./socket.js";

/** Typed client for the full CompCube REST and Socket.IO APIs. */
export class CompCubeClient {
	private readonly transport: ClientTransport;
	public readonly account: AccountResource;
	public readonly auth: AuthResource;
	public readonly mapCategories: MapCategoriesResource;
	public readonly leaderboard: LeaderboardResource;
	public readonly maps: MapsResource;
	public readonly matches: MatchesResource;
	public readonly moderation: ModerationResource;
	public readonly mockClients: MockClientsResource;
	public readonly pools: PoolsResource;
	public readonly queues: QueuesResource;
	/** Compatibility alias for the earlier singular resource name. */
	public readonly queue: QueuesResource;
	public readonly rounds: RoundsResource;
	public readonly scores: ScoresResource;
	public readonly seasons: SeasonsResource;
	public readonly server: ServerResource;
	public readonly statistics: StatisticsResource;
	public readonly timers: TimersResource;
	public readonly users: UsersResource;
	public readonly socket: CompCubeSocket;

	constructor(options: CompCubeClientOptions = {}) {
		this.transport = new ClientTransport(options);
		this.account = new AccountResource(this.transport);
		this.auth = new AuthResource(this.transport);
		this.mapCategories = new MapCategoriesResource(this.transport);
		this.leaderboard = new LeaderboardResource(this.transport);
		this.maps = new MapsResource(this.transport);
		this.matches = new MatchesResource(this.transport);
		this.moderation = new ModerationResource(this.transport);
		this.mockClients = new MockClientsResource(this.transport);
		this.pools = new PoolsResource(this.transport);
		this.queues = new QueuesResource(this.transport);
		this.queue = this.queues;
		this.rounds = new RoundsResource(this.transport);
		this.scores = new ScoresResource(this.transport);
		this.seasons = new SeasonsResource(this.transport);
		this.server = new ServerResource(this.transport);
		this.statistics = new StatisticsResource(this.transport);
		this.timers = new TimersResource(this.transport);
		this.users = new UsersResource(this.transport);
		const defaultSocketUrl = options.baseUrl
			? options.baseUrl.replace(/:\d+\/?$/, ":8008")
			: "https://api.compcube.net";
		this.socket = new CompCubeSocket(
			options.socketUrl ?? defaultSocketUrl,
			this.transport,
		);
	}

	setAuthToken(token?: string | null): this {
		this.transport.setAuthToken(token);
		return this;
	}
	getAuthToken(): string {
		return this.transport.getAuthToken();
	}
	request<T>(path: string, options: RequestOptions = {}) {
		return this.transport.request<T>(path, options);
	}
	data<T>(path: string, options: RequestOptions = {}) {
		return this.transport.data<T>(path, options);
	}
	get<T>(
		path: string,
		options: Omit<RequestOptions, "method" | "body"> = {},
	) {
		return this.transport.get<T>(path, options);
	}
	post<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.transport.post<T>(path, options);
	}
	put<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.transport.put<T>(path, options);
	}
	patch<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.transport.patch<T>(path, options);
	}
	delete<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.transport.delete<T>(path, options);
	}
}
