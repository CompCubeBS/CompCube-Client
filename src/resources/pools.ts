import { encode, type ClientTransport } from "../core.js";
import type { SeasonPool } from "../types.js";

export type PoolWrite = Partial<
	Pick<SeasonPool, "seasonGuid" | "name" | "imageUrl" | "isPublic">
>;
export class PoolsResource {
	constructor(private readonly transport: ClientTransport) {}
	forSeason(input: { seasonGuid: string }) {
		return this.transport.get<SeasonPool[]>(
			`/seasons/${encode(input.seasonGuid)}/pools`,
		);
	}
	get(input: { poolGuid: string }) {
		return this.transport.get<SeasonPool>(
			`/pools/${encode(input.poolGuid)}`,
		);
	}
	create(input: PoolWrite & { seasonGuid: string; name: string }) {
		const { seasonGuid, ...body } = input;
		return this.transport.post<SeasonPool>(
			`/seasons/${encode(seasonGuid)}/pools`,
			{ body },
		);
	}
	update(input: PoolWrite & { poolGuid: string }) {
		const { poolGuid, ...body } = input;
		return this.transport.patch<SeasonPool>(`/pools/${encode(poolGuid)}`, {
			body,
		});
	}
	publish(input: { poolGuid: string; isPublic?: boolean }) {
		return this.update({
			poolGuid: input.poolGuid,
			isPublic: input.isPublic ?? true,
		});
	}
	remove(input: { poolGuid: string }) {
		return this.transport.delete<void>(`/pools/${encode(input.poolGuid)}`);
	}
}
