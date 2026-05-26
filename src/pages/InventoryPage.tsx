import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Box,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';

import {
  inventoryService,
  type Inventory,
  type InventoryStatus,
} from '@/services/inventoryService';

import { productService } from '@/services/productService';

export function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InventoryStatus | 'ALL'>('ALL');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedInventory, setSelectedInventory] =
    useState<Inventory | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    productId: '',
    totalQuantity: '',
    lowStockThreshold: '',
  });

  const pageSize = 10;

  useEffect(() => {
    loadInventories();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (showCreateModal) {
      loadProducts();
    }
  }, [showCreateModal]);

  const loadProducts = async () => {
    try {
      const response = await productService.getMyProducts();

      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    }
  };

  const loadInventories = async () => {
    setIsLoading(true);

    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
        sort: 'updatedAt,desc',
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await inventoryService.getMyInventory(params);

      if (response.success && response.data) {
        const inventoryList = response.data.inventories || [];

        setInventories(inventoryList);

        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      console.error('Error response:', error.response?.data);
      toast.error(
        error.response?.data?.message ||
          'Failed to load inventory'
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateInventory = async () => {
    try {
      const payload = {
        productId: createFormData.productId,
        totalQuantity: parseInt(createFormData.totalQuantity),
        lowStockThreshold: parseInt(
          createFormData.lowStockThreshold
        ),
      };

      if (isEditMode && selectedInventory) {
        await inventoryService.updateInventory(
          createFormData.productId,
          payload
        );

        toast.success('Inventory updated');
      } else {
        await inventoryService.createInventory(payload);

        toast.success('Inventory created');
      }

      setShowCreateModal(false);

      setCreateFormData({
        productId: '',
        totalQuantity: '',
        lowStockThreshold: '',
      });

      loadInventories();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Failed to save inventory'
      );
    }
  };

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        );

      case 'LOW_STOCK':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low Stock
          </Badge>
        );

      case 'OUT_OF_STOCK':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
    }
  };

  const filteredInventories = inventories.filter((inv) =>
    inv.productName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Inventory Management
            </h1>

            <p className="text-muted-foreground">
              Manage your stock and inventory
            </p>
          </div>

          <Button
            className="bg-orange-500 hover:bg-orange-600 rounded-xl"
            onClick={() => {
              setIsEditMode(false);
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory
          </Button>
        </div>

        {/* INFO */}
        <Card className="mb-6 border-blue-200 bg-blue-50 rounded-2xl">
          <CardContent className="p-5 flex gap-4 items-start">
            <Box className="w-6 h-6 text-blue-600 mt-1" />

            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Inventory Management Flow
              </h3>

              <p className="text-sm text-blue-700">
                First create products in seller products,
                then manage inventory here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm mb-2">
                Total Stock
              </p>

              <h2 className="text-3xl font-bold">
                {inventories.reduce(
                  (sum, i) => sum + i.availableQuantity,
                  0
                )}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm mb-2">
                Products
              </p>

              <h2 className="text-3xl font-bold">
                {totalElements}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm mb-2">
                Low Stock
              </p>

              <h2 className="text-3xl font-bold text-yellow-500">
                {
                  inventories.filter(
                    (i) => i.status === 'LOW_STOCK'
                  ).length
                }
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm mb-2">
                Out Of Stock
              </p>

              <h2 className="text-3xl font-bold text-red-500">
                {
                  inventories.filter(
                    (i) => i.status === 'OUT_OF_STOCK'
                  ).length
                }
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search products..."
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: any) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-[200px] rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                All Status
              </SelectItem>

              <SelectItem value="IN_STOCK">
                In Stock
              </SelectItem>

              <SelectItem value="LOW_STOCK">
                Low Stock
              </SelectItem>

              <SelectItem value="OUT_OF_STOCK">
                Out Of Stock
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={loadInventories}
          >
            Refresh
          </Button>
        </div>

        {/* INVENTORY LIST */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>

            <p>Loading inventory...</p>
          </div>
        ) : filteredInventories.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-20 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />

              <h3 className="text-2xl font-semibold mb-2">
                No Inventory Found
              </h3>

              <p className="text-muted-foreground mb-6">
                Add inventory for your products
              </p>

              <Button
                className="bg-orange-500 hover:bg-orange-600 rounded-xl"
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedInventory(null);
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Inventory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

              {filteredInventories.map((inventory) => (
                <Card
                  key={inventory.id}
                  className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">

                    {inventory.productThumbnailUrl ? (
                      <img
                        src={inventory.productThumbnailUrl}
                        alt={inventory.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-orange-300" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      {getStatusBadge(inventory.status)}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-5 space-y-5">

                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {inventory.productName}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-1 break-all">
                        {inventory.productId}
                      </p>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-orange-50 p-3 border border-orange-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          Total
                        </p>

                        <p className="text-2xl font-bold text-orange-600">
                          {inventory.totalQuantity}
                        </p>
                      </div>

                      <div className="rounded-xl bg-green-50 p-3 border border-green-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          Available
                        </p>

                        <p className="text-2xl font-bold text-green-600">
                          {inventory.availableQuantity}
                        </p>
                      </div>

                      <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          Reserved (in customer orders)
                        </p>

                        <p className="text-xl font-semibold text-blue-600">
                          {inventory.reservedQuantity}
                        </p>
                      </div>

                      <div className="rounded-xl bg-yellow-50 p-3 border border-yellow-100">
                        <p className="text-xs text-muted-foreground mb-1">
                          Threshold
                        </p>

                        <p className="text-xl font-semibold text-yellow-600">
                          {inventory.lowStockThreshold}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600"
                        onClick={() => {
                          setSelectedInventory(inventory);

                          setIsEditMode(true);

                          setCreateFormData({
                            productId: inventory.productId,
                            totalQuantity:
                              inventory.totalQuantity.toString(),
                            lowStockThreshold:
                              inventory.lowStockThreshold.toString(),
                          });

                          setShowCreateModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10">

                <p className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </p>

                <div className="flex gap-2">

                  <Button
                    variant="outline"
                    disabled={currentPage === 0}
                    onClick={() =>
                      setCurrentPage((prev) => prev - 1)
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={
                      currentPage === totalPages - 1
                    }
                    onClick={() =>
                      setCurrentPage((prev) => prev + 1)
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE/EDIT INVENTORY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl">
            <CardHeader>
              <CardTitle>
                {isEditMode ? 'Edit Inventory' : 'Add Inventory'}
              </CardTitle>
              <CardDescription>
                {isEditMode
                  ? 'Update stock quantity and alert settings for this product'
                  : 'Set up inventory tracking for a product'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditMode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Which product?</label>
                  <Select
                    value={createFormData.productId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setCreateFormData({
                        ...createFormData,
                        productId: value,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No products found. Create products first.
                        </div>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Stock Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={createFormData.totalQuantity}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      totalQuantity: e.target.value,
                    })
                  }
                  placeholder="Enter total items in stock"
                />
                <p className="text-xs text-muted-foreground">
                  Total number of items you have in inventory
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Low Stock Alert Threshold
                </label>
                <Input
                  type="number"
                  min="0"
                  value={createFormData.lowStockThreshold}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      lowStockThreshold: e.target.value,
                    })
                  }
                  placeholder="e.g., 5"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when available stock drops below this number
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateFormData({
                      productId: '',
                      totalQuantity: '',
                      lowStockThreshold: '',
                    });
                    setIsEditMode(false);
                    setSelectedInventory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600"
                  onClick={handleCreateInventory}
                >
                  {isEditMode ? 'Update Inventory' : 'Create Inventory'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}