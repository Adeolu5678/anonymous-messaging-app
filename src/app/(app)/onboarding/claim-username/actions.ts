"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const usernameSchema = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);

export async function claimUsernameAction(formData: FormData) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const raw = (formData.get("username") as string | null) ?? "";
    const parsed = usernameSchema.safeParse(raw.toLowerCase());
    if (!parsed.success) redirect("/onboarding/claim-username?e=invalid");

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ username: parsed.data })
        .eq("id", userId);
    if (error) redirect("/onboarding/claim-username?e=save");

    revalidatePath("/dashboard");
    redirect("/dashboard");
}


