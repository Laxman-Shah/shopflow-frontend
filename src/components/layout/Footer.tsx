import { Link } from 'react-router-dom';
import { Zap, Twitter, Instagram, Youtube, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/products' },
    { label: 'Electronics', to: '/products?category=electronics' },
    { label: 'Clothing', to: '/products?category=clothing' },
    { label: 'Home & Office', to: '/products?category=home' },
    { label: 'Sports', to: '/products?category=sports' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Track Your Order', to: '#' },
    { label: 'Returns & Exchanges', to: '#' },
    { label: 'Shipping Info', to: '#' },
    { label: 'Contact Us', to: '#' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Press', to: '#' },
    { label: 'Affiliates', to: '#' },
    { label: 'Sustainability', to: '#' },
  ],
};

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-brand text-brand-foreground mt-auto">
      <div className="container-page py-12">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </span>
              ShopFlow
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your premium destination for electronics, fashion, home goods, and
              sports gear. Curated quality, delivered fast.
            </p>
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Stay in the loop</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-primary"
                />
                <Button size="sm" className="bg-primary hover:bg-primary/90 shrink-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-3 text-sm text-white">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} ShopFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8">
                  <Icon className="w-4 h-4" />
                </Button>
              </a>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
