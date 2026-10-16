import { CalendarDays } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventEntity } from "../../../domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";
import {
  getDashboardScheduleData,
  getDashboardStatusData,
} from "../../lib/dashboard-overview.utils";
import { CardHeading } from "./dashboard-overview-cards";

export function StatusBreakdown({
  events,
}: {
  events: readonly EventEntity[];
}) {
  const statusData = getDashboardStatusData(events);

  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4 sm:p-[17px]`}>
      <h2 className="text-[15px] font-bold tracking-[-.035em] text-[#101b43]">
        Event Status
      </h2>
      {statusData.length ? (
        <div className="mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(128px,.8fr)_minmax(0,1fr)]">
          <div
            className="h-[170px] min-w-0"
            aria-label="Events grouped by status"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    border: "1px solid #e5ebf4",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-center text-[22px] leading-tight font-bold text-[#101b43] sm:text-left">
              {events.length}
              <span className="ml-1 text-[11px] font-medium text-[#75829b]">
                events
              </span>
            </p>
            <ul className="mt-2 space-y-1.5">
              {statusData.map((item) => (
                <li
                  key={item.status}
                  className="flex items-center gap-2 text-[10px] text-[#53627e]"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <strong className="text-[#101b43] tabular-nums">
                    {item.value}
                  </strong>
                  <span className="w-8 text-right text-[#7a87a0] tabular-nums">
                    {Math.round((item.value / events.length) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <EmptyState
          size="compact"
          title="No event status data"
          description="Status distribution will appear when events are available."
        />
      )}
    </section>
  );
}

export function EventSchedule({ events }: { events: readonly EventEntity[] }) {
  const scheduleData = getDashboardScheduleData(events);

  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4 sm:p-[17px]`}>
      <CardHeading title="Scheduled Events" />
      {scheduleData.length ? (
        <div
          className="mt-3 h-[190px] min-w-0"
          aria-label="Scheduled events by month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={scheduleData}
              accessibilityLayer
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="#e9eef5" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#74819a", fontSize: 10 }}
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#74819a", fontSize: 10 }}
                width={34}
              />
              <Tooltip
                formatter={(value) => [value, "Events"]}
                contentStyle={{
                  border: "1px solid #e5ebf4",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="events"
                name="Events"
                fill="#0965ff"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          size="compact"
          icon={<CalendarDays size={21} strokeWidth={1.8} />}
          title="No event dates yet"
          description="Add a schedule to an event to see monthly activity here."
        />
      )}
    </section>
  );
}
