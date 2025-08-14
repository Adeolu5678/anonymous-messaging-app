import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const usernameSchema = z
	.string()
	.min(3)
	.max(20)
	.regex(/^[a-z0-9_]+$/);

async function claimUsername(formData: FormData) {
	"use server";
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");

	const raw = (formData.get("username") as string | null) ?? "";
	const parsed = usernameSchema.safeParse(raw.toLowerCase());
	if (!parsed.success) {
		redirect("/onboarding/claim-username?e=invalid");
	}

	const { error } = await supabaseAdmin
		.from("profiles")
		.update({ username: parsed.data })
		.eq("id", userId);
	if (error) {
		redirect("/onboarding/claim-username?e=save");
	}

	revalidatePath("/dashboard");
	redirect("/dashboard");
}

export default function Page() {
    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div className="max-w-md mx-auto py-16 px-4">
                    <h1 className="text-2xl font-semibold mb-4">Claim your username</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Pick a unique username to receive whispers at your URL.
                    </p>
                    <form action={claimUsername} className="flex gap-2">
                        <input
                            name="username"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="[a-z0-9_]+"
                            placeholder="yourname"
                            className="border rounded px-3 py-2 flex-1"
                        />
                        <button className="bg-black text-white rounded px-4">Save</button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">Allowed: a–z, 0–9, underscore.</p>
                </div>
            </SignedIn>
        </>
    );
}


