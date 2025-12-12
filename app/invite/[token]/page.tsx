import { InviteAcceptancePage } from "@/components/auth/invite-acceptance-page";

type Params = { params: Promise<{ token: string }> };

export default async function Page({ params }: Params) {
  const { token } = await params;
  return <InviteAcceptancePage token={token} />;
}
