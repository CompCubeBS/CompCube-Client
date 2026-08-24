import { encode, type ClientTransport } from "../core.js";
import type { Difficulty, MapEntry, MapModifier, Playlist } from "../types.js";

export interface CreateMapInput {
	poolGuid: string;
	key: string;
	characteristic: string;
	difficulty: Difficulty;
	modifiers?: MapModifier[];
	flairGuid?: string | null;
}

export class MapsResource {
	constructor(private readonly transport: ClientTransport) {}
	hashes() {
		return this.transport.get<string[]>("/maps/hashes");
	}
	getHashes() {
		return this.hashes();
	}
	playlist() {
		return this.transport.get<Playlist>("/maps/playlist");
	}
	getPlaylist() {
		return this.playlist();
	}
	downloadUrl(input: { hash: string }) {
		return `${this.transport.getBaseUrl()}/maps/download/${encode(input.hash)}`;
	}
	download(input: { hash: string }) {
		return this.transport.get<Blob>(`/maps/download/${encode(input.hash)}`);
	}
	list(input: { poolGuid?: string } = {}) {
		return input.poolGuid
			? this.forPool({ poolGuid: input.poolGuid })
			: this.transport.get<MapEntry[]>("/maps");
	}
	getAll() {
		return this.list();
	}
	forPool(input: { poolGuid: string }) {
		return this.transport.get<MapEntry[]>(
			`/pools/${encode(input.poolGuid)}/maps`,
		);
	}
	get(input: { mapGuid: string }) {
		return this.transport.get<MapEntry>(`/maps/${encode(input.mapGuid)}`);
	}
	create(input: CreateMapInput) {
		const { poolGuid, ...body } = input;
		return this.transport.post<MapEntry>(
			`/pools/${encode(poolGuid)}/maps`,
			{ body },
		);
	}
	update(
		input: Partial<Pick<MapEntry, "flairGuid" | "modifiers">> & {
			mapGuid: string;
		},
	) {
		const { mapGuid, ...body } = input;
		return this.transport.patch<MapEntry>(`/maps/${encode(mapGuid)}`, {
			body,
		});
	}
	remove(input: { mapGuid: string }) {
		return this.transport.delete<void>(`/maps/${encode(input.mapGuid)}`);
	}
	/** Legacy C# map endpoint, retained while the server advertises it as a placeholder. */
	add(input: Record<string, unknown>) {
		return this.transport.post<void>("/maps", { body: input });
	}
	updateLegacy(input: {
		hash: string;
		currentDifficulty: Difficulty;
		body: Record<string, unknown>;
	}) {
		return this.transport.put<void>(
			`/maps/${encode(input.hash)}/${encode(input.currentDifficulty)}`,
			{ body: input.body },
		);
	}
	removeLegacy(input: { hash: string; difficulty: Difficulty }) {
		return this.transport.delete<void>(
			`/maps/${encode(input.hash)}/${encode(input.difficulty)}`,
		);
	}
}
