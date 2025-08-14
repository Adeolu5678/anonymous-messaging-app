import { supabase } from "@/app/lib/supabaseClient";

export type Profile = {
	id: string;
	username: string;
	display_name: string;
	about: string | null;
	pronouns: string | null;
	avatar_url: string | null;
};

export async function getProfileById(userId: string) {
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username, display_name, about, pronouns, avatar_url")
		.eq("id", userId)
		.single();
	if (error) return null;
	return data as Profile;
}

export async function isUsernameAvailable(username: string) {
	const { count, error } = await supabase
		.from("profiles")
		.select("id", { count: "exact", head: true })
		.ilike("username", username);
	if (error) return false;
	return (count ?? 0) === 0;
}


