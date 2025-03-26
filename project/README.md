# NewsHub - Personalized News Platform

NewsHub is a modern web application that provides personalized news delivery based on user interests. It features a powerful search engine, automated summarization, and premium newsletter creation capabilities.

## Features

### Core Features
- **Personalized Dashboard**: Users can specify their news interests and preferences
- **News Search Engine**: Search through news articles from the past 24 hours
- **Automated Summarization**: Get concise summaries of news articles
- **Email Delivery**: Receive personalized news summaries via email

### Premium Features
- **Newsletter Creation**: Create and customize newsletters
- **Newsletter Distribution**: Schedule and send newsletters to subscribers
- **Analytics Dashboard**: Track newsletter performance and engagement

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Email Service**: SendGrid
- **News API**: NewsAPI.org

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- SendGrid account
- NewsAPI.org API key

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NEWS_API_KEY=your_newsapi_key
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/newshub.git
cd newshub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── lib/               # Utility functions and services
├── store/             # State management
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Email Delivery System

The application includes a robust email delivery system powered by SendGrid. Here's how it works:

### Email Settings

Users can configure their email preferences in their profile:
- Email frequency (daily, weekly, monthly, or never)
- Categories of interest
- Keywords to track
- Enable/disable email notifications

### Email Types

1. **Newsletter Digests**
   - Personalized news articles based on user preferences
   - Frequency based on user settings
   - Beautiful HTML templates with responsive design

2. **Welcome Emails**
   - Sent to new users after registration
   - Introduces key features and getting started guide

3. **Subscription Confirmation**
   - Sent when users upgrade to premium
   - Details premium features and benefits

### Email Job

The email delivery system runs as a background job that:
- Processes all active email settings
- Determines which users should receive emails based on their frequency settings
- Fetches relevant articles for each user
- Sends personalized email digests
- Logs delivery status and any errors

### Running the Email Job

To run the email job manually:

```bash
npm run email-job
```

For production, you should set up a cron job or scheduler to run this at appropriate intervals:

```bash
# Run daily at 8 AM
0 8 * * * cd /path/to/project && npm run email-job

# Run weekly on Monday at 9 AM
0 9 * * 1 cd /path/to/project && npm run email-job

# Run monthly on the 1st at 10 AM
0 10 1 * * cd /path/to/project && npm run email-job
```

## Environment Variables

Required environment variables for email functionality:

```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
VITE_SENDGRID_FROM_EMAIL=your_verified_sender_email
VITE_APP_URL=your_app_url
```

## Database Tables

### email_settings
- Stores user email preferences
- Tracks last sent timestamp
- Manages active/inactive status

### email_logs
- Records all email deliveries
- Tracks success/failure status
- Stores error messages for failed deliveries

## Security

- All email operations are logged for audit purposes
- Email preferences can only be modified by the user
- Rate limiting is implemented to prevent abuse
- Unsubscribe links are included in all emails

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Run the email job:
   ```bash
   npm run email-job
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 