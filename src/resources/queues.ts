import { encode, type ClientTransport } from "../core.js";
import type { PlayerOneDecision, Queue, QueuedPlayer } from "../types.js";

export interface QueueWrite {
	slug?: string;
	name?: string;
	poolGuid?: string;
	competitive?: boolean;
	enabled?: boolean;
	minMmr?: number;
	maxMmr?: number;
	playerOneDecision?: PlayerOneDecision;
	startingHealth?: number;
	kFactor?: number;
	opensAt?: string | null;
	closesAt?: string | null;
}

export class QueuesResource {
	constructor(private readonly transport: ClientTransport) {}
	list() {
		return this.transport.get<Queue[]>("/queues");
	}
	get(input: { queueGuid: string }) {
		return this.transport.get<Queue>(`/queues/${encode(input.queueGuid)}`);
	}
	mine() {
		return this.transport.get<QueuedPlayer | null>("/queues/me");
	}
	members(input: { queueGuid: string }) {
		return this.transport.get<QueuedPlayer[]>(
			`/queues/${encode(input.queueGuid)}/members`,
		);
	}
	create(
		input: QueueWrite & { slug: string; name: string; poolGuid: string },
	) {
		return this.transport.post<Queue>("/queues", { body: input });
	}
	update(input: QueueWrite & { queueGuid: string }) {
		const { queueGuid, ...body } = input;
		return this.transport.patch<Queue>(`/queues/${encode(queueGuid)}`, {
			body,
		});
	}
	remove(input: { queueGuid: string }) {
		return this.transport.delete<void>(
			`/queues/${encode(input.queueGuid)}`,
		);
	}
	joinRestPlaceholder(input: { queueGuid: string }) {
		return this.transport.post<void>(
			`/queues/${encode(input.queueGuid)}/members/me`,
		);
	}
	leaveRestPlaceholder(input: { queueGuid: string }) {
		return this.transport.delete<void>(
			`/queues/${encode(input.queueGuid)}/members/me`,
		);
	}
	legacyList(input: { secret: string }) {
		return this.transport.get<unknown[]>("/queue", { query: input });
	}
	legacyCreateBatch(input: { secret: string; count: number; batch: number }) {
		return this.transport.put<void>("/queue/create-batch", {
			query: input,
		});
	}
}
