import { AppLayout } from "@/components/layout/app-layout";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: February 27, 2025
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            This Privacy Policy describes how Blocmark ("we", "us", or "our") collects, uses, and discloses your 
            personal information when you visit, use our services, or otherwise communicate with us (collectively, 
            the "Services"). This Policy is designed to help you understand how we collect, use, and safeguard the 
            information you provide to us and to assist you in making informed decisions when using our Services.
          </p>

          <h2>1. INFORMATION WE COLLECT</h2>
          <p>
            We collect several types of information from and about users of our Services:
          </p>
          <h3>1.1 Personal Information You Provide to Us</h3>
          <p>
            This is information that identifies you personally, such as:
          </p>
          <ul>
            <li>Contact information (name, email address, phone number)</li>
            <li>Account information (username, password)</li>
            <li>Profile information (profile picture, biography)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Location listing information (address, photos, description, pricing)</li>
            <li>Booking information (dates, times, purpose, number of guests)</li>
            <li>Communications (messages sent through our platform, customer support inquiries)</li>
            <li>Survey responses and feedback</li>
          </ul>

          <h3>1.2 Information We Collect Automatically</h3>
          <p>
            When you use our Services, we may automatically collect certain information about your device and usage, including:
          </p>
          <ul>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent on pages, links clicked)</li>
            <li>Location data (general location based on IP address, precise location if permitted)</li>
            <li>Cookies and similar technologies (see our Cookie Policy for more details)</li>
          </ul>

          <h2>2. HOW WE USE YOUR INFORMATION</h2>
          <p>
            We use the information we collect for various purposes, including to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our Services</li>
            <li>Process transactions and manage your account</li>
            <li>Facilitate bookings between users</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about our Services</li>
            <li>Send promotional emails and updates (if you've opted in)</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Protect the security and integrity of our platform</li>
            <li>Enforce our Terms and Conditions</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. HOW WE SHARE YOUR INFORMATION</h2>
          <p>
            We may share your personal information in the following situations:
          </p>
          <ul>
            <li><strong>Between Users:</strong> We share information between hosts and renters to facilitate bookings and communications.</li>
            <li><strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf.</li>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights, privacy, safety, or property.</li>
            <li><strong>With Your Consent:</strong> We may share information with third parties when you have given us your consent to do so.</li>
          </ul>

          <h2>4. YOUR PRIVACY RIGHTS</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul>
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate or incomplete information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the details provided in the "Contact Us" section.
          </p>

          <h2>5. DATA SECURITY</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
            over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>6. DATA RETENTION</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
            Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>

          <h2>7. INTERNATIONAL DATA TRANSFERS</h2>
          <p>
            Your information may be transferred to, and processed in, countries other than the country in which you 
            reside. These countries may have different data protection laws than your country. By using our Services, 
            you consent to the transfer of your information to countries outside your country of residence, including 
            the United States.
          </p>

          <h2>8. CHILDREN'S PRIVACY</h2>
          <p>
            Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal 
            information from children. If we learn that we have collected personal information from a child, we will 
            take steps to delete that information as quickly as possible.
          </p>

          <h2>9. THIRD-PARTY LINKS</h2>
          <p>
            Our Services may contain links to third-party websites, services, or applications that are not operated 
            by us. We have no control over and assume no responsibility for the content, privacy policies, or 
            practices of any third-party sites or services.
          </p>

          <h2>10. CHANGES TO THIS PRIVACY POLICY</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
            new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
            Privacy Policy periodically for any changes.
          </p>

          <h2>11. CONTACT US</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            Blocmark<br />
            Los Angeles, CA<br />
            Email: privacy@blocmark.com
          </p>
        </div>
      </div>
    </AppLayout>
  );
}