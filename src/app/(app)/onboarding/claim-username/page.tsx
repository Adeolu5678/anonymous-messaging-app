import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { claimUsernameAction } from "./actions";

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
                    <form action={claimUsernameAction} className="flex gap-2">
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


