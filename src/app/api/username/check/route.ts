import { NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "@/app/lib/supabaseClient";

const schema = z.object({ username: z.string().regex(/^[a-z0-9_]{3,20}$/) });

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const username = searchParams.get("username") || "";
	const parsed = schema.safeParse({ username });
	if (!parsed.success) return new Response("Bad username", { status: 400 });

	const { count } = await supabase
		.from("profiles")
		.select("id", { head: true, count: "exact" })
		.ilike("username", parsed.data.username);

	return Response.json({ available: (count ?? 0) === 0 });
}


