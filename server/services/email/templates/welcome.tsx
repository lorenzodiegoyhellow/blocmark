import React from 'react';
import { render } from '@react-email/render';
import { Section, Text, Button, Link } from '@react-email/components';
import { BaseEmail, emailStyles } from './base';

interface WelcomeEmailProps {
  name: string;
  verificationUrl?: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name, verificationUrl }) => {
  return (
    <BaseEmail preview={`Welcome to Blocmark, ${name}!`}>
      <Section style={emailStyles.section}>
        <Text style={emailStyles.heading}>
          Welcome to Blocmark, {name}!
        </Text>
        
        <Text style={emailStyles.paragraph}>
          We're thrilled to have you join our community of creators, photographers, and event planners who are discovering amazing locations for their projects.
        </Text>
        
        {verificationUrl && (
          <>
            <Text style={emailStyles.paragraph}>
              To get started, please verify your email address by clicking the button below:
            </Text>
            
            <Button href={verificationUrl} style={emailStyles.button}>
              Verify Email Address
            </Button>
            
            <Text style={{ ...emailStyles.paragraph, fontSize: '13px', color: '#8898aa' }}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={{ ...emailStyles.paragraph, fontSize: '12px', wordBreak: 'break-all' }}>
              {verificationUrl}
            </Text>
          </>
        )}
        
        <Text style={emailStyles.paragraph}>
          With Blocmark, you can:
        </Text>
        
        <ul style={{ paddingLeft: '20px', color: '#484848' }}>
          <li>Browse thousands of unique locations perfect for any project</li>
          <li>Use AI-powered search to find exactly what you need</li>
          <li>Book instantly or send custom requests to hosts</li>
          <li>Manage all your bookings in one place</li>
        </ul>
        
        <Text style={emailStyles.paragraph}>
          If you have any questions or need assistance, our support team is always here to help at{' '}
          <Link href="mailto:support@blocmark.com" style={emailStyles.link}>
            support@blocmark.com
          </Link>
        </Text>
        
        <Text style={emailStyles.paragraph}>
          Happy exploring!
        </Text>
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '32px' }}>
          Best regards,<br />
          The Blocmark Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export async function renderWelcomeEmail(props: WelcomeEmailProps) {
  const html = render(<WelcomeEmail {...props} />);
  const subject = `Welcome to Blocmark, ${props.name}!`;
  
  return { html, subject };
}