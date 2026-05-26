import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Footprints,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { productService, type Product } from '@/services/productService';
import { categoryService, type Category } from '@/services/categoryService';
import { useAuthStore } from '@/store/authStore';
import { resolveImageUrl } from '@/lib/imageUrl';

export function SellerProductsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'INACTIVE',
    imageUrls: [] as string[],
  });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('SellerProductsPage mounted');
    console.log('User authenticated:', isAuthenticated);
    console.log('User role:', user?.role);
    console.log('User ID:', user?.userId);

    if (!isAuthenticated || user?.role !== 'SELLER') {
      toast.error('You must be logged in as a seller to view this page');
      return;
    }

    loadProducts();
    loadCategories();
  }, [isAuthenticated, user]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      console.log('Calling getMyProducts API...');
      const response = await productService.getMyProducts();

      console.log('Seller products response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);

      if (response.success && response.data) {
        // Backend returns ProductPageResponse with 'products' field
        const products = response.data.products || [];

        console.log('Products loaded:', products);
        console.log('Products count:', products.length);

        // Map backend ProductListResponse to frontend Product format
        const mappedProducts = products.map((p: any) => {
          console.log(`Product ${p.name} thumbnailUrl:`, p.thumbnailUrl);
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            thumbnailUrl: p.thumbnailUrl || null,
            status: p.status,
            categoryId: p.categoryId,
            sellerId: p.sellerId,
            categoryName: p.categoryName,
            createdAt: p.createdAt,
          };
        });

        console.log('Mapped products:', mappedProducts);
        setProducts(mappedProducts);

        if (mappedProducts.length === 0) {
          toast.info('No products found. Create your first product to get started.');
        } else {
          toast.success(`Loaded ${mappedProducts.length} product(s)`);
        }
      } else {
        console.log('Response not successful or no data');
        toast.error('Failed to load products: Invalid response');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();

      console.log('Categories response:', response);

      if (response.success && response.data) {
        setCategories(response.data);
        console.log('Categories loaded:', response.data);
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && formData.imageUrls.length < 10) {
      if (imageUrlInput.trim().length > 1000) {
        toast.error('Image URL must not exceed 1000 characters');
        return;
      }
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, imageUrlInput.trim()],
      });
      setImageUrlInput('');
    } else if (formData.imageUrls.length >= 10) {
      toast.error('Maximum 10 images allowed');
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const total = formData.imageUrls.length + pendingFiles.length + selected.length;
    if (total > 10) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }

    const valid = selected.filter((file) => file.type.startsWith('image/'));
    if (valid.length !== selected.length) {
      toast.error('Only image files are allowed');
    }

    setPendingFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetProductForm = () => {
    setFormData({ name: '', description: '', price: '', categoryId: '', status: 'ACTIVE', imageUrls: [] });
    setImageUrlInput('');
    setPendingFiles([]);
    setErrors({});
  };

  const handleCreateProduct = async () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Product name is required' });
      return;
    }

    if (formData.name.trim().length < 3) {
      setErrors({ name: 'Product name must be at least 3 characters' });
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setErrors({ price: 'Price must be greater than 0' });
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: 'Category is required' });
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        status: formData.status,
        imageUrls: formData.imageUrls,
      };

      const response = await productService.createProductWithImages(productData, pendingFiles);

      console.log('Create product response:', response);
      console.log('Create product success:', response.success);

      if (response.success) {
        toast.success('Product created successfully');
        setShowCreateModal(false);
        resetProductForm();
        loadProducts();
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorData = error.response?.data;

      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to create product');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Product name is required' });
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setErrors({ price: 'Price must be greater than 0' });
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: 'Category is required' });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        status: formData.status,
        imageUrls: formData.imageUrls,
      };

      console.log('Updating product with data:', updateData);
      console.log('Image URLs being sent:', formData.imageUrls);
      console.log('Image URLs count:', formData.imageUrls.length);

      const response = await productService.updateProductWithImages(
        selectedProduct.id,
        updateData,
        pendingFiles
      );

      console.log('Update product response:', response);
      console.log('Update product success:', response.success);

      if (response.success) {
        toast.success('Product updated successfully');
        setShowEditModal(false);
        resetProductForm();
        setSelectedProduct(null);
        loadProducts();
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Update product error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorData = error.response?.data;

      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to update product');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);

    try {
      const response = await productService.deleteProduct(selectedProduct.id);

      if (response.success) {
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        loadProducts();
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId,
      status: product.status,
      imageUrls: product.thumbnailUrl ? [product.thumbnailUrl] : [],
    });
    setPendingFiles([]);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600 text-lg">Create and manage your footwear products</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 h-12 px-6 text-base font-semibold shadow-lg shadow-orange-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Info Banner */}
          <Card className="mb-6 bg-orange-50 border-orange-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Footprints className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    Product → Inventory Flow
                  </p>
                  <p className="text-sm text-gray-600">
                    First create a product with details, then manage inventory separately.
                    After creating a product, go to "Manage Inventory" to set stock levels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300 focus:border-orange-500"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-[200px] h-12 border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[160px] h-12 border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={loadProducts}
              className="h-12 border-gray-300 hover:border-orange-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-gray-200 rounded-2xl">
            <CardContent className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first product'}
              </p>
              {!searchQuery && categoryFilter === 'ALL' && statusFilter === 'ALL' && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 h-12 px-8 text-base font-semibold shadow-lg shadow-orange-500/30"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all rounded-2xl">
                <div className="aspect-video bg-gray-50 flex items-center justify-center relative">
                  {product.thumbnailUrl ? (
                    <img
                      src={resolveImageUrl(product.thumbnailUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', product.thumbnailUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', product.thumbnailUrl);
                      }}
                    />
                  ) : null}
                  <div className={`flex flex-col items-center gap-2 ${product.thumbnailUrl ? 'hidden' : ''}`}>
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                      <Footprints className="w-10 h-10 text-orange-500" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">No image</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-600">{product.description}</CardDescription>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">
                        {product.categoryName || categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-gray-300 hover:border-orange-500 hover:text-orange-500 font-semibold"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold"
                      onClick={() => openDeleteModal(product)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 rounded-2xl shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Add New Product</CardTitle>
                  <CardDescription className="text-gray-600">Create a new footwear product for your store</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter product name"
                  className={`h-11 border-gray-300 focus:border-orange-500 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Enter product description"
                  className={`h-11 border-gray-300 focus:border-orange-500 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      setErrors({ ...errors, price: '' });
                    }}
                    placeholder="0.00"
                    className={`h-11 border-gray-300 focus:border-orange-500 ${errors.price ? 'border-red-500' : ''}`}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setFormData({ ...formData, categoryId: value });
                      setErrors({ ...errors, categoryId: '' });
                    }}
                  >
                    <SelectTrigger className={`h-11 border-gray-300 focus:border-orange-500 ${errors.categoryId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'DRAFT' | 'ACTIVE' | 'INACTIVE' })}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Images</label>
                <p className="text-sm text-gray-500">
                  Upload images (max 10, 5MB each) or add external URLs.
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                {pendingFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {pendingFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removePendingFile(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                    className="h-11 border-gray-300 focus:border-orange-500"
                  />
                  <Button type="button" onClick={addImageUrl} variant="outline" className="h-11 border-gray-300 hover:border-orange-500">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.imageUrls.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm flex-1 truncate text-gray-700">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:border-gray-400 font-semibold"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetProductForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 font-semibold shadow-lg shadow-orange-500/30"
                  onClick={handleCreateProduct}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 rounded-2xl shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Edit className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Edit Product</CardTitle>
                  <CardDescription className="text-gray-600">Update product information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter product name"
                  className={`h-11 border-gray-300 focus:border-orange-500 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Enter product description"
                  className={`h-11 border-gray-300 focus:border-orange-500 ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      setErrors({ ...errors, price: '' });
                    }}
                    placeholder="0.00"
                    className={`h-11 border-gray-300 focus:border-orange-500 ${errors.price ? 'border-red-500' : ''}`}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setFormData({ ...formData, categoryId: value });
                      setErrors({ ...errors, categoryId: '' });
                    }}
                  >
                    <SelectTrigger className={`h-11 border-gray-300 focus:border-orange-500 ${errors.categoryId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'DRAFT' | 'ACTIVE' | 'INACTIVE' })}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Images</label>
                <p className="text-sm text-gray-500">
                  Upload images (max 10, 5MB each) or add external URLs.
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                {pendingFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {pendingFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removePendingFile(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                    className="h-11 border-gray-300 focus:border-orange-500"
                  />
                  <Button type="button" onClick={addImageUrl} variant="outline" className="h-11 border-gray-300 hover:border-orange-500">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.imageUrls.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm flex-1 truncate text-gray-700">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:border-gray-400 font-semibold"
                  onClick={() => {
                    setShowEditModal(false);
                    resetProductForm();
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 font-semibold shadow-lg shadow-orange-500/30"
                  onClick={handleUpdateProduct}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Product Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-gray-200 rounded-2xl shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Delete Product</CardTitle>
                  <CardDescription className="text-gray-600">This action cannot be undone</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedProduct.name}"</span>?
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:border-gray-400 font-semibold"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 font-semibold"
                  onClick={handleDeleteProduct}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
