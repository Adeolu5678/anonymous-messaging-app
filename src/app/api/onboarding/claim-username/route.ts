import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

const bodySchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
});

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    let data: unknown;
    try {
        data = await req.json();
    } catch {
        return new Response("Bad JSON", { status: 400 });
    }

    const parsed = bodySchema.safeParse(data);
    if (!parsed.success) {
        return new Response("Invalid username", { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ username: parsed.data.username })
        .eq("id", userId);

    if (error) {
        return new Response("DB error", { status: 500 });
    }

    return Response.json({ ok: true });
}


