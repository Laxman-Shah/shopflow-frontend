import { useCallback, useEffect, useState } from 'react';
import { Ban, CheckCircle, Loader2, Search, ShieldCheck, UserX, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminUserService, type AdminUser } from '@/services/adminUserService';
import { toast } from 'sonner';

const ROLE_FILTERS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'SELLER', label: 'Sellers' },
  { value: 'ADMIN', label: 'Admins' },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminUserService.getUsers({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        keyword: searchQuery.trim() || undefined,
        page,
        size: 10,
      });

      if (response.success && response.data) {
        setUsers(response.data.content || []);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, searchQuery, refreshKey]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setRefreshKey((k) => k + 1);
  };

  const runAction = async (userId: string, action: () => Promise<unknown>) => {
    try {
      setActionUserId(userId);
      await action();
      toast.success('User updated');
      await loadUsers();
    } catch (error) {
      console.error('User action failed:', error);
      toast.error('Action failed');
    } finally {
      setActionUserId(null);
    }
  };

  const renderActions = (user: AdminUser) => {
    const busy = actionUserId === user.id;

    if (user.role === 'ADMIN') {
      return <span className="text-xs text-gray-500">Protected</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {user.role === 'SELLER' && (
          user.sellerApproved ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => runAction(user.id, () => adminUserService.revokeSeller(user.id))}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke Approval'}
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={busy}
              onClick={() => runAction(user.id, () => adminUserService.approveSeller(user.id))}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </>
              )}
            </Button>
          )
        )}
        {user.accountEnabled ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => runAction(user.id, () => adminUserService.banUser(user.id))}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Ban className="w-4 h-4 mr-1" />
                Ban
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => runAction(user.id, () => adminUserService.unbanUser(user.id))}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <ShieldCheck className="w-4 h-4 mr-1" />
                Unban
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const statusBadge = (user: AdminUser) => {
    if (!user.accountEnabled) {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (user.role === 'SELLER' && !user.sellerApproved) {
      return <Badge className="bg-yellow-500">Pending Approval</Badge>;
    }
    if (!user.verified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    return <Badge className="bg-green-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage customers and sellers ({totalElements} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-orange-500" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                if (v) {
                  setRoleFilter(v);
                  setPage(0);
                  setRefreshKey((k) => k + 1);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <UserX className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            No users found
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{statusBadge(user)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{renderActions(user)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {statusBadge(user)}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>{user.role}</span>
                    <span>•</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {renderActions(user)}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
