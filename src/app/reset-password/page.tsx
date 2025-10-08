import ResetPasswordForm from "@/components/shared/Auth/ResetPasswordForm/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token ?? null;
  return (
    <div className="flex items-center flex-col justify-center">
      <ResetPasswordForm token={token} />
    </div>
  );
}
