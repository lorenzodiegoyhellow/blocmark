import { Button } from "@/components/ui/button";
import { Phone, ChevronRight, Download, Star, Clock, MessageCircle, Share2, Globe, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";

export function MobileAppSection() {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("+1");
  
  return (
    <div className="relative bg-white border-2 border-blue-100 text-gray-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
      </div>
      
      <div className="relative grid md:grid-cols-2 items-center gap-8">
        {/* Left Content */}
        <div className="p-8 md:p-12 lg:p-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 mb-6">
            <Phone className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{t("mobileApp.badge")}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">{t("mobileApp.title")}</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            {t("mobileApp.subtitle")}
          </p>
          
          <div className="space-y-8">
            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-14 px-6">
                <Download className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-normal">{t("mobileApp.downloadOn")}</span>
                  <span className="text-sm font-semibold -mt-1">{t("mobileApp.appStore")}</span>
                </div>
              </Button>
              
              <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-14 px-6">
                <Download className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-normal">{t("mobileApp.getItOn")}</span>
                  <span className="text-sm font-semibold -mt-1">{t("mobileApp.googlePlay")}</span>
                </div>
              </Button>
            </div>
            
            {/* Text Link Option */}
            <div>
              <p className="mb-2 text-gray-600 text-sm">{t("mobileApp.linkText")}</p>
              <div className="flex">
                <div className="relative">
                  <select 
                    className="h-12 w-20 rounded-l-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+49">+49</option>
                    <option value="+33">+33</option>
                    <option value="+81">+81</option>
                  </select>
                </div>
                <Input
                  type="tel"
                  placeholder="123-456-7890"
                  className="h-12 rounded-none border-l-0 border-r-0 border-gray-300 bg-white placeholder:text-gray-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button 
                  variant="default" 
                  className="h-12 rounded-l-none bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  disabled={!phoneNumber.trim()}
                >
                  Send Link
                </Button>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Quick Search</p>
                  <p className="text-sm text-gray-600">Find spaces in seconds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-blue-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Direct Chat</p>
                  <p className="text-sm text-gray-600">Message hosts instantly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Real-time Booking</p>
                  <p className="text-sm text-gray-600">Book with up-to-date availability</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-blue-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Worldwide Locations</p>
                  <p className="text-sm text-gray-600">Venues across the globe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Phone Mockup */}
        <div className="hidden md:flex justify-center items-center p-8">
          <div className="relative">
            {/* Floating elements around the phone */}
            <div className="absolute -top-10 -left-12 bg-white shadow-lg p-3 rounded-xl flex items-center gap-3 border border-blue-100 transform -rotate-6 z-10">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Rating 4.9/5</p>
                <p className="text-[10px] text-gray-600">From 10,000+ users</p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-8 bg-white shadow-lg p-3 rounded-xl flex items-center gap-3 border border-blue-100 transform rotate-6 z-10">
              <Share2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Easy Sharing</p>
                <p className="text-[10px] text-gray-600">With your team</p>
              </div>
            </div>
            
            {/* The actual phone */}
            <div className="relative w-[300px] h-[600px] rounded-[40px] border-[10px] border-gray-800 bg-white shadow-2xl overflow-hidden z-0">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
              
              {/* Status Bar */}
              <div className="h-10 bg-gray-100 flex items-center justify-between px-4 text-[10px] text-gray-800">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              {/* App Content */}
              <div className="relative h-[calc(100%-2.5rem)]">
                {/* Search Bar */}
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full h-10 pl-9 pr-4 rounded-full text-sm bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none"
                      placeholder="Find your perfect space..."
                    />
                    <Search className="w-4 h-4 absolute top-3 left-3 text-white/80" />
                  </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex justify-around px-2 py-3 bg-white border-b border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-md mb-1 flex items-center justify-center">
                      <span className="text-[8px] text-blue-600">All</span>
                    </div>
                    <span className="text-[8px] text-blue-600 font-medium">Discover</span>
                  </div>
                  
                  {["Photo", "Film", "Event", "Outdoor"].map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-6 h-6 bg-gray-100 rounded-md mb-1 flex items-center justify-center">
                        <span className="text-[8px] text-gray-500">{item[0]}</span>
                      </div>
                      <span className="text-[8px] text-gray-500">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* Featured Section */}
                <div className="p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">Featured Locations</span>
                    <div className="flex items-center text-cyan-600 text-[10px]">
                      <span>View all</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* Location Cards */}
                  <div className="space-y-3">
                    {/* Location 1 */}
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <div className="relative h-32 bg-gray-200">
                        <img 
                          src="/attached_assets/3.jpg" 
                          alt="Poolside location" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 bg-white p-1 rounded-full">
                          <div className="w-4 h-4"></div>
                        </div>
                        <div className="absolute top-2 left-2 bg-cyan-600 text-white text-[8px] px-2 py-0.5 rounded">
                          FEATURED
                        </div>
                      </div>
                      <div className="p-2 bg-white">
                        <div className="flex justify-between">
                          <h4 className="text-xs font-medium">Poolside in Silver Lake</h4>
                          <span className="text-xs font-semibold">$120/hr</span>
                        </div>
                        <div className="flex items-center text-[8px] text-gray-500">
                          <span className="flex items-center"><Star className="h-2 w-2 text-yellow-500 mr-0.5" />4.9</span>
                          <span className="mx-1">·</span>
                          <span>Los Angeles, CA</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location 2 */}
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <div className="relative h-32 bg-gray-200">
                        <img 
                          src="/attached_assets/1.jpg" 
                          alt="Modern home location" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 bg-white p-1 rounded-full">
                          <div className="w-4 h-4"></div>
                        </div>
                      </div>
                      <div className="p-2 bg-white">
                        <div className="flex justify-between">
                          <h4 className="text-xs font-medium">Modern Loft Downtown</h4>
                          <span className="text-xs font-semibold">$95/hr</span>
                        </div>
                        <div className="flex items-center text-[8px] text-gray-500">
                          <span className="flex items-center"><Star className="h-2 w-2 text-yellow-500 mr-0.5" />4.7</span>
                          <span className="mx-1">·</span>
                          <span>Los Angeles, CA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Navigation */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex justify-around items-center px-4">
                  {["home", "search", "bookings", "messages", "profile"].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full ${i === 0 ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
                      <span className={`text-[8px] mt-1 ${i === 0 ? 'text-cyan-600' : 'text-gray-500'}`}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}