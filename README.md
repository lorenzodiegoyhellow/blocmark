# 🏠 Blocmark

A full-stack location sharing platform with AI-powered features, built with React, Node.js, and PostgreSQL.

## ✨ Features

- **Location Discovery**: Find and share amazing locations
- **AI-Powered Analysis**: Get intelligent insights about locations
- **Booking System**: Reserve spaces for events and activities
- **Payment Integration**: Secure Stripe payment processing
- **User Reviews**: Community-driven ratings and feedback
- **Secret Corners**: Premium location access for subscribers

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI integration for location analysis
- **Payments**: Stripe for secure transactions
- **Maps**: Google Maps integration
- **Email**: Postmark for transactional emails

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for OpenAI, Stripe, Google Maps, and Postmark

## 🔧 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lorenzodiegoyhellow/blocmark.git
   cd blocmark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.production.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

This project is configured for deployment to AWS App Runner using GitHub Actions.

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
