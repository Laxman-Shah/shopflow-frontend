import { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { categoryService, type Category } from '@/services/categoryService';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAllCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    if (formData.name.trim().length < 2) {
      setErrors({ name: 'Category name must be at least 2 characters' });
      return;
    }

    if (formData.name.trim().length > 100) {
      setErrors({ name: 'Category name must be less than 100 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await categoryService.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
      });

      if (response.success) {
        toast.success('Category created successfully');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', parentId: '' });
        loadCategories();
      }
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to create category');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    if (formData.name.trim().length < 2) {
      setErrors({ name: 'Category name must be at least 2 characters' });
      return;
    }

    if (formData.name.trim().length > 100) {
      setErrors({ name: 'Category name must be less than 100 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await categoryService.updateCategory(selectedCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
      });

      if (response.success) {
        toast.success('Category updated successfully');
        setShowEditModal(false);
        setFormData({ name: '', description: '', parentId: '' });
        setSelectedCategory(null);
        loadCategories();
      }
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to update category');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);

    try {
      const response = await categoryService.deleteCategory(selectedCategory.id);

      if (response.success) {
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setSelectedCategory(null);
        loadCategories();
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = buildCategoryTree(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = children.length > 0;

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpand(category.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-5 h-5 text-primary" />
          ) : (
            <Folder className="w-5 h-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-muted-foreground">{category.description}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => openDeleteModal(category)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>{children.map((child) => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rootCategories = buildCategoryTree(null);

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Category Management</h1>
              <p className="text-muted-foreground">Manage product categories and their hierarchy</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search query' : 'Get started by adding a category'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {searchQuery
                  ? filteredCategories.map((cat) => renderCategory(cat, 0))
                  : rootCategories.map((cat) => renderCategory(cat, 0))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Category</CardTitle>
              <CardDescription>Create a new product category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter category name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category (Optional)</label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value ?? '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (Root category)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', parentId: '' });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateCategory} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Category</CardTitle>
              <CardDescription>Update category information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter category name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category (Optional)</label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value ?? '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (Root category)</SelectItem>
                    {categories
                      .filter((cat) => cat.id !== selectedCategory.id)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({ name: '', description: '', parentId: '' });
                    setSelectedCategory(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleUpdateCategory} disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Category</CardTitle>
              <CardDescription>
                Are you sure you want to delete "{selectedCategory.name}"? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteCategory}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Category'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
