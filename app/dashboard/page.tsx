import UserDashboard from "../components/dashboard/UserDashboard";
import UserGate from "../components/dashboard/UserGate";

export const metadata = {
  title: "User Dashboard",
  description: "Review and manage your event registrations",
};

export default function DashboardPage() {
  return (
    <UserGate>
      <UserDashboard />
    </UserGate>
  );
}
