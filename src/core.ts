import type { ApiErrorBody } from "./types.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type QueryValue = string | number | boolean | Date | null | undefined;
export type Query = Record<string, QueryValue>;

export interface CompCubeClientOptions {
	/** API origin. CompCube routes do not use an /api prefix. */
	baseUrl?: string;
	/** Socket.IO origin when it differs from the REST origin. */
	socketUrl?: string;
	/** Initial BeatKhana access token. Cookies are used automatically when omitted. */
	authToken?: string | null;
	/** Resolves the newest access token before authenticated REST and socket calls. */
	getAuthToken?: () =>
		| string
		| null
		| undefined
		| Promise<string | null | undefined>;
	/** Called once after a 401. Return a new access token to retry the request. */
	refreshAuth?: () =>
		| string
		| null
		| undefined
		| Promise<string | null | undefined>;
	/** Fetch implementation for SSR and tests. */
	fetch?: typeof globalThis.fetch;
	/** Fetch credentials policy. Defaults to include for secure OAuth cookies. */
	credentials?: RequestCredentials;
}

export interface RequestOptions {
	method?: HttpMethod;
	query?: Query;
	body?: unknown;
	headers?: HeadersInit;
	signal?: AbortSignal;
	auth?: boolean;
	retryAuth?: boolean;
}

export interface CompCubeResponse<T> extends Response {
	json(): Promise<T>;
}

export class CompCubeApiError<T = ApiErrorBody> extends Error {
	constructor(
		public readonly status: number,
		public readonly response: Response,
		public readonly body?: T,
	) {
		super(
			body && typeof body === "object" && "error" in body
				? String(
						(body as ApiErrorBody).error?.message ??
							`CompCube API request failed with status ${status}.`,
					)
				: `CompCube API request failed with status ${status}.`,
		);
		this.name = "CompCubeApiError";
	}
}

export class ClientTransport {
	private authToken = "";
	private readonly baseUrl: string;
	private readonly fetchImplementation: typeof globalThis.fetch;
	private readonly tokenProvider?: CompCubeClientOptions["getAuthToken"];
	private readonly authRefresher?: CompCubeClientOptions["refreshAuth"];
	private readonly credentials: RequestCredentials;

	constructor(options: CompCubeClientOptions = {}) {
		this.baseUrl = (options.baseUrl ?? "https://api.compcube.net").replace(
			/\/+$/,
			"",
		);
		this.fetchImplementation =
			options.fetch ?? globalThis.fetch.bind(globalThis);
		this.tokenProvider = options.getAuthToken;
		this.authRefresher = options.refreshAuth;
		this.credentials = options.credentials ?? "include";
		this.setAuthToken(options.authToken);
	}

	setAuthToken(token?: string | null): void {
		this.authToken = (token?.trim() ?? "").replace(/^Bearer\s+/i, "");
	}
	getAuthToken(): string {
		return this.authToken;
	}
	getBaseUrl(): string {
		return this.baseUrl;
	}

	async resolveAuthToken(): Promise<string> {
		const provided = await this.tokenProvider?.();
		if (provided !== undefined) this.setAuthToken(provided);
		return this.authToken;
	}

	async request<T>(
		path: string,
		options: RequestOptions = {},
	): Promise<CompCubeResponse<T>> {
		const response = await this.perform<T>(path, options);
		if (
			response.status !== 401 ||
			options.retryAuth === false ||
			!this.authRefresher
		)
			return response;
		const refreshed = await this.authRefresher();
		if (!refreshed) return response;
		this.setAuthToken(refreshed);
		return this.perform<T>(path, { ...options, retryAuth: false });
	}

	async data<T>(path: string, options: RequestOptions = {}): Promise<T> {
		return parseResponse(await this.request<T>(path, options));
	}

	get<T>(
		path: string,
		options: Omit<RequestOptions, "method" | "body"> = {},
	) {
		return this.request<T>(path, { ...options, method: "GET" });
	}
	post<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.request<T>(path, { ...options, method: "POST" });
	}
	put<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.request<T>(path, { ...options, method: "PUT" });
	}
	patch<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.request<T>(path, { ...options, method: "PATCH" });
	}
	delete<T>(path: string, options: Omit<RequestOptions, "method"> = {}) {
		return this.request<T>(path, { ...options, method: "DELETE" });
	}

	private async perform<T>(
		path: string,
		options: RequestOptions,
	): Promise<CompCubeResponse<T>> {
		const headers = new Headers(options.headers);
		const token = await this.resolveAuthToken();
		if (token && options.auth !== false && !headers.has("authorization"))
			headers.set("authorization", `Bearer ${token}`);
		let body = options.body as BodyInit | null | undefined;
		if (isJsonBody(body)) {
			headers.set("content-type", "application/json");
			body = JSON.stringify(body);
		}
		const request: RequestInit = {
			method: options.method ?? "GET",
			headers,
			credentials: this.credentials,
		};
		if (body !== undefined) request.body = body;
		if (options.signal) request.signal = options.signal;
		return this.fetchImplementation(
			this.createUrl(path, options.query),
			request,
		) as Promise<CompCubeResponse<T>>;
	}

	private createUrl(path: string, values: Query = {}): string {
		const url = /^https?:\/\//i.test(path)
			? new URL(path)
			: new URL(
					`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
				);
		for (const [key, value] of Object.entries(values)) {
			if (value !== undefined && value !== null)
				url.searchParams.set(
					key,
					value instanceof Date ? value.toISOString() : String(value),
				);
		}
		return url.toString();
	}
}

export async function parseResponse<T>(
	response: CompCubeResponse<T>,
): Promise<T> {
	const text = await response.text();
	const body = text ? safeJson(text) : undefined;
	if (!response.ok)
		throw new CompCubeApiError(
			response.status,
			response,
			body as ApiErrorBody | undefined,
		);
	return body as T;
}

function safeJson(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}
function isJsonBody(body: unknown): body is Record<string, unknown> {
	return (
		body !== undefined &&
		body !== null &&
		typeof body === "object" &&
		(typeof FormData === "undefined" || !(body instanceof FormData)) &&
		(typeof URLSearchParams === "undefined" ||
			!(body instanceof URLSearchParams)) &&
		(typeof Blob === "undefined" || !(body instanceof Blob)) &&
		!(body instanceof ArrayBuffer) &&
		!ArrayBuffer.isView(body)
	);
}

export const encode = (value: string | number) =>
	encodeURIComponent(String(value));
