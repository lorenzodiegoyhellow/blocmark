import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/hooks/use-translation";

export default function FAQPage() {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("faq.howBooking"),
      answer: t("faq.howBookingAnswer")
    },
    {
      question: t("faq.cancellationPolicy"),
      answer: t("faq.cancellationAnswer")
    },
    {
      question: t("faq.contactHost"),
      answer: t("faq.contactHostAnswer")
    },
    {
      question: t("faq.paymentsWork"),
      answer: t("faq.paymentsAnswer")
    },
    {
      question: t("faq.issuesDuringStay"),
      answer: t("faq.issuesAnswer")
    },
    {
      question: t("faq.listSpace"),
      answer: t("faq.listSpaceAnswer")
    },
    {
      question: t("faq.typesOfSpaces"),
      answer: t("faq.typesAnswer")
    },
    {
      question: t("faq.howMuchEarn"),
      answer: t("faq.earnAnswer")
    },
    {
      question: t("faq.protection"),
      answer: t("faq.protectionAnswer")
    },
    {
      question: t("faq.feesCharged"),
      answer: t("faq.feesAnswer")
    }
  ];

  const categories = [
    {
      title: t("faq.bookingPayments"),
      faqs: faqs.slice(0, 5)
    },
    {
      title: t("faq.hostingListing"),
      faqs: faqs.slice(5, 10)
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("faq.title")}</h1>
          <p className="text-lg text-muted-foreground mb-10">
            {t("faq.subtitle")}
          </p>

          {categories.map((category, i) => (
            <Card key={i} className="mb-8">
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem value={`item-${i}-${index}`} key={index}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}

          <div className="mt-12 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t("help.stillQuestions")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("help.supportIntro")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">{t("help.emailSupport")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("help.responseTime")}
                  </p>
                  <a href="mailto:support@blocmark.com" className="text-primary hover:underline">
                    support@blocmark.com
                  </a>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">{t("help.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("help.browseKnowledge")}
                  </p>
                  <a href="/help-support" className="text-primary hover:underline">
                    {t("help.visitHelpCenter")}
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}