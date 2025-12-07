import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_APP_URL || "http://localhost:3311",
});

export const { signIn, signOut, useSession } = authClient;

