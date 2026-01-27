"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { referralAPI } from "@/lib/api-client";
import { TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft as ToggleOff,
  ToggleRight as ToggleOn,
} from "lucide-react";
import { Suspense } from "react";
import Loading from "../appointments/loading";

type ReferralCode = {
  _id: string;
  code: string;
  description?: string;
  isActive: boolean;
  totalUses?: number;
  timesUsed?: number;
  createdAt?: string;
};

export default function ReferralPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", description: "", isActive: true });
  const [editCode, setEditCode] = useState<ReferralCode | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["referral-codes", statusFilter],
    queryFn: () => referralAPI.getReferralCodes(statusFilter === "all" ? "" : statusFilter),
  });

  const referralCodes: ReferralCode[] = response?.data?.data || [];

  const filteredCodes = referralCodes.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.code?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => referralAPI.createReferralCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
      toast.success("Referral code created");
      setIsAddOpen(false);
      setNewCode({ code: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create referral code");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      referralAPI.updateReferralCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
      toast.success("Referral code updated");
      setIsEditOpen(false);
      setEditCode(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update referral code");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      referralAPI.updateReferralStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
      toast.success("Referral code status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => referralAPI.deleteReferralCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
      toast.success("Referral code deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete referral code");
    },
  });

  const totalUses = (item: ReferralCode) =>
    typeof item.totalUses === "number" ? item.totalUses : item.timesUsed || 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code.trim()) {
      toast.error("Please enter referral code");
      return;
    }
    createMutation.mutate({
      code: newCode.code.trim().toUpperCase(),
      description: newCode.description.trim(),
      isActive: newCode.isActive,
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCode?._id) return;
    const payload: any = {
      description: editCode.description?.trim() || "",
    };
    if (totalUses(editCode) === 0 && editCode.code) {
      payload.code = editCode.code.trim().toUpperCase();
    }
    updateMutation.mutate({
      id: editCode._id,
      data: payload,
    });
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referral Codes</h1>
            <p className="text-gray-600 mt-1">
              Create, activate, or deactivate referral codes and see total usage.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Referral Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Referral Code</DialogTitle>
                <DialogDescription>
                  New codes are stored in uppercase automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-code">Code</Label>
                  <Input
                    id="new-code"
                    placeholder="e.g., DOC2026"
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-desc">Description</Label>
                  <Input
                    id="new-desc"
                    placeholder="Optional description"
                    value={newCode.description}
                    onChange={(e) =>
                      setNewCode((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Code"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by code or description"
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStatusFilter("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Codes</CardTitle>
            <CardDescription>Showing {filteredCodes.length} results</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={8} />
            ) : filteredCodes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Uses</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.map((item, index) => (
                      <TableRow key={item._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-semibold">{item.code}</TableCell>
                        <TableCell>{item.description || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {totalUses(item)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                statusMutation.mutate({
                                  id: item._id,
                                  isActive: !item.isActive,
                                })
                              }
                              disabled={statusMutation.isPending}
                            >
                              {item.isActive ? (
                                <ToggleOn className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditCode(item);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(item._id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No referral codes found</div>
            )}
          </CardContent>
        </Card>

        {/* Edit dialog */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setEditCode(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Referral Code</DialogTitle>
              <DialogDescription>
                Code cannot be changed once the code has been used.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  value={editCode?.code || ""}
                  onChange={(e) =>
                    setEditCode((prev) =>
                      prev ? { ...prev, code: e.target.value.toUpperCase() } : prev
                    )
                  }
                  disabled={!editCode || totalUses(editCode) > 0}
                />
                {editCode && totalUses(editCode) > 0 && (
                  <p className="text-xs text-gray-500">
                    Code is locked because it has been used.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Input
                  id="edit-desc"
                  value={editCode?.description || ""}
                  onChange={(e) =>
                    setEditCode((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                  }
                  placeholder="Optional description"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
}
