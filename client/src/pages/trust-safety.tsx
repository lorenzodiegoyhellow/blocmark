import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, 
  CheckCircle, 
  Eye, 
  LockKeyhole,
  CreditCard, 
  FileCheck, 
  HeartHandshake, 
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function TrustSafetyPage() {
  const { t } = useTranslation();
  
  const safetyFeatures = [
    {
      icon: <UserCheck className="h-10 w-10 text-primary" />,
      title: t("trustSafety.verifiedUsers"),
      description: t("trustSafety.verifiedUsersDesc")
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: t("trustSafety.securePayments"),
      description: t("trustSafety.securePaymentsDesc")
    },
    {
      icon: <FileCheck className="h-10 w-10 text-primary" />,
      title: t("trustSafety.insurance"),
      description: t("trustSafety.insuranceDesc")
    },
    {
      icon: <LockKeyhole className="h-10 w-10 text-primary" />,
      title: t("trustSafety.dataProtection"),
      description: t("trustSafety.dataProtectionDesc")
    }
  ];

  const beforeBookingTips = [
    t("trustSafety.beforeBookingTip1"),
    t("trustSafety.beforeBookingTip2"),
    t("trustSafety.beforeBookingTip3"),
    t("trustSafety.beforeBookingTip4"),
    t("trustSafety.beforeBookingTip5")
  ];

  const beforeHostingTips = [
    t("trustSafety.beforeHostingTip1"),
    t("trustSafety.beforeHostingTip2"),
    t("trustSafety.beforeHostingTip3"),
    t("trustSafety.beforeHostingTip4"),
    t("trustSafety.beforeHostingTip5")
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("trustSafety.title")}</h1>
              <p className="text-lg text-muted-foreground">
                {t("trustSafety.subtitle")}
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <Shield className="h-24 w-24 text-primary" />
            </div>
          </div>

          {/* Safety Features */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("trustSafety.ourFeatures")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyFeatures.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator className="my-10" />

          {/* Safety Tips */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("trustSafety.safetyTips")}</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <Eye className="mr-2 h-5 w-5 text-primary" />
                {t("trustSafety.beforeBooking")}
              </h3>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {beforeBookingTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <Eye className="mr-2 h-5 w-5 text-primary" />
                {t("trustSafety.beforeHosting")}
              </h3>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {beforeHostingTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-10" />

          {/* Dispute Resolution */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("trustSafety.disputeResolution")}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-start">
                  <HeartHandshake className="h-10 w-10 text-primary mb-4" />
                  <div>
                    <p className="text-muted-foreground mb-4">
                      {t("trustSafety.disputeDescription")}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {t("trustSafety.disputeRecommendation")}
                    </p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground">
                      <li>{t("trustSafety.disputeStep1")}</li>
                      <li>{t("trustSafety.disputeStep2")}</li>
                      <li>{t("trustSafety.disputeStep3")}</li>
                      <li>{t("trustSafety.disputeStep4")}</li>
                    </ol>
                    <p className="text-muted-foreground">
                      {t("trustSafety.disputeConclusion")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Emergency Support */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("trustSafety.emergencySupport")}</h2>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-10 w-10 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-medium mb-2">{t("trustSafety.emergencyTitle")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("trustSafety.emergencyDescription")}
                    </p>
                    <div className="bg-muted p-4 rounded-md mb-4">
                      <p className="font-medium">{t("trustSafety.emergencyContact")} <span className="text-primary">+1-888-BLOCMARK</span></p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>{t("trustSafety.emergencyNote")}</strong> {t("trustSafety.emergencyNoteText")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">{t("trustSafety.ctaTitle")}</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {t("trustSafety.ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/help-support">{t("trustSafety.contactSupport")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guidelines">{t("trustSafety.viewGuidelines")}</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}