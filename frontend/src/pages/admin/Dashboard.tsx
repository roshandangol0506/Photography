import {
  Images,
  Users,
  Heart,
  MessageCircle,
  FolderKanban,
  Award as AwardIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useAnalyticsOverview, useAnalyticsChart } from "@/api/analytics";
import { StatCard } from "@/components/admin/StatCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: overview, isLoading } = useAnalyticsOverview();
  const { data: chartData } = useAnalyticsChart({
    metric: "visitors",
    range: "daily",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s how your portfolio is doing.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Photos"
            value={overview?.totalPhotos ?? 0}
            icon={Images}
          />
          <StatCard
            label="Visitors"
            value={overview?.totalVisitors ?? 0}
            icon={Users}
          />
          <StatCard
            label="Likes"
            value={overview?.totalLikes ?? 0}
            icon={Heart}
          />
          <StatCard
            label="Comments"
            value={overview?.totalComments ?? 0}
            icon={MessageCircle}
          />
          <StatCard
            label="Collections"
            value={overview?.totalCollections ?? 0}
            icon={FolderKanban}
          />
          <StatCard
            label="Awards"
            value={overview?.totalAwards ?? 0}
            icon={AwardIcon}
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Visitors (daily)
        </h2>
        {!chartData || chartData.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No visitor activity yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
