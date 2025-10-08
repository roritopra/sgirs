import { useAppSelector } from "@/hooks/useAppSelector";

export function useAuth() {
  const { user } = useAppSelector((state) => state.auth);

  const email = user?.email ?? "";
  const id = user?.id ?? "";
  const username = user?.username ?? "";
  const role = user?.role ?? "";
  const name = user?.name ?? "";

  return { email, id, username, role, name };
}