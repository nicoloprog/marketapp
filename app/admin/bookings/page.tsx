"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  bookings,
  getUserById,
  getServiceById,
  getVehicleById,
  formatDate,
} from "@/lib/data";
import type { BookingStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusColors: Record<BookingStatus, string> = {
  PENDING: "bg-chart-4/20 text-chart-4",
  APPROVED: "bg-primary/20 text-primary",
  IN_PROGRESS: "bg-chart-2/20 text-chart-2",
  COMPLETED: "bg-chart-3/20 text-chart-3",
  CANCELLED: "bg-destructive/20 text-destructive",
};

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [localBookings, setLocalBookings] = useState(bookings);

  const filtered =
    filter === "ALL"
      ? localBookings
      : localBookings.filter((b) => b.status === filter);

  const updateStatus = (bookingId: string, newStatus: BookingStatus) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    );
    toast.success(`Booking status updated to ${newStatus}`);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage service appointments
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => {
                const user = getUserById(booking.user_id);
                const service = getServiceById(booking.service_id);
                const vehicle = getVehicleById(booking.vehicle_id);
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {vehicle ? ` ${vehicle.make} ${vehicle.model}` : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{service?.name}</p>
                      {/* <p className="text-xs text-primary">
                        {formatPrice(service?.basePrice ?? 0)}
                      </p> */}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(booking.scheduled_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusColors[booking.status],
                        )}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={booking.status}
                        onValueChange={(v) =>
                          updateStatus(booking.id, v as BookingStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-32 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 p-4 lg:hidden">
          {filtered.map((booking) => {
            const user = getUserById(booking.user_id);
            const service = getServiceById(booking.service_id);
            const vehicle = getVehicleById(booking.vehicle_id);
            return (
              <div
                key={booking.id}
                className="rounded-md border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      statusColors[booking.status],
                    )}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {service?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vehicle ? ` ${vehicle.make} ${vehicle.model}` : ""}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(booking.scheduled_at)}
                </p>
                <div className="mt-3">
                  <Select
                    value={booking.status}
                    onValueChange={(v) =>
                      updateStatus(booking.id, v as BookingStatus)
                    }
                  >
                    <SelectTrigger className="h-8 bg-card text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No bookings found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
