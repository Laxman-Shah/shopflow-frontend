import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/data/mockProducts';

interface ProductStore {
  products: Product[];
  
  getProductById: (id: string) => Product | undefined;
  updateProductStock: (productId: string, newStock: number) => void;
  decreaseStock: (productId: string, quantity: number) => void;
  increaseStock: (productId: string, quantity: number) => void;
  resetProducts: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,

      getProductById: (id: string) => {
        return get().products.find((p) => p.id === id);
      },

      updateProductStock: (productId: string, newStock: number) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  stock: newStock,
                  inStock: newStock > 0,
                }
              : p
          ),
        }));
      },

      decreaseStock: (productId: string, quantity: number) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId && p.stock !== undefined) {
              const newStock = Math.max(0, p.stock - quantity);
              return {
                ...p,
                stock: newStock,
                inStock: newStock > 0,
              };
            }
            return p;
          }),
        }));
      },

      increaseStock: (productId: string, quantity: number) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId && p.stock !== undefined) {
              const newStock = p.stock + quantity;
              return {
                ...p,
                stock: newStock,
                inStock: newStock > 0,
              };
            }
            return p;
          }),
        }));
      },

      resetProducts: () => {
        set({ products: MOCK_PRODUCTS });
      },
    }),
    {
      name: 'shopflow-products',
    }
  )
);
