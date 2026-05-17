import { UserBookings } from "@/components/UserBookings";

export default function DashboardPage() {
  return (
    <div className="pt-32 p-8 md:p-16">
      <h1 className="text-3xl font-serif font-light mb-8 text-brand-black tracking-tight">User Dashboard</h1>
      <UserBookings />
    </div>
  );
}
