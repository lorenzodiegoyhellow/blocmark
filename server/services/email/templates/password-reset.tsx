import React from 'react';
import { render } from '@react-email/render';
import { Section, Text, Button, Link } from '@react-email/components';
import { BaseEmail, emailStyles } from './base';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiryTime: string;
}

const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ name, resetUrl, expiryTime }) => {
  return (
    <BaseEmail preview="Reset your Blocmark password">
      <Section style={emailStyles.section}>
        <Text style={emailStyles.heading}>
          Password Reset Request
        </Text>
        
        <Text style={emailStyles.paragraph}>
          Hi {name},
        </Text>
        
        <Text style={emailStyles.paragraph}>
          We received a request to reset your password for your Blocmark account. If you didn't make this request, you can safely ignore this email.
        </Text>
        
        <Text style={emailStyles.paragraph}>
          To reset your password, click the button below:
        </Text>
        
        <Button href={resetUrl} style={emailStyles.button}>
          Reset Password
        </Button>
        
        <Text style={{ ...emailStyles.paragraph, fontSize: '13px', color: '#8898aa' }}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={{ ...emailStyles.paragraph, fontSize: '12px', wordBreak: 'break-all' }}>
          {resetUrl}
        </Text>
        
        <Section style={emailStyles.box}>
          <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: 'bold' }}>
            ⚠️ Important Security Information
          </Text>
          <Text style={{ ...emailStyles.paragraph, margin: '8px 0 0' }}>
            • This link will expire in {expiryTime}
          </Text>
          <Text style={{ ...emailStyles.paragraph, margin: '4px 0 0' }}>
            • For security reasons, this link can only be used once
          </Text>
          <Text style={{ ...emailStyles.paragraph, margin: '4px 0 0' }}>
            • If you didn't request this reset, please contact our support team
          </Text>
        </Section>
        
        <Text style={emailStyles.paragraph}>
          If you're having trouble with the button above, you can also{' '}
          <Link href={resetUrl} style={emailStyles.link}>
            click here
          </Link>{' '}
          to reset your password.
        </Text>
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '32px' }}>
          Best regards,<br />
          The Blocmark Security Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export async function renderPasswordResetEmail(props: PasswordResetEmailProps) {
  const html = render(<PasswordResetEmail {...props} />);
  const subject = 'Reset your Blocmark password';
  
  return { html, subject };
}