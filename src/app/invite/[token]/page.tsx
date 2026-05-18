import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteAcceptForm } from "@/components/auth/invite-form";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6"
      style={{
        paddingTop: "max(var(--safe-top), 24px)",
        paddingBottom: "max(var(--safe-bottom), 24px)",
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>招待を受諾する</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteAcceptForm token={token} />
        </CardContent>
      </Card>
    </main>
  );
}
