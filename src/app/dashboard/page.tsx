import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You must be signed in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-2">
        Signed in as: {user.emailAddresses[0]?.emailAddress}
      </p>
    </div>
  );
}
