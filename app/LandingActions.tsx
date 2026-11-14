import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { COOKIE_NAMES } from "@/lib/constants";
import { logoutAction } from "@/app/actions/auth";

export async function LandingActions() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value);

  if (hasSession) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/for-you-page">
          <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
            Go to Feed
          </Button>
        </Link>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base text-destructive hover:text-destructive"
          >
            Log out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link href="/signup">
        <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
          Start reading
        </Button>
      </Link>
      <Link href="/login">
        <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
          Sign in
        </Button>
      </Link>
    </div>
  );
}

