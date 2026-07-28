import AdminDashboard from "./admin-dashboard";

export const metadata = {
  title: "Admin — CorpoGN Control Center",
  description: "Internal platform admin: NGO directory, projects, pipeline logs, corporates.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
