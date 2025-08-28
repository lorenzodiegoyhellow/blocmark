import React from 'react';
import { render } from '@react-email/render';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmail, emailStyles } from './base';

interface MessageNotificationEmailProps {
  recipientName: string;
  senderName: string;
  locationName: string;
  messagePreview: string;
  messageUrl: string;
}

const MessageNotificationEmail: React.FC<MessageNotificationEmailProps> = ({
  recipientName,
  senderName,
  locationName,
  messagePreview,
  messageUrl,
}) => {
  return (
    <BaseEmail preview={`New message from ${senderName}`}>
      <Section style={emailStyles.section}>
        <Text style={emailStyles.heading}>
          New Message from {senderName}
        </Text>
        
        <Text style={emailStyles.paragraph}>
          Hi {recipientName},
        </Text>
        
        <Text style={emailStyles.paragraph}>
          You have received a new message about <strong>{locationName}</strong>.
        </Text>
        
        <Section style={{ ...emailStyles.box, borderLeft: '4px solid #0066ff' }}>
          <Text style={{ ...emailStyles.paragraph, margin: 0, color: '#8898aa', fontSize: '13px' }}>
            Message from {senderName}:
          </Text>
          <Text style={{ ...emailStyles.paragraph, margin: '8px 0 0', fontStyle: 'italic' }}>
            "{messagePreview}..."
          </Text>
        </Section>
        
        <Button href={messageUrl} style={emailStyles.button}>
          Reply to Message
        </Button>
        
        <Text style={{ ...emailStyles.paragraph, fontSize: '14px', color: '#8898aa' }}>
          Tip: Quick responses help build trust and increase your chances of successful bookings.
        </Text>
        
        <Section style={{ ...emailStyles.box, backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
          <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
            <strong>📧 Email Notification Settings</strong>
          </Text>
          <Text style={{ ...emailStyles.paragraph, margin: '8px 0 0', fontSize: '12px' }}>
            You're receiving this because you have message notifications enabled. You can manage your email preferences in your{' '}
            <a href={`${messageUrl.split('/dashboard')[0]}/dashboard/settings/notifications`} style={emailStyles.link}>
              account settings
            </a>.
          </Text>
        </Section>
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '32px' }}>
          Happy connecting!<br />
          The Blocmark Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export async function renderMessageNotificationEmail(props: MessageNotificationEmailProps) {
  const html = render(<MessageNotificationEmail {...props} />);
  const subject = `New message from ${props.senderName} about ${props.locationName}`;
  
  return { html, subject };
}