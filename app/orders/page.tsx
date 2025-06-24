'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders } from '@/lib/orders';
import { Order } from '@/lib/supabase';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your orders</h1>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-48" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                When you place your first order, it will appear here.
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <span>Order #{order.id.slice(-8).toUpperCase()}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {formatDate(order.created_at)}
                          </p>
                          <p className="text-lg font-semibold">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={item.products?.image_url || '/placeholder-product.jpg'}
                                alt={item.products?.name || 'Product'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold line-clamp-1">
                                {item.products?.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="text-sm">
                            <p className="font-semibold">Shipping Address:</p>
                            <p>{order.shipping_address.fullName}</p>
                            <p>{order.shipping_address.address}</p>
                            <p>
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          Payment: Card ending in ****{order.payment_intent_id?.slice(-4)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}