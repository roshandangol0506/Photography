import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  useAnalyticsChart,
  useTopLikedPhotos,
  useRecentLikes,
  downloadAnalyticsExport,
  type ChartParams,
} from "@/api/analytics";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const METRICS: ChartParams["metric"][] = [
  "visitors",
  "likes",
  "comments",
  "photos",
];
const RANGES: ChartParams["range"][] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export default function Analytics() {
  const [metric, setMetric] = useState<ChartParams["metric"]>("visitors");
  const [range, setRange] = useState<ChartParams["range"]>("daily");
  const [exporting, setExporting] = useState(false);

  const { data: chartData, isLoading } = useAnalyticsChart({ metric, range });
  const { data: topLiked } = useTopLikedPhotos(5);
  const { data: recentLikes } = useRecentLikes({ page: 1, perpage: 5 });

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAnalyticsExport({ metric, range });
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" />{" "}
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={metric}
          onChange={(e) =>
            setMetric(e.target.value as ChartParams["metric"])
          }
          className="max-w-40"
        >
          {METRICS.map((m) => (
            <option key={m} value={m}>
              {m[0].toUpperCase() + m.slice(1)}
            </option>
          ))}
        </Select>
        <Select
          value={range}
          onChange={(e) => setRange(e.target.value as ChartParams["range"])}
          className="max-w-40"
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {r[0].toUpperCase() + r.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading chart...</p>
        ) : !chartData || chartData.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No data for this range yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Top liked photos
          </h2>
          <div className="space-y-3">
            {topLiked?.length ? (
              topLiked.map((photo) => (
                <div key={photo._id} className="flex items-center gap-3">
                  <img
                    src={photo.images.thumb}
                    alt={photo.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {photo.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {photo.likeCount} likes
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No likes yet</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Recent likes
          </h2>
          <div className="space-y-3">
            {recentLikes?.likes.length ? (
              recentLikes.likes.map((like) => (
                <div key={like._id} className="flex items-center gap-3">
                  <img
                    src={like.photo.images.thumb}
                    alt={like.photo.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {like.photo.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(like.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No likes yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
