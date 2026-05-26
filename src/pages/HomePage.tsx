import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, Users, Package, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Hero Section - Centered */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <Footprints className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gray-900 tracking-tight">
            ShoeFlow
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
            Premium Footwear for Every Step
          </p>

          {/* Description */}
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover the latest trends in footwear. From athletic performance to casual comfort, 
            we bring you the finest collection from top brands worldwide.
          </p>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 h-14 px-10 text-base font-semibold gap-2 shadow-lg shadow-orange-500/30 transition-all hover:scale-105 w-full sm:w-auto">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="h-14 px-10 text-base font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-all w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">50,000+ Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="font-medium">10,000+ Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-page">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose ShoeFlow?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We're committed to providing you with the best shopping experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Quality Guaranteed',
                desc: 'Every pair is carefully inspected and sourced from authorized dealers.',
              },
              {
                icon: Truck,
                title: 'Fast & Free Delivery',
                desc: 'Free shipping on orders over $75. Most orders arrive within 2-3 business days.',
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns',
                desc: 'Not the right fit? Return within 30 days for a full refund or exchange.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Step Up Your Game?</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied customers and find your perfect pair today.
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold h-14 px-10 shadow-lg"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
