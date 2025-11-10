'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CouponsTable() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const response = await fetch('/api/admin/coupons');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  async function deleteCoupon(id: string) {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Coupon deleted');
      fetchCoupons();
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleteId(null);
    }
  }

  function getCouponTypeLabel(type: string) {
    const labels: Record<string, string> = {
      PERCENTAGE: 'Percentage',
      FIXED: 'Fixed Amount',
      FREE_SHIPPING: 'Free Shipping',
    };
    return labels[type] || type;
  }

  function getCouponValue(coupon: Coupon) {
    if (coupon.type === 'FREE_SHIPPING') return 'Free Shipping';
    if (coupon.type === 'PERCENTAGE') return `${coupon.value}%`;
    return `$${coupon.value.toFixed(2)}`;
  }

  function getCouponStatus(coupon: Coupon) {
    if (!coupon.isActive)
      return { label: 'Inactive', variant: 'secondary' as const };

    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);

    if (now < start) return { label: 'Scheduled', variant: 'default' as const };
    if (now > end) return { label: 'Expired', variant: 'destructive' as const };

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: 'Limit Reached', variant: 'destructive' as const };
    }

    return { label: 'Active', variant: 'default' as const };
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No coupons found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/coupons/new">Create your first coupon</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="font-mono font-medium">{coupon.code}</div>
                    {coupon.description && (
                      <div className="text-sm text-muted-foreground">
                        {coupon.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getCouponTypeLabel(coupon.type)}</TableCell>
                  <TableCell className="font-medium">
                    {getCouponValue(coupon)}
                  </TableCell>
                  <TableCell>
                    {coupon.usageLimit ? (
                      <span>
                        {coupon.usedCount} / {coupon.usageLimit}
                      </span>
                    ) : (
                      <span>{coupon.usedCount} (Unlimited)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {format(new Date(coupon.startDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-muted-foreground">
                        to {format(new Date(coupon.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/coupons/${coupon.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(coupon.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteCoupon(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
