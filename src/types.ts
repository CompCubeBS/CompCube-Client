export type Guid = string;
export type Permission =
	| "role:admin"
	| "role:dev"
	| "role:pooler"
	| "role:moderator"
	| "role:player"
	| "perk:supporter"
	| "perk:contributor";
export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
export type MapModifier =
	| "NF"
	| "NW"
	| "NB"
	| "NA"
	| "SS"
	| "FS"
	| "SFS"
	| "IF"
	| "4L"
	| "DA"
	| "GN"
	| "PM"
	| "SA"
	| "SN"
	| "ZM";
export type MatchStatus =
	| "waiting_players"
	| "awaiting_discards"
	| "awaiting_pick"
	| "countdown"
	| "playing"
	| "awaiting_scores"
	| "round_results"
	| "paused"
	| "completed"
	| "aborted";
export type MatchOutcome =
	| "completed"
	| "draw"
	| "aborted"
	| "forfeited"
	| "server_error"
	| "admin_decision"
	| "other";
export type ParticipantRole = "red" | "blue" | "spectator";
export type PlayerOneDecision =
	| "lowest_mmr_first"
	| "highest_mmr_first"
	| "random";
export type MapAction = "dealt" | "discarded" | "replacement" | "picked";
export type TimerKind =
	| "discard"
	| "pick"
	| "map_countdown"
	| "score_submission"
	| "round_results"
	| "disconnect_grace"
	| "custom";
export type TimerStatus =
	| "scheduled"
	| "processing"
	| "paused"
	| "completed"
	| "cancelled"
	| "failed";

export interface ApiErrorBody {
	error: { code: string; message: string };
}

export interface User {
	guid: Guid;
	beatKhanaGuid: Guid | null;
	discordId: string | null;
	platformId: string | null;
	username: string;
	avatarUrl: string | null;
	permissions: Permission[];
	banned: boolean;
	createdAt: string;
	updatedAt: string;
	competitiveStatistics?: CompetitiveStatistics[];
	matchParticipants?: MatchParticipant[];
	moderationActions?: UserModerationAction[];
}

export interface UserModerationAction {
	guid: Guid;
	userGuid: Guid;
	moderatorUserGuid: Guid | null;
	action: "timeout" | "ban";
	reason: string;
	disconnectPenalty: boolean;
	startsAt: string;
	endsAt: string | null;
	revokedAt: string | null;
	revokedByUserGuid: Guid | null;
	createdAt: string;
	moderator?: User | null;
	revokedBy?: User | null;
}

export interface Season {
	guid: Guid;
	id: string;
	name: string;
	description: string | null;
	isCurrent: boolean;
	startingMmr: number;
	startsAt: string;
	endsAt: string | null;
	activeRange?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CompetitiveStatistics {
	guid: Guid;
	userGuid: Guid;
	seasonGuid: Guid;
	currentMmr: number;
	startingMmr: number;
	endingMmr: number | null;
	wins: number;
	totalGames: number;
	winStreak: number;
	bestWinStreak: number;
	createdAt: string;
	updatedAt: string;
	user?: User;
	season?: Season;
}

export interface LeaderboardEntry {
	rank: number;
	userGuid: Guid;
	platformId?: string | null;
	username: string;
	avatarUrl: string | null;
	mmr: number;
	wins: number;
	totalGames: number;
	winStreak?: number;
}

export interface SeasonPool {
	guid: Guid;
	seasonGuid: Guid;
	name: string;
	imageUrl: string | null;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
	season?: Season;
	maps?: MapEntry[];
}

export interface Flair {
	guid: Guid;
	name: string;
	imageUrl: string | null;
	color: string | null;
	createdAt: string;
}

export interface MapEntry {
	guid: Guid;
	poolGuid: Guid;
	flairGuid: Guid | null;
	name: string;
	imageUrl: string | null;
	hash: string;
	key: string;
	characteristic: string;
	difficulty: Difficulty;
	modifiers: MapModifier[];
	durationSeconds: number;
	maxScore: number;
	createdAt: string;
	updatedAt: string;
	pool?: SeasonPool;
	flair?: Flair | null;
}

export interface Queue {
	guid: Guid;
	slug: string;
	name: string;
	poolGuid: Guid;
	competitive: boolean;
	enabled: boolean;
	minMmr: number;
	maxMmr: number;
	playerOneDecision: PlayerOneDecision;
	startingHealth: number;
	kFactor: number;
	opensAt: string | null;
	closesAt: string | null;
	createdAt: string;
	updatedAt: string;
	pool?: SeasonPool;
	players?: QueuedPlayer[];
	queuedPlayers?: number;
}

export interface QueuedPlayer {
	guid: Guid;
	queueGuid: Guid;
	userGuid: Guid;
	platformId: string;
	joinedAt: string;
	createdAt: string;
	user?: User;
	queue?: Queue;
}

export interface Match {
	guid: Guid;
	queueGuid: Guid | null;
	seasonGuid: Guid | null;
	poolGuid: Guid | null;
	status: MatchStatus;
	statusBeforePause: MatchStatus | null;
	outcomeKind: MatchOutcome | null;
	outcomeReason: string | null;
	winnerUserGuid: Guid | null;
	currentRound: number;
	competitive: boolean;
	startingHealth: number;
	kFactor: number;
	winnerMmrGain: number | null;
	loserMmrLoss: number | null;
	isMock: boolean;
	mockOwnerUserGuid: Guid | null;
	undone: boolean;
	version: number;
	startedAt: string | null;
	endedAt: string | null;
	createdAt: string;
	updatedAt: string;
	queue?: Queue | null;
	season?: Season | null;
	pool?: SeasonPool | null;
	winner?: User | null;
	participants?: MatchParticipant[];
	hands?: MatchHand[];
	rounds?: MatchRound[];
	mapActions?: MatchMapAction[];
	statusHistory?: MatchStatusHistory[];
	timers?: MatchTimer[];
}

export interface MatchParticipant {
	guid: Guid;
	matchGuid: Guid;
	userGuid: Guid;
	platformId: string;
	role: ParticipantRole;
	initialMmr: number;
	finalMmr: number | null;
	health: number;
	active: boolean;
	joinedAt: string;
	leftAt: string | null;
	createdAt: string;
	updatedAt: string;
	user?: User;
	match?: Match;
}

export interface MatchHandMap {
	handGuid: Guid;
	mapGuid: Guid;
	position: number;
	active: boolean;
	createdAt: string;
	map?: MapEntry;
}
export interface MatchHand {
	guid: Guid;
	matchGuid: Guid;
	userGuid: Guid;
	discardedAt: string | null;
	createdAt: string;
	user?: User;
	maps?: MatchHandMap[];
}
export interface MatchMapAction {
	guid: Guid;
	matchGuid: Guid;
	userGuid: Guid;
	mapGuid: Guid;
	roundNumber: number | null;
	action: MapAction;
	createdAt: string;
	user?: User;
	map?: MapEntry;
}

export interface MatchRound {
	guid: Guid;
	matchGuid: Guid;
	roundNumber: number;
	pickerUserGuid: Guid;
	mapGuid: Guid | null;
	winnerUserGuid: Guid | null;
	damageMultiplier: number;
	startedAt: string;
	scoreSubmissionDueAt: string | null;
	endedAt: string | null;
	createdAt: string;
	map?: MapEntry | null;
	picker?: User;
	winner?: User | null;
	scores?: MatchScore[];
}

export interface MatchScore {
	guid: Guid;
	roundGuid: Guid;
	userGuid: Guid;
	rawScore: number;
	modifiedScore: number;
	clientReportedModifiedScore: number | null;
	maxScore: number;
	accuracy: number;
	proMode: boolean;
	missCount: number;
	fullCombo: boolean;
	modifiers: MapModifier[];
	timedOut: boolean;
	noFailTriggered: boolean;
	healthBefore: number;
	damageTaken: number;
	healthAfter: number;
	submittedAt: string | null;
	createdAt: string;
	user?: User;
}

export interface MockClient {
	guid: Guid;
	ownerUserGuid: Guid;
	impersonatedUserGuid: Guid;
	matchGuid: Guid | null;
	connected: boolean;
	lastAction: string | null;
	lastActionAt: string | null;
	expiresAt: string;
	createdAt: string;
	impersonatedUser?: User;
	match?: Match | null;
}

export interface MatchStatusHistory {
	guid: Guid;
	matchGuid: Guid;
	fromStatus: MatchStatus | null;
	toStatus: MatchStatus;
	reason: string | null;
	actorUserGuid: Guid | null;
	metadata: Record<string, unknown>;
	createdAt: string;
	actor?: User | null;
}
export interface MatchTimer {
	guid: Guid;
	matchGuid: Guid;
	kind: TimerKind;
	status: TimerStatus;
	dueAt: string;
	pausedRemainingMs: number | null;
	idempotencyKey: string;
	payload: Record<string, unknown>;
	leaseOwner: string | null;
	leaseExpiresAt: string | null;
	attempts: number;
	lastError: string | null;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AccountResponse {
	user: User;
	canQueue: boolean;
	linkingUrl: string | null;
}
export interface OAuthToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}
export interface Playlist {
	playlistTitle: string;
	playlistAuthor: string;
	songs: Array<{
		hash: string;
		difficulties: Array<{ characteristic: string; name: Difficulty }>;
	}>;
}

// Compatibility aliases for applications migrating from the C# API client.
export type UserInfo = User;
export type Contributor = User;
export type MapPoolEntry = MapEntry;
export type MapDifficultyName = Difficulty;
export type MapCategoryName = string;
