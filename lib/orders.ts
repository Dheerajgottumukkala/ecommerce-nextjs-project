import { supabase } from './supabase';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderData {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: any;
}

export async function createOrder(orderData: CreateOrderData): Promise<string> {
  try {
    // Start a transaction by creating the order first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: orderData.userId,
          total_amount: orderData.totalAmount,
          status: 'pending',
          shipping_address: orderData.shippingAddress,
          payment_intent_id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Mock payment intent
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock quantities
    for (const item of orderData.items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity,
      });

      if (stockError) {
        console.error('Error updating stock for product:', item.productId, stockError);
        // Don't throw here as the order is already created
      }
    }

    return order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again.');
  }
}

export async function getUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}