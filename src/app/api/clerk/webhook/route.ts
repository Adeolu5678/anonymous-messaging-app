import { headers } from "next/headers";
import { Webhook } from "svix";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export async function GET() {
	return new Response("OK", { status: 200 });
}

type ClerkEmailAddress = { email_address: string };
type ClerkUser = {
	id: string;
	username?: string | null;
	first_name?: string | null;
	last_name?: string | null;
	image_url?: string | null;
	email_addresses?: ClerkEmailAddress[];
};

type ClerkEvent = {
	type: string;
	data: ClerkUser;
};

function deriveUsername(user: ClerkUser): string {
	return (user.username?.toLowerCase() || `u_${user.id}`).replace(/[^a-z0-9_]/g, "");
}

function deriveDisplayName(user: ClerkUser): string {
	const name = [user.first_name, user.last_name]
		.filter((v): v is string => Boolean(v && v.length))
		.join(" ")
		.trim();
	if (name) return name;
	if (user.username) return user.username;
	const email = user.email_addresses?.[0]?.email_address || "";
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

	let evt: ClerkEvent;
	try {
		const wh = new Webhook(secret);
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as ClerkEvent;
	} catch {
		return new Response("Invalid signature", { status: 400 });
	}

	const type = evt.type;
	const data = evt.data;

	if (type === "user.created" || type === "user.updated") {
		const upsert = {
			id: data.id,
			username: deriveUsername(data),
			display_name: deriveDisplayName(data),
			about: null as string | null,
			pronouns: null as string | null,
			avatar_url: data.image_url ?? null,
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
			.eq("id", data.id);
		if (error) return new Response(`DB error: ${error.message}`, { status: 500 });
	}

	return new Response("OK", { status: 200 });
}


