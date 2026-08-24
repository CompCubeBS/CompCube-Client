import { encode, type ClientTransport } from "../core.js";
import type { Flair } from "../types.js";

export type FlairWrite = Partial<Pick<Flair, "name" | "imageUrl" | "color">>;
export class FlairsResource {
	constructor(private readonly transport: ClientTransport) {}
	list() {
		return this.transport.get<Flair[]>("/flairs");
	}
	get(input: { flairGuid: string }) {
		return this.transport.get<Flair>(`/flairs/${encode(input.flairGuid)}`);
	}
	create(input: FlairWrite & { name: string }) {
		return this.transport.post<Flair>("/flairs", { body: input });
	}
	update(input: FlairWrite & { flairGuid: string }) {
		const { flairGuid, ...body } = input;
		return this.transport.patch<Flair>(`/flairs/${encode(flairGuid)}`, {
			body,
		});
	}
	remove(input: { flairGuid: string }) {
		return this.transport.delete<void>(
			`/flairs/${encode(input.flairGuid)}`,
		);
	}
}
