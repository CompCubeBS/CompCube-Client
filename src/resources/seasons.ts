import { encode, type ClientTransport } from "../core.js";
import type { Season } from "../types.js";

export type SeasonWrite = Partial<
	Pick<
		Season,
		| "id"
		| "name"
		| "description"
		| "isCurrent"
		| "startingMmr"
		| "startsAt"
		| "endsAt"
	>
>;
export class SeasonsResource {
	constructor(private readonly transport: ClientTransport) {}
	current() {
		return this.transport.get<Season>("/seasons/current");
	}
	list() {
		return this.transport.get<Season[]>("/seasons");
	}
	get(input: { seasonGuid: string }) {
		return this.transport.get<Season>(
			`/seasons/${encode(input.seasonGuid)}`,
		);
	}
	create(
		input: SeasonWrite & { id: string; name: string; startsAt: string },
	) {
		return this.transport.post<Season>("/seasons", { body: input });
	}
	update(input: SeasonWrite & { seasonGuid: string }) {
		const { seasonGuid, ...body } = input;
		return this.transport.patch<Season>(`/seasons/${encode(seasonGuid)}`, {
			body,
		});
	}
	finish(input: { seasonGuid: string; endedAt?: string }) {
		return this.transport.post<Season>(
			`/seasons/${encode(input.seasonGuid)}/finish`,
			{ body: input.endedAt ? { endedAt: input.endedAt } : {} },
		);
	}
	remove(input: { seasonGuid: string }) {
		return this.transport.delete<void>(
			`/seasons/${encode(input.seasonGuid)}`,
		);
	}
}
