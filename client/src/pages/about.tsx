import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Globe, Zap, Shield, CheckCircle, Search, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Link } from "wouter";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <AppLayout>


      <div className="bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Story Section */}
          <div className="py-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                    Our Story
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    Building the Future of Location Booking
                  </h2>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Founded in 2023, Blocmark emerged from a simple yet powerful vision: to transform how creative professionals discover and book unique filming locations. We recognized the challenges faced by filmmakers, photographers, and event planners in finding the perfect spaces for their projects.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Our AI-powered platform connects creative professionals with a curated network of extraordinary locations, from hidden architectural gems to stunning natural landscapes.
                  </p>
                </div>

              </div>
              <div className="relative">
                <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                  <img 
                    src="/attached_assets/priscilla-du-preez-XkKCui44iM0-unsplash_1755067388523.jpg"
                    alt="Creative team collaborating in a modern workspace"
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold">2023</div>
                    <div className="text-sm opacity-90">Founded</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="py-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                Our Mission & Values
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Driving Innovation in Creative Industries
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We believe in empowering creativity through innovative technology and exceptional service.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 bg-white hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Innovation First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We leverage cutting-edge AI technology to revolutionize how creative professionals discover and book locations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Users className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Community Driven</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform thrives on collaboration between hosts, filmmakers, photographers, and artists worldwide.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Globe className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Global Impact</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Building a worldwide network that celebrates diversity and connects cultures through creative spaces.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-6 max-w-7xl py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of creative professionals who trust Blocmark to bring their visions to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg rounded-xl">
                  <Search className="w-5 h-5 mr-2" />
                  Find Locations
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/add-listing">
                <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-xl">
                  <Building2 className="w-5 h-5 mr-2" />
                  List Your Space
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}