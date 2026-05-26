import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem, Product } from '@/types';

import { cartService } from '@/services/cartService';
import { inventoryService } from '@/services/inventoryService';

import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (
    product: Product,
    quantity?: number
  ) => Promise<void>;

  removeItem: (
    productId: string
  ) => Promise<void>;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  openCart: () => void;

  closeCart: () => void;

  totalItems: () => number;

  totalPrice: () => number;

  syncWithBackend: () => Promise<void>;

  loadFromBackend: () => Promise<void>;
}

export const useCartStore =
  create<CartStore>()(
    persist<CartStore>(
      (set, get) => ({
        items: [],

        isOpen: false,

        // =====================================
        // ADD ITEM
        // =====================================
        addItem: async (
          product,
          quantity = 1
        ) => {
          // Out of stock
          if (
            !product.inStock ||
            product.stock === 0
          ) {
            throw new Error(
              'Product is out of stock'
            );
          }

          // Existing item
          const existingItem =
            get().items.find(
              (i) =>
                i.product.id ===
                product.id
            );

          const currentQuantity =
            existingItem?.quantity || 0;

          const newQuantity =
            currentQuantity + quantity;

          // Prevent exceeding stock
          if (
            product.stock !== undefined &&
            newQuantity > product.stock
          ) {
            throw new Error(
              `Only ${product.stock} items available in stock`
            );
          }

          // Auth state
          const {
            isAuthenticated,
            user,
          } = useAuthStore.getState();

          // =====================================
          // AUTHENTICATED USER
          // =====================================
          if (isAuthenticated) {
            // Only customers
            if (
              user?.role !==
              'CUSTOMER'
            ) {
              throw new Error(
                'Only customers can add items to cart'
              );
            }

            // Check inventory before adding to cart (frontend validation as safety net)
            try {
              const inventoryResponse = await inventoryService.getInventoryByProduct(product.id);
              if (inventoryResponse.success && inventoryResponse.data) {
                const inventory = inventoryResponse.data;
                const availableStock = inventory.availableQuantity;
                
                if (availableStock <= 0) {
                  throw new Error('Product is out of stock');
                }
                
                if (newQuantity > availableStock) {
                  throw new Error(`Only ${availableStock} items available in stock`);
                }
              }
            } catch (error: any) {
              // If inventory check fails, re-throw the error to block the action
              throw new Error(
                error?.message || 'Inventory check failed'
              );
            }

            try {
              await cartService.addToCart(
                {
                  productId:
                    product.id,

                  quantity:
                    Math.floor(
                      quantity
                    ),
                }
              );

              // Reload from backend
              await get().syncWithBackend();

              return;
            } catch (error: any) {
              console.error(
                'Failed to sync cart with backend:',
                error
              );

              throw new Error(
                error?.response?.data
                  ?.message ||
                  'Failed to add item to cart'
              );
            }
          }

          // =====================================
          // GUEST USER
          // =====================================
          set((state) => {
            const existing =
              state.items.find(
                (i) =>
                  i.product.id ===
                  product.id
              );

            // Update existing quantity
            if (existing) {
              return {
                items:
                  state.items.map(
                    (i) =>
                      i.product.id ===
                      product.id
                        ? {
                            ...i,

                            quantity:
                              i.quantity +
                              quantity,
                          }
                        : i
                  ),
              };
            }

            // Add new item
            return {
              items: [
                ...state.items,

                {
                  product,

                  quantity,
                },
              ],
            };
          });

          // Decrease stock for guest users
          useProductStore.getState().decreaseStock(product.id, quantity);
        },

        // =====================================
        // REMOVE ITEM
        // =====================================
        removeItem: async (
          productId
        ) => {
          // Get item quantity before removal for stock restoration
          const item = get().items.find(
            (i) => i.product.id === productId
          );
          const quantity = item?.quantity || 0;

          // Local remove
          set((state) => ({
            items:
              state.items.filter(
                (i) =>
                  i.product.id !==
                  productId
              ),
          }));

          // Backend sync
          const {
            isAuthenticated,
          } =
            useAuthStore.getState();

          if (isAuthenticated) {
            try {
              await cartService.removeCartItem(
                productId
              );

              await get().syncWithBackend();
            } catch (error) {
              console.error(
                'Failed to remove cart item:',
                error
              );
            }
          } else {
            // Increase stock for guest users
            useProductStore.getState().increaseStock(productId, quantity);
          }
        },

        // =====================================
        // UPDATE QUANTITY
        // =====================================
        updateQuantity: async (
          productId,
          quantity
        ) => {
          // Remove if qty <= 0
          if (quantity <= 0) {
            await get().removeItem(
              productId
            );

            return;
          }

          // Find item
          const item =
            get().items.find(
              (i) =>
                i.product.id ===
                productId
            );

          if (!item) return;

          // Prevent exceeding stock
          if (
            item.product.stock !==
              undefined &&
            quantity >
              item.product.stock
          ) {
            throw new Error(
              `Only ${item.product.stock} items available in stock`
            );
          }

          const {
            isAuthenticated,
          } =
            useAuthStore.getState();

          // =====================================
          // AUTHENTICATED USER
          // =====================================
          if (isAuthenticated) {
            // Check inventory before updating quantity (frontend validation as safety net)
            try {
              const inventoryResponse = await inventoryService.getInventoryByProduct(productId);
              if (inventoryResponse.success && inventoryResponse.data) {
                const inventory = inventoryResponse.data;
                const availableStock = inventory.availableQuantity;
                
                if (quantity > availableStock) {
                  throw new Error(`Only ${availableStock} items available in stock`);
                }
              }
            } catch (error: any) {
              // If inventory check fails, re-throw the error to block the action
              throw new Error(
                error?.message || 'Inventory check failed'
              );
            }

            try {
              await cartService.updateCartItem(
                productId,
                {
                  quantity:
                    Math.floor(
                      quantity
                    ),
                }
              );

              await get().syncWithBackend();

              return;
            } catch (error: any) {
              console.error(
                'Failed to update cart:',
                error
              );

              throw new Error(
                error?.response?.data
                  ?.message ||
                  'Failed to update cart'
              );
            }
          }

          // =====================================
          // GUEST USER
          // =====================================
          const oldQuantity = item.quantity;
          const quantityDiff = quantity - oldQuantity;

          set((state) => ({
            items:
              state.items.map(
                (i) =>
                  i.product.id ===
                  productId
                    ? {
                        ...i,

                        quantity,
                      }
                    : i
              ),
          }));

          // Adjust stock for guest users
          if (quantityDiff > 0) {
            useProductStore.getState().decreaseStock(productId, quantityDiff);
          } else if (quantityDiff < 0) {
            useProductStore.getState().increaseStock(productId, Math.abs(quantityDiff));
          }
        },

        // =====================================
        // CLEAR CART
        // =====================================
        clearCart: async () => {
          // Get items before clearing for stock restoration
          const items = get().items;

          set({
            items: [],
          });

          const {
            isAuthenticated,
          } =
            useAuthStore.getState();

          if (isAuthenticated) {
            try {
              await cartService.clearCart();
            } catch (error) {
              console.error(
                'Failed to clear backend cart:',
                error
              );
            }
          } else {
            // Restore stock for guest users
            items.forEach((item) => {
              useProductStore.getState().increaseStock(item.product.id, item.quantity);
            });
          }
        },

        // =====================================
        // UI
        // =====================================
        openCart: () =>
          set({
            isOpen: true,
          }),

        closeCart: () =>
          set({
            isOpen: false,
          }),

        // =====================================
        // TOTAL ITEMS
        // =====================================
        totalItems: () =>
          get().items.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          ),

        // =====================================
        // TOTAL PRICE
        // =====================================
        totalPrice: () =>
          get().items.reduce(
            (sum, item) => {
              const price =
                Number(
                  item.product
                    .price || 0
                );

              const quantity =
                Number(
                  item.quantity || 0
                );

              return (
                sum +
                price * quantity
              );
            },
            0
          ),

        // =====================================
        // SYNC BACKEND
        // =====================================
        syncWithBackend:
          async () => {
            const {
              isAuthenticated,
            } =
              useAuthStore.getState();

            if (!isAuthenticated)
              return;

            try {
              const response =
                await cartService.getMyCart();

              console.log(
                'Cart Response:',
                response.data.items
              );

              // Map backend data
              const mappedItems: CartItem[] =
                await Promise.all(
                  response.data.items.map(
                    async (item: any) => {
                      // Fetch inventory for each product to get accurate stock
                      let availableStock = item.availableStock || 0;
                      try {
                        const inventoryResponse = await inventoryService.getInventoryByProduct(item.productId);
                        if (inventoryResponse.success && inventoryResponse.data) {
                          availableStock = inventoryResponse.data.availableQuantity;
                        }
                      } catch (error) {
                        console.warn('Failed to fetch inventory for product:', item.productId);
                      }

                      return {
                        product: {
                          id:
                            item.productId,

                          name:
                            item.productName ||
                            'Unknown Product',

                          slug:
                            item.productSlug ||
                            item.productId,

                          // FIXED PRICE
                          price: Number(
                            item.productPrice ??
                              item.price ??
                              item.unitPrice ??
                              0
                          ),

                          category:
                            'all',

                          images:
                            item.productThumbnailUrl
                              ? [
                                  item.productThumbnailUrl,
                                ]
                              : [],

                          description:
                            '',

                          inStock:
                            availableStock > 0,

                          stock:
                            availableStock,

                          rating: 0,

                          reviewCount: 0,

                          tags: [],

                          specs: {},
                        },

                        quantity: Number(
                          item.quantity ||
                            1
                        ),
                      };
                    }
                  )
                );

              set({
                items:
                  mappedItems,
              });
            } catch (error) {
              console.error(
                'Failed to sync cart with backend:',
                error
              );
            }
          },

        // =====================================
        // LOAD
        // =====================================
        loadFromBackend:
          async () => {
            await get().syncWithBackend();
          },
      }),

      {
        name: 'shopflow-cart',
      }
    )
  );