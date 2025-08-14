"use client";

import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
    const { user } = useUser();
    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
                    <p className="mt-2">Signed in as: {user?.primaryEmailAddress?.emailAddress}</p>
                    <Link href="/onboarding/claim-username" className="mt-4 underline text-sm">
                        Claim or update your username
                    </Link>
                </div>
            </SignedIn>
        </>
    );
}
