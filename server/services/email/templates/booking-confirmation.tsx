import React from 'react';
import { render } from '@react-email/render';
import { Section, Text, Button, Row, Column } from '@react-email/components';
import { BaseEmail, emailStyles } from './base';

interface BookingConfirmationEmailProps {
  recipientType: 'guest' | 'host';
  guestName: string;
  hostName: string;
  locationName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingUrl: string;
  status: string;
}

const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  recipientType,
  guestName,
  hostName,
  locationName,
  startDate,
  endDate,
  totalPrice,
  bookingUrl,
  status,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isGuest = recipientType === 'guest';
  const needsApproval = status === 'pending';

  return (
    <BaseEmail preview={isGuest ? 'Your booking confirmation' : 'New booking request'}>
      <Section style={emailStyles.section}>
        <Text style={emailStyles.heading}>
          {isGuest 
            ? (needsApproval ? 'Booking Request Submitted' : 'Booking Confirmed!')
            : 'New Booking Request'}
        </Text>
        
        <Text style={emailStyles.paragraph}>
          Hi {isGuest ? guestName : hostName},
        </Text>
        
        <Text style={emailStyles.paragraph}>
          {isGuest 
            ? (needsApproval 
                ? `Your booking request for "${locationName}" has been submitted and is waiting for host approval.`
                : `Great news! Your booking for "${locationName}" has been confirmed.`)
            : `You have received a new booking request for "${locationName}" from ${guestName}.`}
        </Text>
        
        <Section style={emailStyles.box}>
          <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
            Booking Details
          </Text>
          
          <Row style={{ marginTop: '16px' }}>
            <Column>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', color: '#8898aa', fontSize: '13px' }}>
                Location
              </Text>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', fontWeight: '500' }}>
                {locationName}
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginTop: '12px' }}>
            <Column>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', color: '#8898aa', fontSize: '13px' }}>
                Check-in
              </Text>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0' }}>
                {formatDate(startDate)}
              </Text>
            </Column>
            <Column>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', color: '#8898aa', fontSize: '13px' }}>
                Check-out
              </Text>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0' }}>
                {formatDate(endDate)}
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginTop: '12px' }}>
            <Column>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', color: '#8898aa', fontSize: '13px' }}>
                {isGuest ? 'Host' : 'Guest'}
              </Text>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0' }}>
                {isGuest ? hostName : guestName}
              </Text>
            </Column>
            <Column>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', color: '#8898aa', fontSize: '13px' }}>
                Total Amount
              </Text>
              <Text style={{ ...emailStyles.paragraph, margin: '4px 0', fontWeight: 'bold' }}>
                ${totalPrice.toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
        
        <Button href={bookingUrl} style={emailStyles.button}>
          {isGuest 
            ? 'View Booking' 
            : (needsApproval ? 'Review & Approve' : 'View Booking')}
        </Button>
        
        {!isGuest && needsApproval && (
          <Text style={emailStyles.paragraph}>
            Please review this booking request and approve or decline it within 24 hours. The guest is eagerly waiting for your response.
          </Text>
        )}
        
        {isGuest && needsApproval && (
          <Text style={emailStyles.paragraph}>
            The host will review your request and respond within 24 hours. You'll receive an email notification once they respond.
          </Text>
        )}
        
        <Text style={emailStyles.paragraph}>
          You can manage all your bookings and messages from your dashboard.
        </Text>
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '32px' }}>
          Best regards,<br />
          The Blocmark Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export async function renderBookingConfirmationEmail(props: BookingConfirmationEmailProps) {
  const html = render(<BookingConfirmationEmail {...props} />);
  const isGuest = props.recipientType === 'guest';
  const needsApproval = props.status === 'pending';
  
  const subject = isGuest 
    ? (needsApproval ? 'Booking Request Submitted' : 'Booking Confirmed!')
    : `New Booking Request for ${props.locationName}`;
  
  return { html, subject };
}