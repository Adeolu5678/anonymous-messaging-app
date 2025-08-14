import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Dashboard() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Ensure username claimed using service role to avoid RLS surprises
    try {
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();
        if (!profile?.username) redirect("/onboarding/claim-username");
    } catch {
        redirect("/onboarding/claim-username");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
            <p className="mt-2">Signed in as: {user.emailAddresses[0]?.emailAddress}</p>
        </div>
    );
}
