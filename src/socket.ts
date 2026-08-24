import {
	io,
	type ManagerOptions,
	type Socket,
	type SocketOptions,
} from "socket.io-client";
import type { ClientTransport } from "./core.js";
import type {
	MapEntry,
	Match,
	MatchParticipant,
	MatchScore,
	MatchStatus,
	MatchTimer,
} from "./types.js";

export interface SocketAck<T> {
	ok: true;
	data: T;
}
export interface SocketAckError {
	ok: false;
	error: { code: string; message: string };
}
export class CompCubeSocketError extends Error {
	constructor(
		public readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "CompCubeSocketError";
	}
}

export interface ClientSocketEvents {
	hello: {
		input: { message?: string };
		output: {
			message: string;
			userGuid: string | null;
			serverTime: string;
		};
	};
	joinQueue: {
		input: { queue: string };
		output: { queueGuid: string; joinedAt: string; mmr: number; matched: boolean; matchGuid: string | null };
	};
	leaveQueue: { input: Record<string, never>; output: { removed: boolean } };
	clientDisconnect: {
		input: Record<string, never>;
		output: { removedFromQueue: boolean; forfeitedMatchGuid: string | null };
	};
	forfeit: {
		input: { matchGuid: string; reason?: string };
		output: { winnerUserGuid: string; loserUserGuid: string; winnerMmrGain: number; loserMmrLoss: number; timeoutMinutes: number };
	};
	discardMaps: {
		input: { matchGuid: string; mapGuids: string[] };
		output: { acceptedMapGuids: string[] };
	};
	skipTimer: {
		input: { matchGuid: string; timerGuid: string };
		output: { skipped: boolean };
	};
	selectMap: {
		input: { matchGuid: string; mapGuid: string };
		output: { roundGuid: string; mapGuid: string; scoreDueAt: string };
	};
	submitScore: {
		input: {
			matchGuid: string;
			roundGuid: string;
			rawScore: number;
			modifiedScore: number;
			noFailTriggered: boolean;
			proMode: boolean;
			missCount: number;
			fullCombo: boolean;
		};
		output: { accepted: boolean; accuracy: number; resolved: boolean };
	};
	getMatchState: {
		input: { matchGuid: string };
		output: {
			match: Match;
			participants: MatchParticipant[];
			timers: MatchTimer[];
		};
	};
	watchMatch: { input: { matchGuid: string }; output: { watching: boolean } };
	pauseMatch: {
		input: { matchGuid: string };
		output: { status: "paused"; version: number };
	};
	resumeMatch: {
		input: { matchGuid: string };
		output: { status: string; version: number };
	};
	adminDecision: {
		input: {
			matchGuid: string;
			action:
				| "force_pick"
				| "force_score"
				| "forfeit"
				| "abort"
				| "set_health"
				| "declare_winner";
			targetUserGuid?: string;
			payload?: Record<string, unknown>;
			reason: string;
		};
		output: { accepted: boolean };
	};
}

export interface PacketUser {
	guid: string;
	platformId: string;
	username: string;
	avatarUrl: string | null;
}

export interface ServerSocketEvents {
	matchCreated: {
		matchGuid: string;
		red: PacketUser;
		blue: PacketUser;
		initialMaps: MapEntry[];
		timerDueAt: string | null;
	};
	cardsUpdated: {
		matchGuid: string;
		maps: MapEntry[];
	};
	pickPhaseStarted: {
		matchGuid: string;
		roundNumber: number;
		isOwnPick: boolean;
		availableMaps: MapEntry[];
		damageMultiplier: number;
		timerDueAt: string | null;
	};
	playerSelectedMap: {
		matchGuid: string;
		roundNumber: number;
		pickerUserGuid: string;
		map: MapEntry;
	};
	roundStarted: {
		matchGuid: string;
		roundGuid: string;
		roundNumber: number;
		startsAt: string;
	};
	startMap: {
		matchGuid: string;
		roundGuid: string;
		map: MapEntry;
		scoreDueAt: string;
	};
	roundResults: {
		matchGuid: string;
		roundGuid: string;
		winnerUserGuid: string | null;
		redHealth: number;
		blueHealth: number;
		scores: MatchScore[];
	};
	timerUpdated: { matchGuid: string; timer: MatchTimer };
	matchPaused: { matchGuid: string; previousStatus: MatchStatus };
	matchResumed: { matchGuid: string; status: MatchStatus };
	matchFinished: {
		matchGuid: string;
		result: "win" | "loss" | "draw";
		winnerUserGuid: string | null;
		outcome: string;
		mmrChange: number;
		reason: string | null;
	};
	opponentDisconnected: {
		matchGuid: string;
		userGuid: string;
		reconnectDueAt: string | null;
	};
	serverError: { code: string; message: string };
}

export class CompCubeSocket {
	private socket?: Socket;
	constructor(
		private readonly url: string,
		private readonly transport: ClientTransport,
		private readonly options: Partial<ManagerOptions & SocketOptions> = {},
	) {}

	get connected(): boolean {
		return this.socket?.connected ?? false;
	}
	get id(): string | undefined {
		return this.socket?.id;
	}

	async connect(extraAuth: Record<string, unknown> = {}): Promise<void> {
		const accessToken = await this.transport.resolveAuthToken();
		if (!this.socket) {
			this.socket = io(this.url, {
				...this.options,
				autoConnect: false,
				auth: { ...extraAuth, ...(accessToken ? { accessToken } : {}) },
			});
		} else {
			this.socket.auth = {
				...extraAuth,
				...(accessToken ? { accessToken } : {}),
			};
		}
		if (this.socket.connected) return;
		await new Promise<void>((resolve, reject) => {
			const connected = () => {
				cleanup();
				resolve();
			};
			const failed = (error: Error) => {
				cleanup();
				reject(error);
			};
			const cleanup = () => {
				this.socket?.off("connect", connected);
				this.socket?.off("connect_error", failed);
			};
			this.socket?.once("connect", connected);
			this.socket?.once("connect_error", failed);
			this.socket?.connect();
		});
	}

	disconnect(): void {
		this.socket?.disconnect();
	}

	emit<K extends keyof ClientSocketEvents>(
		event: K,
		input: ClientSocketEvents[K]["input"],
		timeoutMs = 15_000,
	): Promise<ClientSocketEvents[K]["output"]> {
		if (!this.socket?.connected)
			return Promise.reject(
				new CompCubeSocketError(
					"SOCKET_DISCONNECTED",
					"The CompCube socket is not connected",
				),
			);
		return new Promise((resolve, reject) => {
			this.socket!.timeout(timeoutMs).emit(
				event,
				input,
				(
					timeoutError: Error | null,
					ack?:
						| SocketAck<ClientSocketEvents[K]["output"]>
						| SocketAckError,
				) => {
					if (timeoutError) {
						reject(
							new CompCubeSocketError(
								"ACK_TIMEOUT",
								"The server did not acknowledge the packet in time",
							),
						);
						return;
					}
					if (!ack) {
						reject(
							new CompCubeSocketError(
								"INVALID_ACK",
								"The server returned an invalid acknowledgement",
							),
						);
						return;
					}
					if (!ack.ok) {
						reject(
							new CompCubeSocketError(
								ack.error.code,
								ack.error.message,
							),
						);
						return;
					}
					resolve(ack.data);
				},
			);
		});
	}

	on<K extends keyof ServerSocketEvents>(
		event: K,
		listener: (payload: ServerSocketEvents[K]) => void,
	): () => void {
		if (!this.socket)
			throw new CompCubeSocketError(
				"SOCKET_NOT_INITIALISED",
				"Connect the socket before registering live events",
			);
		const socket = this.socket as unknown as {
			on(name: string, callback: (payload: unknown) => void): void;
			off(name: string, callback: (payload: unknown) => void): void;
		};
		const callback = (payload: unknown) =>
			listener(payload as ServerSocketEvents[K]);
		socket.on(event, callback);
		return () => socket.off(event, callback);
	}

	onConnection(
		listener: (connected: boolean, error?: Error) => void,
	): () => void {
		if (!this.socket)
			throw new CompCubeSocketError(
				"SOCKET_NOT_INITIALISED",
				"Connect the socket before registering connection events",
			);
		const connected = () => listener(true);
		const disconnected = () => listener(false);
		const failed = (error: Error) => listener(false, error);
		this.socket.on("connect", connected);
		this.socket.on("disconnect", disconnected);
		this.socket.on("connect_error", failed);
		return () => {
			this.socket?.off("connect", connected);
			this.socket?.off("disconnect", disconnected);
			this.socket?.off("connect_error", failed);
		};
	}
}
