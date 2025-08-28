import React from 'react';
import { render } from '@react-email/render';
import { Section, Text, Button, Link } from '@react-email/components';
import { BaseEmail, emailStyles } from './base';

interface BookingUpdateEmailProps {
  name: string;
  locationName: string;
  updateType: 'approved' | 'rejected' | 'cancelled' | 'modified';
  bookingUrl: string;
  startDate: string;
  endDate: string;
}

const BookingUpdateEmail: React.FC<BookingUpdateEmailProps> = ({
  name,
  locationName,
  updateType,
  bookingUrl,
  startDate,
  endDate,
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

  const getUpdateMessage = () => {
    switch (updateType) {
      case 'approved':
        return {
          title: 'Booking Approved! 🎉',
          message: `Great news! Your booking request for "${locationName}" has been approved by the host.`,
          action: 'View Booking Details',
          color: '#00d084',
        };
      case 'rejected':
        return {
          title: 'Booking Request Declined',
          message: `Unfortunately, your booking request for "${locationName}" has been declined by the host. Don't worry, there are many other amazing locations available on Blocmark.`,
          action: 'Search Similar Locations',
          color: '#ff6b6b',
        };
      case 'cancelled':
        return {
          title: 'Booking Cancelled',
          message: `Your booking for "${locationName}" has been cancelled. If you have any questions about this cancellation, please contact our support team.`,
          action: 'View Details',
          color: '#ff9f43',
        };
      case 'modified':
        return {
          title: 'Booking Modified',
          message: `Your booking for "${locationName}" has been modified. Please review the updated details below.`,
          action: 'Review Changes',
          color: '#0066ff',
        };
      default:
        return {
          title: 'Booking Update',
          message: `There has been an update to your booking for "${locationName}".`,
          action: 'View Details',
          color: '#0066ff',
        };
    }
  };

  const update = getUpdateMessage();

  return (
    <BaseEmail preview={`${update.title} - ${locationName}`}>
      <Section style={emailStyles.section}>
        <Text style={{ ...emailStyles.heading, color: update.color }}>
          {update.title}
        </Text>
        
        <Text style={emailStyles.paragraph}>
          Hi {name},
        </Text>
        
        <Text style={emailStyles.paragraph}>
          {update.message}
        </Text>
        
        {updateType !== 'rejected' && (
          <Section style={emailStyles.box}>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontWeight: 'bold' }}>
              Booking Details
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: '8px 0 0' }}>
              <strong>Location:</strong> {locationName}
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: '4px 0 0' }}>
              <strong>Check-in:</strong> {formatDate(startDate)}
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: '4px 0 0' }}>
              <strong>Check-out:</strong> {formatDate(endDate)}
            </Text>
          </Section>
        )}
        
        <Button href={bookingUrl} style={{ ...emailStyles.button, backgroundColor: update.color }}>
          {update.action}
        </Button>
        
        {updateType === 'approved' && (
          <>
            <Text style={emailStyles.paragraph}>
              <strong>Next Steps:</strong>
            </Text>
            <ul style={{ paddingLeft: '20px', color: '#484848' }}>
              <li>Review the check-in instructions from your host</li>
              <li>Contact the host if you have any questions</li>
              <li>Complete any remaining payment if applicable</li>
            </ul>
          </>
        )}
        
        {updateType === 'rejected' && (
          <Text style={emailStyles.paragraph}>
            We have thousands of other amazing locations that might be perfect for your needs.{' '}
            <Link href={`${bookingUrl.replace(/\/bookings\/\d+/, '/search')}`} style={emailStyles.link}>
              Browse available locations
            </Link>
          </Text>
        )}
        
        {updateType === 'cancelled' && (
          <Text style={emailStyles.paragraph}>
            If this cancellation was unexpected or you need assistance with refunds, please{' '}
            <Link href="mailto:support@blocmark.com" style={emailStyles.link}>
              contact our support team
            </Link>.
          </Text>
        )}
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '32px' }}>
          Best regards,<br />
          The Blocmark Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export async function renderBookingUpdateEmail(props: BookingUpdateEmailProps) {
  const html = render(<BookingUpdateEmail {...props} />);
  
  const subjectMap = {
    approved: `✅ Booking Approved - ${props.locationName}`,
    rejected: `Booking Request Update - ${props.locationName}`,
    cancelled: `Booking Cancelled - ${props.locationName}`,
    modified: `Booking Modified - ${props.locationName}`,
  };
  
  const subject = subjectMap[props.updateType] || `Booking Update - ${props.locationName}`;
  
  return { html, subject };
}