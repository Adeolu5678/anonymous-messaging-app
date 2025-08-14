import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/health",
	"/api/clerk/webhook",
	"/api/username/check",
]);

export default clerkMiddleware((auth, req) => {
	if (isPublicRoute(req)) return;
	// Use Promise pattern to satisfy TS typings in Clerk v6
	return auth().then(({ protect }) => protect());
});

export const config = {
	matcher: [
		"/((?!.+\\.[\\w]+$|_next).*)",
		"/",
		"/(api|trpc)(.*)",
	],
};


