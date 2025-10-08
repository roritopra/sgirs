"use client";

import { useDateRange } from "@/context/admin/DateRangeProvider";

export default function DateRangeFilter() {
  const { dateRange, setDateRange } = useDateRange();

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <label htmlFor="from" className="text-sm font-medium text-gray-600">
          Desde
        </label>
        <input
          type="date"
          id="from"
          value={dateRange.from ? dateRange.from.toISOString().split("T")[0] : ""}
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              from: e.target.value ? new Date(e.target.value) : null,
            }))
          }
          className="border px-2 py-1 rounded-md"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="to" className="text-sm font-medium text-gray-600">
          Hasta
        </label>
        <input
          type="date"
          id="to"
          value={dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""}
          onChange={(e) =>
            setDateRange((prev) => ({
              ...prev,
              to: e.target.value ? new Date(e.target.value) : null,
            }))
          }
          className="border px-2 py-1 rounded-md"
        />
      </div>
    </div>
  );
}
