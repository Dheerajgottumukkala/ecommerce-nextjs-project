'use client';

import { useState, useEffect } from 'react';
import { supabase, WishlistItem, Product } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<(WishlistItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      // Check if item already exists
      const existingItem = items.find(item => item.product_id === productId);
      
      if (existingItem) {
        toast.info('Item is already in your wishlist');
        return;
      }

      // Add new item
      const { error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          product_id: productId,
        }]);

      if (error) throw error;

      await fetchWishlistItems();
      toast.success('Item added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchWishlistItems();
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    const existingItem = items.find(item => item.product_id === productId);
    
    if (existingItem) {
      await removeFromWishlist(existingItem.id);
    } else {
      await addToWishlist(productId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setItems([]);
    }
  }, [user]);

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refetch: fetchWishlistItems,
  };
}