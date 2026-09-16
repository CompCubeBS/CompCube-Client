import { encode, type ClientTransport } from "../core.js";
import type { MockClient } from "../types.js";

export type MockClientAction =
	| { action: "discard"; mapGuids: string[] }
	| { action: "pick"; mapGuid: string }
	| { action: "score"; roundGuid: string; rawScore: number; modifiedScore: number; noFailTriggered?: boolean; proMode: boolean; missCount: number; fullCombo: boolean }
	| { action: "forfeit" | "disconnect" };

export class MockClientsResource {
	constructor(private readonly transport: ClientTransport) {}
	list() {
		return this.transport.get<MockClient[]>("/mock-clients/matches");
	}
	createMatch(input: { redPlatformId: string; bluePlatformId: string; queueGuid: string }) {
		return this.transport.post<{ clients: MockClient[] }>("/mock-clients/matches", { body: input });
	}
	createQueuedMatch(input: { mockPlatformId: string }) {
		return this.transport.post<{ client: MockClient }>("/mock-clients/matches/queued", { body: input });
	}
	action(input: { clientGuid: string; action: MockClientAction }) {
		return this.transport.post<unknown>(`/mock-clients/${encode(input.clientGuid)}/actions`, { body: input.action });
	}
}
