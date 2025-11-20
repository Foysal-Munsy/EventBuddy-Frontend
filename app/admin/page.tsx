import AdminDashboard from "../components/dashboard/AdminDashboard";
import AdminGate from "../components/dashboard/AdminGate";

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage events and registrations",
};

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
