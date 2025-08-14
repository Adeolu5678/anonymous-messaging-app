import { clerkMiddleware } from "@clerk/nextjs/server";

// Minimal middleware to enable Clerk integration and auth header propagation
export default clerkMiddleware();

export const config = {
	matcher: [
		"/((?!.+\\.[\\w]+$|_next).*)",
		"/",
		"/(api|trpc)(.*)",
	],
};


