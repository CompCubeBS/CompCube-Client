import assert from "node:assert/strict";
import test from "node:test";
import {
	CompCubeApiError,
	CompCubeClient,
	parseResponse,
} from "../dist/index.js";

function mockClient(handler, options = {}) {
	return new CompCubeClient({
		baseUrl: "https://example.test",
		socketUrl: "https://socket.example.test",
		fetch: handler,
		...options,
	});
}

test("uses the no-prefix API, secure cookies, bearer auth and query values", async () => {
	const client = mockClient(async (url, init) => {
		assert.equal(
			url,
			"https://example.test/leaderboard/range?start=2&range=10",
		);
		assert.equal(init.credentials, "include");
		assert.equal(
			new Headers(init.headers).get("authorization"),
			"Bearer token",
		);
		return Response.json([]);
	});
	client.setAuthToken("Bearer token");
	await client.leaderboard.getRange({ start: 2, range: 10 });
});

test("supports every HTTP request method and JSON bodies", async () => {
	const methods = [];
	const client = mockClient(async (_url, init) => {
		methods.push(init.method);
		if (init.method === "PATCH") assert.equal(init.body, '{"safe":true}');
		return new Response(null, { status: 204 });
	});
	await client.get("/test");
	await client.post("/test");
	await client.put("/test");
	await client.patch("/test", { body: { safe: true } });
	await client.delete("/test");
	assert.deepEqual(methods, ["GET", "POST", "PUT", "PATCH", "DELETE"]);
});

test("uses the backend-owned OAuth flow", () => {
	const client = mockClient(async () => new Response());
	const url = new URL(client.auth.loginUrl({ returnTo: "/admin/users" }));
	assert.equal(
		url.toString(),
		"https://example.test/oauth/login?returnTo=%2Fadmin%2Fusers",
	);
});

test("refreshes once after an unauthorized response", async () => {
	let calls = 0;
	const client = mockClient(
		async (_url, init) => {
			calls += 1;
			if (calls === 1)
				return Response.json(
					{ error: { code: "INVALID_TOKEN", message: "Expired" } },
					{ status: 401 },
				);
			assert.equal(
				new Headers(init.headers).get("authorization"),
				"Bearer replacement",
			);
			return Response.json({ guid: "user" });
		},
		{ authToken: "expired", refreshAuth: () => "replacement" },
	);
	assert.equal(
		(await parseResponse(await client.users.get({ userGuid: "user" })))
			.guid,
		"user",
	);
	assert.equal(calls, 2);
});

test("throws structured REST errors", async () => {
	const client = mockClient(async () =>
		Response.json(
			{ error: { code: "FORBIDDEN", message: "No access" } },
			{ status: 403 },
		),
	);
	await assert.rejects(
		async () => parseResponse(await client.users.list()),
		(error) =>
			error instanceof CompCubeApiError &&
			error.body.error.code === "FORBIDDEN",
	);
});

test("maps use pool-scoped creation and GUID administration", async () => {
	const requests = [];
	const client = mockClient(async (url, init) => {
		requests.push({ url, method: init.method, body: init.body });
		return Response.json({ guid: "map" });
	});
	await client.maps.create({
		poolGuid: "pool",
		key: "1a2b",
		characteristic: "Standard",
		difficulty: "ExpertPlus",
		modifiers: ["FS"],
	});
	await client.maps.update({ mapGuid: "map", modifiers: ["SS"] });
	await client.maps.remove({ mapGuid: "map" });
	assert.deepEqual(
		requests.map((request) => request.method),
		["POST", "PATCH", "DELETE"],
	);
	assert.equal(requests[0].url, "https://example.test/pools/pool/maps");
});

test("map categories use the renamed public API", async () => {
	const requests = [];
	const client = mockClient(async (url, init) => {
		requests.push({ url, method: init.method });
		return Response.json([]);
	});
	await client.mapCategories.list();
	await client.mapCategories.get({ categoryGuid: "speed" });
	assert.deepEqual(requests, [
		{ url: "https://example.test/map-categories", method: "GET" },
		{ url: "https://example.test/map-categories/speed", method: "GET" },
	]);
});

test("creates profile and match-context reports", async () => {
	const requests = [];
	const client = mockClient(async (url, init) => {
		requests.push({ url, method: init.method, body: JSON.parse(init.body) });
		return Response.json({ guid: "report" });
	});

	await client.reports.create({
		targetUserGuid: "profile-user",
		reason: "Reason from the profile page",
		source: "website",
	});
	await client.reports.create({
		targetUserGuid: "match-player",
		associatedMatchGuid: "match-guid",
		reason: "Reason from a match spectator",
		source: "website",
	});

	assert.deepEqual(requests, [
		{
			url: "https://example.test/report",
			method: "POST",
			body: {
				targetUserGuid: "profile-user",
				reason: "Reason from the profile page",
				source: "website",
			},
		},
		{
			url: "https://example.test/report",
			method: "POST",
			body: {
				targetUserGuid: "match-player",
				associatedMatchGuid: "match-guid",
				reason: "Reason from a match spectator",
				source: "website",
			},
		},
	]);
});

test("supports moderator report review operations", async () => {
	const requests = [];
	const client = mockClient(async (url, init) => {
		requests.push({ url, method: init.method });
		return Response.json([]);
	});

	await client.reports.list({ filter: "unresolved" });
	await client.reports.forUser({ userGuid: "target/user" });
	await client.reports.resolve({ reportGuid: "report/id" });

	assert.deepEqual(requests, [
		{ url: "https://example.test/reports?filter=unresolved", method: "GET" },
		{ url: "https://example.test/reports/target%2Fuser", method: "GET" },
		{ url: "https://example.test/report/report%2Fid/resolve", method: "POST" },
	]);
});
