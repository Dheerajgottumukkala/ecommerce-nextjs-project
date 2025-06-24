'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X,
  LogOut,
  Settings,
  Package,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useTheme } from 'next-themes';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const cartItemsCount = getTotalItems();

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 10 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 perspective-1000"
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-gradient magnetic"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="text-white font-bold text-sm" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent holographic"
                whileHover={{ scale: 1.05 }}
              >
                EliteStore
              </motion.span>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <motion.form 
              onSubmit={handleSearch} 
              className="flex w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 glass magnetic"
                  />
                </motion.div>
              </div>
              <Button type="submit" className="ml-2 magnetic pulse-glow">
                Search
              </Button>
            </motion.form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {[
              { href: "/products", label: "Products" },
              { href: "/categories", label: "Categories" },
              { href: "/deals", label: "Deals" }
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <Link 
                  href={item.href} 
                  className="text-sm font-medium hover:text-primary transition-colors magnetic"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative magnetic">
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {cartItemsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-in pulse-glow"
                        >
                          {cartItemsCount}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            </motion.div>

            {/* Wishlist */}
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="magnetic">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* User Menu */}
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full magnetic">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer magnetic">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer magnetic">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer magnetic">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="magnetic">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Toggle Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="magnetic">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button variant="ghost" asChild className="magnetic">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="magnetic pulse-glow">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden magnetic"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search */}
        <motion.div 
          className="mt-4 md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass magnetic"
              />
            </div>
            <Button type="submit" className="ml-2 magnetic">
              Search
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t glass"
          >
            <nav className="container mx-auto px-4 py-4 space-y-4">
              {[
                { href: "/products", label: "Products" },
                { href: "/categories", label: "Categories" },
                { href: "/deals", label: "Deals" }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link 
                    href={item.href} 
                    className="block text-sm font-medium hover:text-primary transition-colors magnetic"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}