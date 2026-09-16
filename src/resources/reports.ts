import { encode, type ClientTransport } from "../core.js";
import type { Report, ReportFilter, ReportSource } from "../types.js";

/** Player reporting and moderator review operations. */
export class ReportsResource {
	constructor(private readonly transport: ClientTransport) {}

	/**
	 * Creates a general player report. Match context is optional, so this works
	 * from profiles and for match participants or spectators.
	 */
	create(input: {
		targetUserGuid: string;
		reason: string;
		source: ReportSource;
		associatedMatchGuid?: string;
	}) {
		return this.transport.post<Report>("/report", { body: input });
	}

	/** Moderator-only report queue, optionally filtered by resolution state. */
	list(input: { filter?: ReportFilter } = {}) {
		return this.transport.get<Report[]>("/reports", { query: input });
	}

	/** Moderator-only report history for a target user. */
	forUser(input: { userGuid: string }) {
		return this.transport.get<Report[]>(`/reports/${encode(input.userGuid)}`);
	}

	/** Moderator-only report resolution operation. */
	resolve(input: { reportGuid: string }) {
		return this.transport.post<Report>(`/report/${encode(input.reportGuid)}/resolve`);
	}
}
