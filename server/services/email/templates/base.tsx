import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Img,
  Hr,
  Preview,
} from '@react-email/components';

interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://blocmark.com/logo.png"
              width="150"
              height="50"
              alt="Blocmark"
              style={logo}
            />
          </Section>
          
          {children}
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              Blocmark - AI-Powered Location Booking Platform
            </Text>
            <Text style={footerLinks}>
              <Link href="https://blocmark.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
              {' | '}
              <Link href="https://blocmark.com/terms" style={footerLink}>
                Terms of Service
              </Link>
              {' | '}
              <Link href="https://blocmark.com/contact" style={footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={footerAddress}>
              © 2025 Blocmark. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '40px 0',
};

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '24px',
  margin: '16px 0',
};

const footerLink = {
  color: '#0066ff',
  textDecoration: 'none',
};

const footerAddress = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
};

export const emailStyles = {
  section: {
    padding: '0 48px',
  },
  heading: {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    margin: '30px 0',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#484848',
    margin: '16px 0',
  },
  button: {
    backgroundColor: '#0066ff',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    margin: '24px 0',
  },
  link: {
    color: '#0066ff',
    textDecoration: 'underline',
  },
  code: {
    display: 'inline-block',
    padding: '16px 32px',
    width: '100%',
    backgroundColor: '#f4f4f4',
    borderRadius: '6px',
    border: '1px solid #eee',
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    color: '#484848',
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  box: {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    margin: '24px 0',
  },
};