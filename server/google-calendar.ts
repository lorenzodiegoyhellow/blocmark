import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://workspace.lorenzo105.repl.co/api/auth/google-calendar/callback'
  : 'http://localhost:5000/api/auth/google-calendar/callback';

// Scopes needed for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

// Create OAuth2 client
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// Generate auth URL for user consent
export function generateAuthUrl(locationId: number): string {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: JSON.stringify({ locationId }), // Pass location ID in state
    prompt: 'consent' // Force consent to get refresh token
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
  const oauth2Client = createOAuth2Client();
  
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to get tokens from Google');
  }
  
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

// Get calendar client with refresh token
export async function getCalendarClient(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Get events from Google Calendar
export async function getCalendarEvents(refreshToken: string, timeMin?: Date, timeMax?: Date) {
  const calendar = await getCalendarClient(refreshToken);
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin?.toISOString() || new Date().toISOString(),
    timeMax: timeMax?.toISOString() || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ahead
    singleEvents: true,
    orderBy: 'startTime'
  });
  
  return response.data.items || [];
}

// Extract blocked dates from calendar events
export function extractBlockedDatesFromEvents(events: any[]): Date[] {
  const blockedDates: Date[] = [];
  
  events.forEach(event => {
    if (event.start && (event.start.date || event.start.dateTime)) {
      const startDate = new Date(event.start.date || event.start.dateTime);
      
      // For all-day events or multi-day events, block each day
      if (event.start.date) {
        const endDate = event.end ? new Date(event.end.date) : startDate;
        const currentDate = new Date(startDate);
        
        while (currentDate < endDate) {
          blockedDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // For timed events, just block the day
        blockedDates.push(startDate);
      }
    }
  });
  
  return blockedDates;
}

// Sync calendar events to location availability
export async function syncCalendarToLocation(refreshToken: string): Promise<Date[]> {
  try {
    const events = await getCalendarEvents(refreshToken);
    return extractBlockedDatesFromEvents(events);
  } catch (error) {
    console.error('Failed to sync calendar:', error);
    throw error;
  }
}