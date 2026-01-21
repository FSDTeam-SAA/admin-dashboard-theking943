"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentsAPI } from "@/lib/api-client";
import { TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import { Search, Calendar, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation"
import { Suspense } from "react";
import Loading from "./loading";

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 10;
  const searchParams = useSearchParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ["appointments", page, search, status],
    queryFn: () => appointmentsAPI.getAppointments(page, ITEMS_PER_PAGE, search, status),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsAPI.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    },
  });

  const appointments = response?.data?.data || [];
  const totalResults = response?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "appoint":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "reschedule":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600 mt-2">View all doctor accepted patients</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by name"
                  className="pl-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select value={status} onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="appoint">Confirmed</SelectItem>
                  <SelectItem value="reschedule">Rescheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment's List</CardTitle>
            <CardDescription>Showing {appointments.length} of {totalResults} results</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={ITEMS_PER_PAGE} />
            ) : appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Doctors Name</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: any) => (
                      <TableRow key={appointment._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {new Date(appointment.date).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {appointment.patientName || appointment.patient?.fullName || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {appointment.doctorName || appointment.doctor?.fullName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{appointment.time || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {appointment.fees?.amount || 0} {appointment.fees?.currency || "USD"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.status?.toLowerCase() !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => cancelMutation.mutate(appointment._id)}
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No appointments found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
