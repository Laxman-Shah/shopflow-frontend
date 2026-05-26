import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Package, Clock, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderService } from '@/services/orderService';
import { wishlistService } from '@/services/wishlistService';
import { toast } from 'sonner';

export function CustomerDashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Array<{ action: string; time: string }>>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [ordersResponse, pendingResponse, wishlistResponse] = await Promise.all([
          orderService.getMyOrders({ page: 0, size: 5 }),
          orderService.getMyOrders({ status: 'PENDING', page: 0, size: 1 }),
          wishlistService.getWishlistCount(),
        ]);

        const allOrders = ordersResponse.data?.content ?? [];
        const totalCount = ordersResponse.data?.totalElements ?? allOrders.length;
        const pendingCount = pendingResponse.data?.totalElements ?? 0;
        const wishlistCount = Number(wishlistResponse.data ?? 0);

        setTotalOrders(totalCount);
        setPendingOrders(pendingCount);
        setWishlistItems(wishlistCount);
        setRecentActivity(
          allOrders.slice(0, 3).map((order) => ({
            action: `Order #${order.id.slice(0, 8)} is ${order.status.toLowerCase()}`,
            time: new Date(order.createdAt).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error('Failed to load customer dashboard:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Manage your orders, wishlist, and discover new footwear.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Wishlist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{wishlistItems}</div>
              <Heart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{pendingOrders}</div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/products">
            <Button className="w-full h-20 text-base font-semibold bg-orange-500 hover:bg-orange-600 flex items-center justify-between px-6">
              <span>Browse Products</span>
              <Footprints className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>View Orders</span>
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/wishlist">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>My Wishlist</span>
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="w-full h-20 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 flex items-center justify-between px-6">
              <span>Edit Profile</span>
              <Package className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(recentActivity.length > 0
              ? recentActivity.map((item) => ({ ...item, icon: Package }))
              : [{ action: 'No recent activity yet', time: 'Live', icon: ShoppingCart }]).map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
