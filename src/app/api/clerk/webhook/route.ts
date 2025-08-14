import { headers } from "next/headers";
import { Webhook } from "svix";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export async function GET() {
	return new Response("OK", { status: 200 });
}

function deriveUsername(u: any) {
	return (u.username?.toLowerCase() || `u_${u.id}`).replace(/[^a-z0-9_]/g, "");
}

function deriveDisplayName(u: any) {
	const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
	if (name) return name;
	if (u.username) return u.username;
	const email = u.email_addresses?.[0]?.email_address || "";
	return email.split("@")[0] || "User";
}

export async function POST(req: Request) {
	const body = await req.text();
	const h = headers();
	const svix_id = h.get("svix-id");
	const svix_timestamp = h.get("svix-timestamp");
	const svix_signature = h.get("svix-signature");
	const secret = process.env.CLERK_WEBHOOK_SECRET;

	if (!svix_id || !svix_timestamp || !svix_signature || !secret) {
		return new Response("Missing Svix headers or secret", { status: 400 });
	}

	let evt: any;
	try {
		const wh = new Webhook(secret);
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		});
	} catch {
		return new Response("Invalid signature", { status: 400 });
	}

	const type = evt.type as string;
	const data = evt.data;

	if (type === "user.created" || type === "user.updated") {
		const upsert = {
			id: data.id as string,
			username: deriveUsername(data),
			display_name: deriveDisplayName(data),
			about: null as string | null,
			pronouns: null as string | null,
			avatar_url: (data.image_url as string | null) ?? null,
		};
		const { error } = await supabaseAdmin
			.from("profiles")
			.upsert(upsert, { onConflict: "id" });
		if (error) return new Response(`DB error: ${error.message}`, { status: 500 });
	}

	if (type === "user.deleted") {
		const { error } = await supabaseAdmin
			.from("profiles")
			.delete()
			.eq("id", data.id as string);
		if (error) return new Response(`DB error: ${error.message}`, { status: 500 });
	}

	return new Response("OK", { status: 200 });
}


