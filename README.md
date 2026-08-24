# CompCube Client

The type-safe TypeScript client for the CompCube REST and Socket.IO APIs. It targets the new API surface directly—there is no `/api` prefix—and works in browsers, SSR applications, and Node.js.

## REST usage

```ts
import { CompCubeClient } from "compcube-client";

const client = new CompCubeClient({
	baseUrl: "https://api.compcube.net",
	// Optional when the backend's HttpOnly OAuth cookies are available.
	authToken: existingAccessToken,
});

const currentSeason = await client.seasons.current().then((response) => response.data());
const liveMatches = await client.matches
	.list({ status: "playing" })
	.then((response) => response.data());
```

Every REST method returns a typed `CompCubeResponse`. Use `.data()` to parse a successful response or inspect `ok`, `status`, headers, and the native response directly. Failed `.data()` calls throw `CompCubeApiError` with the server's error code and message.

The client sends credentials automatically. It can also obtain a token asynchronously and refresh once after a `401`:

```ts
const client = new CompCubeClient({
	getAuthToken: () => session.accessToken,
	refreshAuth: async () => {
		const token = await refreshSession();
		return token.access_token;
	},
});
```

OAuth is owned by the backend. Redirect users to `client.auth.loginUrl({ returnTo: location.href })`; the API sets its secure session cookies and redirects back. `account.me()` returns the authenticated user, queue eligibility, and the BeatKhana account-linking URL when no platform ID is available.

## Socket.IO usage

The socket manager shares the REST client's authentication, reconnects through Socket.IO, converts acknowledgement errors into `CompCubeSocketError`, and supports public match spectators without a token.

```ts
const socket = client.socket;

socket.on("roundResults", (event) => updateMatch(event));
socket.onConnection((state) => showConnectionState(state));

await socket.connect();
await socket.watchMatch({ matchGuid });
const state = await socket.getMatchState({ matchGuid });

// Authenticated game-client action:
await socket.joinQueue({ queueGuid });
```

Call `socket.disconnect()` when the owning view or application is disposed.

## Resources

The client exposes typed resources for:

- `account`, `auth`, and `users`
- `statistics`, `leaderboard`, and `seasons`
- `pools`, `maps`, `flairs`, and `queues`
- `matches`, `rounds`, `scores`, `timers`, and `moderation`
- `server`, including OpenAPI and AsyncAPI contracts

REST documentation is available at `/docs` and the Socket.IO/AsyncAPI viewer at `/docs/ws` on the backend. The machine-readable contracts are `/openapi.json` and `/socket-docs.json`.
