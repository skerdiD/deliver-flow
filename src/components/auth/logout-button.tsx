import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline">
        Log out
      </Button>
    </form>
  );
}