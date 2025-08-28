# Travel Platform App

An advanced AI-powered travel and booking platform that creates immersive, personalized experiences through intelligent communication technologies.

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database server
- API keys for external services (Google Maps, OpenAI, Stripe)

### Environment Setup

1. Clone the repository to your local machine
2. Copy the `.env.example` file to a new file named `.env`:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file and fill in your actual values:
   - Database connection details
   - API keys for Google Maps, OpenAI, and Stripe
   - Port configuration (optional, defaults to 5000)

### Database Setup

1. Create a PostgreSQL database for the application
2. Update the `DATABASE_URL` in your `.env` file to point to your database
3. Run database migrations to set up the schema:
   ```
   npm run db:push
   ```

### Installation

1. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. The application will be available at http://localhost:5000

## Features

- Comprehensive administrative tools with advanced messaging and booking management
- User authentication and authorization
- Location browsing and booking
- Secret Corners feature for exclusive locations
- Google Maps integration
- Stripe payment processing
- OpenAI-powered location analysis

## Notes

- The project uses TypeScript for both frontend and backend
- Frontend: React with Shadcn UI components
- Backend: Express.js with Drizzle ORM
- Database: PostgreSQL