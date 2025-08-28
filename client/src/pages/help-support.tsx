import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone, Sparkles, ArrowRight, Clock, Shield, Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { SupportEmailForm } from "@/components/support-email-form";
import { IntercomFallbackButton } from "@/components/intercom-fallback-button";

export default function HelpSupportPage() {
  const { t } = useTranslation();
  const [showEmailForm, setShowEmailForm] = useState(false);
  

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("help.title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the help you need, when you need it. Choose your preferred support channel below.
          </p>
        </div>

        {/* Contact Methods */}
        <div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100/50 hover:from-blue-100 hover:to-indigo-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{t("help.liveChat")}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Get instant answers from our support team. Perfect for urgent questions and real-time assistance.
                  </p>
                  <IntercomFallbackButton 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    text="Start Chat Now"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100/50 hover:from-emerald-100 hover:to-green-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{t("help.emailSupport")}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Send detailed inquiries and receive comprehensive responses with reference tracking.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowEmailForm(true)}
                  >
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100/50 hover:from-purple-100 hover:to-violet-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{t("help.phoneSupport")}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Speak directly with our experts for complex issues and personalized guidance.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = 'tel:+1-555-BLOCMARK'}
                  >
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
      
      <SupportEmailForm 
        isOpen={showEmailForm} 
        onClose={() => setShowEmailForm(false)} 
      />
    </AppLayout>
  );
}
