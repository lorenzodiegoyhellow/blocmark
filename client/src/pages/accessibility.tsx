import { AppLayout } from "@/components/layout/app-layout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Eye, 
  Monitor, 
  Keyboard, 
  MousePointer, 
  MessageCircle, 
  Award, 
  BookOpen 
} from "lucide-react";

export default function AccessibilityPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Accessibility Statement</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Blocmark is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user 
          experience for everyone, and applying the relevant accessibility standards.
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Our Commitment</h2>
          <p>
            At Blocmark, we believe that the internet should be available and accessible to anyone and are committed to providing 
            a website that is accessible to the widest possible audience, regardless of circumstance and ability.
          </p>
          <p>
            To fulfill this promise, we aim to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
            These guidelines explain how to make web content more accessible to people with a wide array of disabilities. 
            Complying with those guidelines helps us ensure that the website is accessible to all people: blind people, 
            people with motor impairments, visual impairment, cognitive disabilities, and more.
          </p>

          <h2>Accessibility Features</h2>
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Visual Accessibility</h3>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      <li>High contrast color options</li>
                      <li>Resizable text without loss of functionality</li>
                      <li>Alt text for all images</li>
                      <li>Clear visual focus indicators</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Keyboard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Keyboard Navigation</h3>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      <li>Full keyboard accessibility</li>
                      <li>Logical tab order</li>
                      <li>Skip navigation links</li>
                      <li>Keyboard shortcuts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Screen Readers</h3>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      <li>ARIA landmarks and roles</li>
                      <li>Descriptive link text</li>
                      <li>Form labels and error messages</li>
                      <li>Image descriptions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MousePointer className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Input Methods</h3>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      <li>Touch-friendly targets</li>
                      <li>Easy form completion</li>
                      <li>Alternative input methods support</li>
                      <li>Voice command compatibility</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve 
            accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
          </p>
          <p>
            Blocmark is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the 
            content do not fully conform to the accessibility standard.
          </p>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of Blocmark. Please let us know if you encounter accessibility 
            barriers on our website:
          </p>
          <ul>
            <li>Phone: (555) 123-4567</li>
            <li>E-mail: accessibility@blocmark.com</li>
            <li>Visitor Address: 123 Main Street, Los Angeles, CA 90001</li>
          </ul>
          <p>
            We try to respond to feedback within 3 business days.
          </p>

          <h2>Assessment Methodology</h2>
          <p>
            Blocmark assessed the accessibility of our platform using the following approaches:
          </p>
          <ul>
            <li>Self-evaluation</li>
            <li>External evaluation</li>
            <li>User testing with people with disabilities</li>
            <li>Automated testing using evaluation tools</li>
          </ul>

          <h2>Technical Specifications</h2>
          <p>
            Accessibility of Blocmark relies on the following technologies to work with the particular combination of web 
            browser and any assistive technologies or plugins installed on your computer:
          </p>
          <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
            <li>WAI-ARIA</li>
          </ul>
          <p>
            These technologies are relied upon for conformance with the accessibility standards used.
          </p>

          <h2>Limitations & Alternatives</h2>
          <p>
            Despite our best efforts to ensure accessibility of Blocmark, there may be some limitations. Below is a 
            description of known limitations, and potential solutions. Please contact us if you observe an issue not 
            listed below.
          </p>
          <p>
            Known limitations for Blocmark:
          </p>
          <ol>
            <li>
              <strong>User-generated content:</strong> User-uploaded images may lack alternative text. We encourage 
              all users to provide descriptive text when uploading images.
            </li>
            <li>
              <strong>Third-party content:</strong> Some third-party content, such as maps and payment gateways, may 
              not be fully accessible. We are working with our partners to improve accessibility.
            </li>
            <li>
              <strong>Legacy content:</strong> Some older content may not be fully accessible. We are working to 
              update this content as resources allow.
            </li>
          </ol>

          <h2>Continuous Improvement</h2>
          <p>
            Blocmark is committed to making our website accessible to all users, and we are actively working to increase 
            the accessibility and usability of our website. We are in the process of implementing the relevant portions of 
            the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as our primary web accessibility standard.
          </p>
          <p>
            As part of our ongoing commitment to accessibility, we:
          </p>
          <ul>
            <li>Conduct regular accessibility audits and testing</li>
            <li>Provide accessibility training to our staff</li>
            <li>Include accessibility as a requirement for all new features and content</li>
            <li>Engage with users with disabilities to gather feedback and insights</li>
          </ul>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row md:justify-between gap-8 items-center bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Need Assistance?</h3>
                <p className="text-muted-foreground">Our support team is here to help with any accessibility issues.</p>
              </div>
            </div>
            <Link 
              href="/help-support" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md flex items-center justify-center whitespace-nowrap"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}