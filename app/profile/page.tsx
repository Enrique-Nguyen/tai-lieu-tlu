import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function formatDateVN(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

interface ProfilePageProps {
  searchParams: Promise<{
    incomplete?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedParams = await searchParams;
  const isIncompleteQuery = resolvedParams.incomplete === "true";

  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select(
      "full_name, avatar_url, academic_year, major, student_class, is_profile_completed, last_profile_update"
    )
    .eq("id", user.id)
    .single();

  const now = new Date();
  let isLocked = false;
  let remainingDays = 0;
  let unlockDateFormatted = "";

  if (profile?.last_profile_update) {
    const lastUpdateDate = new Date(profile.last_profile_update);
    const diffMs = now.getTime() - lastUpdateDate.getTime();

    if (diffMs < NINETY_DAYS_MS) {
      isLocked = true;
      const remainingMs = NINETY_DAYS_MS - diffMs;
      remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const unlockDate = new Date(lastUpdateDate.getTime() + NINETY_DAYS_MS);
      unlockDateFormatted = formatDateVN(unlockDate);
    }
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950">
      <ProfileForm
        userEmail={user.email || ""}
        initialProfile={{
          full_name: profile?.full_name || user.user_metadata?.full_name || "",
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
          academic_year: profile?.academic_year || null,
          major: profile?.major || null,
          student_class: profile?.student_class || null,
          is_profile_completed: profile?.is_profile_completed ?? false,
          last_profile_update: profile?.last_profile_update || null,
        }}
        isLocked={isLocked}
        remainingDays={remainingDays}
        unlockDateFormatted={unlockDateFormatted}
        isIncompleteQuery={isIncompleteQuery}
      />
    </main>
  );
}
