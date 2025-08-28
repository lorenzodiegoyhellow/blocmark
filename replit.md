# Blocmark Travel Platform

## Overview
Blocmark is an AI-powered travel and booking platform designed for film shoots, photography, and events. Its purpose is to offer immersive, personalized experiences through intelligent communication, featuring an AI-driven search system and automated booking processes. The platform aims to be a curated marketplace for unique locations, enhancing user experience and streamlining booking operations.

## Recent Updates (August 25, 2025)
- Fixed booking dashboard routing issue - reverted to working dashboard.tsx
- Implemented automatic booking completion system (changes past "confirmed" bookings to "completed" status)
- Added proper "completed" status support with uppercase display
- Confirmed tab-based filtering works (All, Upcoming, Pending, Completed, Canceled)
- Note: dashboard-new.tsx exists but has data structure issues (expects array but API returns paginated object)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Routing**: Wouter
- **Styling**: TailwindCSS with Radix UI components
- **Build Tool**: Vite
- **State Management**: TanStack Query (server state), React Context (global state)
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Consistent blue color schemes, clear visual indicators (e.g., green checkmarks, lightning bolt for instant booking), responsive design across all components (e.g., dynamic column hiding, mobile-first layouts), emphasis on clear communication through notifications. Calendar interfaces are designed for modern booking platform aesthetics.
- **Feature Specifications**:
    - **Booking Flow**: Multi-step process with date/time, group size, add-ons, and fees.
    - **Activity-Based Pricing**: Percentage-based pricing based on activity type.
    - **Selectable Group Sizes**: Hosts can choose which group sizes they want to accommodate (1-5 people is mandatory, others are optional).
    - **Custom Offers**: Hosts can send personalized, auto-confirming offers.
    - **Review System**: Bidirectional reviews with pending reminders.
    - **Booking Lifecycle Management**: Automatic completion of past bookings from "confirmed" to "completed" status, runs hourly and on startup.
    - **Messaging**: Three-column interface with integrated booking details and action buttons.
    - **Availability Management**: Calendar integration showing blocked dates and bookings, with Google Calendar sync capability.
    - **Location Editing**: Comprehensive forms mirroring listing creation, including AI enhancement for descriptions and check-in instructions.
    - **Instant Booking**: Locations marked for instant booking bypass host approval after payment.
    - **Property Features System**: Comprehensive system with 18 main categories and 300+ subcategories, integrated into listing creation and search.
    - **House Style Subcategories**: 46 architectural and design styles for residential properties, integrated into listing creation and search.
    - **Content Moderation**: Detects phone numbers and emails, sanitizes messages, and tracks violations.
    - **Concierge Service**: Premium request form and admin management for special venue requests.
    - **Support Email System**: Form for user inquiries, unique reference ID generation, and admin dashboard for management.
    - **Intercom Live Chat**: Integration for real-time customer support.
    - **OAuth Login**: Facebook and Google authentication support with account linking.
    - **Listing Creation Form**: 10-step form flow with modern UI, comprehensive property details, accessibility information (parking, truck/motorhome access), and conditional Property Features for Residential properties only.
    - **Secret Corners**: Modern photography location discovery platform with Google Maps integration, dark theme UI, and community-driven content submission system.
    - **Email System**: Comprehensive email infrastructure with Postmark integration, React Email templates, queue processing (with optional Redis/BullMQ), transactional emails (welcome, password reset, booking confirmations, message notifications), marketing campaigns, subscription management, and webhook processing.
    - **Guides System**: Full documentation platform with rich text editor (TipTap), categorization, featured guides, admin management interface, and dynamic public pages that fetch from database.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (local, Google, Facebook strategies) with session management.
- **Security**: CSRF protection, rate limiting, input sanitization, user status validation.
- **File Storage**: Multer for file uploads (e.g., W9 forms, profile images).
- **Payment Processing**: Stripe integration for checkout, saved methods, and payouts.
- **System Design Choices**:
    - **Modular Design**: Separation of concerns for authentication, location management, AI integration.
    - **Data Consistency**: Strict validation for addresses via Google Places, history tracking for location edits.
    - **Scalability**: Connection pooling, caching considerations, and serverless database architecture.
    - **Internationalization**: Full support for English and Italian translations.
    - **Maintenance Mode**: Admin-controlled feature to block user login/registration while allowing public browsing.
    - **Role-Based Access Control**: Granular permission system for "Editor" role users, controlling access to admin dashboard sections.

## External Dependencies

### Payment Processing
- **Stripe**: Used for payment intents, checkout sessions, saved payment methods, payouts to hosts via Stripe Connect, and subscriptions.

### AI Services
- **OpenAI**: Utilized for GPT-4 for natural language processing and content generation.
- **Anthropic**: Used for Claude for content analysis and recommendations.

### Database Services
- **Neon Database**: PostgreSQL hosting with serverless architecture.

### External APIs
- **Google Maps**: Provides location geocoding, address autocomplete, and mapping services.
- **Google Calendar**: Planned integration for calendar synchronization.
- **Facebook OAuth**: Used for user authentication.
- **Google OAuth**: Used for user authentication.
- **Intercom**: For live chat customer support.