import { env } from "@/app/lib/env";

export const runtime = "nodejs";

export async function GET() {
	// touch env to ensure validation executes on cold start
	void env.NEXT_PUBLIC_APP_URL;
	return Response.json({ ok: true, time: new Date().toISOString() });
}


