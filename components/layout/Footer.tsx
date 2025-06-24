import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EliteStore
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premium destination for quality products and exceptional service. 
              We bring you the best selection at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors">
                  Special Deals
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Stay Updated</h4>
            <p className="text-xs text-muted-foreground">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            <div className="space-y-2">
              <Input placeholder="Enter your email" type="email" />
              <Button className="w-full" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>support@elitestore.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>123 Commerce St, Business City</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
          <p>&copy; 2024 EliteStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}