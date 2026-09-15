import { encode, type ClientTransport } from "../core.js";
import type { Report, ReportFilter, ReportSource } from "../types.js";

/** Authenticated player reporting and moderator review operations. */
export class ReportsResource {
	constructor(private readonly transport: ClientTransport) {}

	/**
	 * Reports an opponent from a finished match. The API derives the sender from
	 * authentication and verifies both users were opposing competitors.
	 */
	create(input: {
		matchGuid: string;
		targetUserGuid: string;
		reason: string;
		source: ReportSource;
	}) {
		return this.transport.post<Report>("/report", {
			body: {
				targetUserGuid: input.targetUserGuid,
				associatedMatchGuid: input.matchGuid,
				reason: input.reason,
				source: input.source,
			},
		});
	}

	/** Moderator-only report queue, optionally filtered by resolution state. */
	list(input: { filter?: ReportFilter } = {}) {
		return this.transport.get<Report[]>("/reports", { query: input });
	}

	/** Moderator-only report history for a target user. */
	forUser(input: { userGuid: string }) {
		return this.transport.get<Report[]>(`/reports/${encode(input.userGuid)}`);
	}

	/** Moderator-only, idempotent resolution operation. */
	resolve(input: { reportGuid: string }) {
		return this.transport.post<Report>(`/report/${encode(input.reportGuid)}/resolve`);
	}
}
