import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ClipboardCheck, 
  Camera, 
  Banknote, 
  Clock, 
  Key,
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  Home, 
  HelpCircle
} from "lucide-react";

export default function GuidelinesPage() {
  const hostGuidelines = [
    {
      icon: <Camera className="h-6 w-6 text-primary" />,
      title: "Accurate Representation",
      description: "Use high-quality photos that accurately represent your space. Be honest about the size, condition, and features of your property. Misrepresentation leads to negative reviews and potential account penalties."
    },
    {
      icon: <Banknote className="h-6 w-6 text-primary" />,
      title: "Transparent Pricing",
      description: "Clearly communicate all fees upfront, including cleaning fees, security deposits, or any additional charges. Hidden fees create a negative experience for guests and may violate our terms of service."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Timely Response",
      description: "Respond to booking inquiries and messages promptly, ideally within 24 hours. Maintaining good communication is essential for a positive experience and helps you secure more bookings."
    },
    {
      icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
      title: "Clear Expectations",
      description: "Set clear house rules and communicate any restrictions or special instructions before bookings are confirmed. This prevents misunderstandings and ensures guests know what to expect."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Safety Standards",
      description: "Ensure your space meets all safety standards, including proper exits, functioning smoke detectors, and first aid supplies. The safety of your guests should always be your top priority."
    }
  ];

  const guestGuidelines = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Clear Communication",
      description: "Clearly communicate your project needs, number of attendees, and any special requirements when making booking inquiries. This helps hosts determine if their space is suitable for your needs."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Respect Time Limits",
      description: "Adhere strictly to your booked time frame. Arrive on time and leave promptly at the end of your booking. If you need additional time, arrange this in advance with the host."
    },
    {
      icon: <Home className="h-6 w-6 text-primary" />,
      title: "Respect the Space",
      description: "Treat the space with care and respect. Leave it in the same condition you found it. Any damage beyond normal wear and tear should be reported and may be subject to additional charges."
    },
    {
      icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
      title: "Follow House Rules",
      description: "Carefully read and follow all house rules set by the host. These rules are designed to protect the space and ensure a positive experience for everyone."
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      title: "Report Issues Promptly",
      description: "If you encounter any issues with the space, communicate them to the host immediately. Most problems can be resolved quickly with proper communication."
    }
  ];

  const contentGuidelines = [
    {
      title: "Appropriate Content",
      description: "All content associated with your listing or profile must be appropriate for a diverse audience. This includes photos, descriptions, and messages. We prohibit explicit or offensive content."
    },
    {
      title: "Accurate Information",
      description: "All information provided on the platform must be accurate and truthful. This includes personal information, space details, and booking information."
    },
    {
      title: "Original Content",
      description: "All photos and descriptions should be original or properly licensed. Do not use copyrighted materials without permission."
    },
    {
      title: "Review Integrity",
      description: "Reviews should be honest and based on actual experiences. We prohibit fake reviews, review manipulation, or revenge reviews."
    },
    {
      title: "Respectful Communication",
      description: "All communication on the platform should be respectful and professional. Harassment, discrimination, or threatening language is not tolerated."
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Platform Guidelines</h1>
          <p className="text-lg text-muted-foreground mb-10">
            Our guidelines help ensure a positive experience for all users of Blocmark. Following these guidelines is essential for maintaining your account in good standing.
          </p>

          <Tabs defaultValue="host" className="mb-12">
            <TabsList className="mb-8">
              <TabsTrigger value="host">For Hosts</TabsTrigger>
              <TabsTrigger value="guest">For Guests</TabsTrigger>
              <TabsTrigger value="content">Content Guidelines</TabsTrigger>
            </TabsList>

            <TabsContent value="host">
              <h2 className="text-2xl font-semibold mb-6">Host Guidelines</h2>
              <p className="text-muted-foreground mb-8">
                As a host, you play a crucial role in creating exceptional experiences. Follow these guidelines to maintain a high-quality listing and positive reviews.
              </p>
              <div className="space-y-6">
                {hostGuidelines.map((guideline, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">
                          {guideline.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{guideline.title}</h3>
                          <p className="text-muted-foreground">{guideline.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guest">
              <h2 className="text-2xl font-semibold mb-6">Guest Guidelines</h2>
              <p className="text-muted-foreground mb-8">
                Being a respectful guest ensures you'll have access to amazing spaces now and in the future. Follow these guidelines when booking and using spaces.
              </p>
              <div className="space-y-6">
                {guestGuidelines.map((guideline, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">
                          {guideline.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{guideline.title}</h3>
                          <p className="text-muted-foreground">{guideline.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content">
              <h2 className="text-2xl font-semibold mb-6">Content Guidelines</h2>
              <p className="text-muted-foreground mb-8">
                These guidelines apply to all content posted on Blocmark, including listings, profiles, messages, and reviews.
              </p>
              <div className="space-y-6">
                {contentGuidelines.map((guideline, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">{guideline.title}</h3>
                      <p className="text-muted-foreground">{guideline.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-10" />

          {/* Reporting Violations */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Reporting Violations</h2>
            <p className="text-muted-foreground mb-4">
              If you encounter a user who violates these guidelines, please report them immediately. We take all reports seriously and will investigate promptly.
            </p>
            <p className="text-muted-foreground mb-6">
              You can report violations through the platform by using the "Report" button on listings, profiles, or messages, or by contacting our support team directly.
            </p>
            <Button asChild>
              <Link href="/help-support">Contact Support</Link>
            </Button>
          </section>

          {/* Guideline Enforcement */}
          <section className="bg-muted p-8 rounded-lg">
            <div className="flex items-start gap-4">
              <Key className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Guideline Enforcement</h2>
                <p className="text-muted-foreground mb-4">
                  Violations of these guidelines may result in warnings, temporary suspension, or permanent removal from the platform, depending on the severity and frequency of violations.
                </p>
                <p className="text-muted-foreground">
                  We're committed to maintaining a safe, respectful community. By following these guidelines, you help us create a positive experience for everyone on Blocmark.
                </p>
              </div>
            </div>
          </section>

          {/* Need Help? */}
          <section className="mt-12 text-center">
            <div className="inline-block mb-4">
              <HelpCircle className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Need Help Understanding Our Guidelines?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              If you have questions about our guidelines or need clarification, our support team is here to help.
            </p>
            <Button variant="outline" asChild>
              <Link href="/help-support">Contact Support</Link>
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}