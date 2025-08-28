import { CreditCard, CalendarCheck, Shield, TrendingUp, Home, Landmark, Cloud, Search, Star, Clock, Users, CheckCircle, ArrowRight, Sparkles, Zap, Target, DollarSign, Calendar, ShieldCheck, Rocket, Globe, Settings, Verified, Bot, Lock, Timer, Eye, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";

export function HostBenefitsSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'hosts' | 'renters'>('hosts');

  const hostBenefits = [
    {
      icon: <DollarSign className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.getPaidTitle"),
      description: t("hostBenefits.getPaidDesc")
    },
    {
      icon: <Calendar className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.scheduleTitle"),
      description: t("hostBenefits.scheduleDesc")
    },
    {
      icon: <ShieldCheck className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.peaceTitle"),
      description: t("hostBenefits.peaceDesc")
    },
    {
      icon: <Rocket className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.zeroTitle"),
      description: t("hostBenefits.zeroDesc")
    },
    {
      icon: <Globe className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.spotlightTitle"),
      description: t("hostBenefits.spotlightDesc")
    },
    {
      icon: <Settings className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.controlTitle"),
      description: t("hostBenefits.controlDesc")
    },
  ];

  const renterBenefits = [
    {
      icon: <Verified className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.verifiedTitle"),
      description: t("hostBenefits.verifiedDesc")
    },
    {
      icon: <Bot className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.aiTitle"),
      description: t("hostBenefits.aiDesc")
    },
    {
      icon: <Lock className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.bookTitle"),
      description: t("hostBenefits.bookDesc")
    },
    {
      icon: <Timer className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.minutesTitle"),
      description: t("hostBenefits.minutesDesc")
    },
    {
      icon: <Eye className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: t("hostBenefits.hiddenTitle"),
      description: "Discover secret corners, off-the-grid gems, and exclusive listings."
    },
    {
      icon: <Brain className="w-5 h-5 xl:w-6 xl:h-6" />,
      title: "Smart Support",
      description: "Our AI and real people are available 24/7 to guide you."
    },
  ];

  const currentBenefits = activeTab === 'hosts' ? hostBenefits : renterBenefits;
  const currentTitle = activeTab === 'hosts' ? t('hostBenefits.whyListTitle') : t('hostBenefits.whyChooseTitle');

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 pb-20 pt-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            {currentTitle}
          </h2>
          
          {/* Sleek Tab Navigation */}
          <div className="relative flex justify-center">
            <div className="relative inline-flex items-center bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200/50">
              <div
                className={`absolute top-1 bottom-1 bg-white rounded-lg transition-all duration-300 ease-out shadow-sm ${
                  activeTab === 'hosts' ? 'left-1 w-[calc(50%-0.25rem)]' : 'left-1/2 w-[calc(50%-0.25rem)]'
                }`}
              ></div>
              <button
                onClick={() => setActiveTab('hosts')}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'hosts'
                    ? 'text-gray-900 z-10'
                    : 'text-gray-600 hover:text-gray-800 z-10'
                }`}
              >
                <Home className="h-4 w-4" />
                Hosts
              </button>
              <button
                onClick={() => setActiveTab('renters')}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'renters'
                    ? 'text-gray-900 z-10'
                    : 'text-gray-600 hover:text-gray-800 z-10'
                }`}
              >
                <Search className="h-4 w-4" />
                Renters
              </button>
            </div>
          </div>
        </div>

        {/* Premium Benefits Grid - All 6 in one row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 xl:gap-4 mb-20">
          {currentBenefits.map((benefit, index) => {
            const colors = [
              { bg: 'from-emerald-100 to-green-100', icon: 'text-emerald-600', glow: 'from-emerald-500/20 to-green-500/20', hover: 'from-emerald-50/80 to-green-50/80' },
              { bg: 'from-blue-100 to-cyan-100', icon: 'text-blue-600', glow: 'from-blue-500/20 to-cyan-500/20', hover: 'from-blue-50/80 to-cyan-50/80' },
              { bg: 'from-purple-100 to-indigo-100', icon: 'text-purple-600', glow: 'from-purple-500/20 to-indigo-500/20', hover: 'from-purple-50/80 to-indigo-50/80' },
              { bg: 'from-orange-100 to-amber-100', icon: 'text-orange-600', glow: 'from-orange-500/20 to-amber-500/20', hover: 'from-orange-50/80 to-amber-50/80' },
              { bg: 'from-teal-100 to-cyan-100', icon: 'text-teal-600', glow: 'from-teal-500/20 to-cyan-500/20', hover: 'from-teal-50/80 to-cyan-50/80' },
              { bg: 'from-rose-100 to-pink-100', icon: 'text-rose-600', glow: 'from-rose-500/20 to-pink-500/20', hover: 'from-rose-50/80 to-pink-50/80' }
            ][index];

            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-4 xl:p-5 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-3 overflow-hidden"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Dynamic Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.hover} opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl`}></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                
                <div className="relative z-10 text-center">
                  {/* Icon Container with unique colors */}
                  <div className={`relative w-14 h-14 xl:w-16 xl:h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center ${colors.icon} mb-4 xl:mb-5 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}></div>
                    <div className="relative">
                      {benefit.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-base xl:text-lg font-bold text-gray-900 mb-2 xl:mb-3 group-hover:text-gray-800 transition-colors duration-300 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs xl:text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {benefit.description}
                  </p>
                </div>
                
                {/* Success indicator dot */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"></div>
              </div>
            );
          })}
        </div>



        {/* Final CTA Section */}
        <div className="text-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 rounded-3xl p-12 md:p-16 text-white">
          <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {t("hostBenefits.ctaTitle")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {t("hostBenefits.ctaSubtitle")}
            </span>
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link href="/auth?signup=true">
              <Button 
                size="lg" 
                className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl group border-2 border-blue-400/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t("hostBenefits.propertyOwner")}
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            
            <Link href="/simple-search">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-12 py-6 rounded-2xl text-xl font-bold bg-white/95 text-gray-900 border-2 border-white hover:bg-white hover:shadow-2xl transition-all duration-300 shadow-xl group backdrop-blur-sm"
              >
                <span className="flex items-center gap-3 text-gray-900">
                  {t("hostBenefits.renterCreator")}
                  <Search className="h-6 w-6 group-hover:scale-110 transition-transform duration-300 text-gray-900" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}