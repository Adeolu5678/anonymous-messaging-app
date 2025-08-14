import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
	const user = await currentUser();
	if (!user) redirect("/sign-in");

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
			<p className="mt-2">Signed in as: {user.emailAddresses[0]?.emailAddress}</p>
		</div>
	);
}
