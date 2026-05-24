import { CorporateDashboard } from "./corporate-dashboard";

export default async function CorporateDashboardPage(
  props: PageProps<"/corporate/[slug]/dashboard">,
) {
  const { slug } = await props.params;

  return <CorporateDashboard slug={slug} />;
}
