# Kalab Barista Academy - Extended System

A comprehensive Telegram Mini App and admin dashboard for barista training registration and management.

## Features

### ✅ Completed Extensions

1. **UI/UX Upgrades**
   - Premium coffee-inspired design with gradients and glassmorphism
   - Coffee bean decorative elements
   - Smooth animations and hover effects
   - Enhanced typography and spacing

2. **Home Page**
   - Hero section with logo and branding
   - Features grid showcasing academy offerings
   - Call-to-action button leading to registration

3. **Admin Dashboard**
   - View all applicants with search and filtering
   - Detailed applicant management
   - Price setting and payment status management
   - Payment request and approval workflow

4. **Telegram Bot Integration**
   - Automated registration confirmations
   - Payment request notifications
   - Payment confirmation messages
   - Class schedule notifications
   - Payment screenshot handling

5. **Automated Reminder System**
   - 7-day, 3-day, and 1-day pre-class reminders
   - Conditional reminders (only for unpaid applicants)
   - Toggleable reminder system per applicant

6. **Database Schema Updates**
   - Added price, payment_status, payment_screenshot_url
   - Added class_schedule and reminder_enabled fields

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB database
- Telegram Bot Token (from @BotFather)

### 1. Environment Setup

#### Server (.env)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

#### Client (src/utils/api.js or environment)

Make sure the API base URL is configured correctly.

### 2. Installation

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd client
npm install
```

### 3. Telegram Bot Setup

1. Create a bot with @BotFather on Telegram
2. Get the bot token
3. Add the token to your server `.env` file
4. The bot will automatically start polling when the server runs

### 4. Running the Application

#### Development Mode

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

#### Production Build

```bash
# Build the client
cd client
npm run build

# Start the server (serves both API and built client)
cd server
npm start
```

## System Architecture

### Bot Connection to Backend

The Telegram bot connects to the backend through the `telegramService.js`:

1. **Initialization**: Bot starts with polling enabled using the token from environment variables
2. **Message Handling**: Listens for user messages and photos (payment screenshots)
3. **User Mapping**: Stores chat IDs for sending targeted messages
4. **Integration**: Called by controllers for sending notifications and confirmations

### Reminder System

The reminder system uses `node-cron` to run daily at 9 AM:

1. **Scheduling**: Cron job checks all applicants daily
2. **Conditions**: Only sends reminders to applicants who:
   - Have payment status "pending"
   - Have reminder_enabled set to true
   - Have a class_schedule set
3. **Timing**: Sends reminders at 7 days, 3 days, and 1 day before class
4. **Parsing**: Simple date parsing from class schedule text (can be enhanced with chrono-node)

### Admin Dashboard Access

The admin dashboard is accessible at `/admin` in the client application. It provides:

- Full CRUD operations on applicants
- Payment workflow management
- Telegram bot integration for notifications
- Reminder system controls

## API Endpoints

### Registration

- `POST /api/register` - Submit new registration

### Admin

- `GET /api/admin/applicants` - Get all applicants
- `GET /api/admin/applicants/:id` - Get specific applicant
- `PATCH /api/admin/applicants/:id` - Update applicant
- `POST /api/admin/applicants/:id/send-payment-request` - Send payment request
- `POST /api/admin/applicants/:id/send-class-details` - Send class details

## File Structure

```
kalab-barista-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # HomePage, AdminDashboardPage, etc.
│   │   ├── components/    # Reusable UI components
│   │   └── assets/        # Logo and static assets
└── server/                 # Node.js backend
    ├── controllers/       # Business logic
    ├── models/           # Database schemas
    ├── routes/           # API routes
    ├── services/         # Telegram bot & reminders
    └── utils/            # Helper functions
```

## Production Deployment

1. Set up MongoDB database
2. Configure environment variables
3. Build the client: `npm run build` in client directory
4. Start the server: `npm start` in server directory
5. Set up the Telegram bot webhook (optional, polling works for development)

## Security Notes

- Store Telegram bot token securely in environment variables
- Validate all API inputs
- Use HTTPS in production
- Consider rate limiting for API endpoints
- Implement proper authentication for admin routes (currently open for demo)

## Future Enhancements

- Add user authentication for admin dashboard
- Implement payment gateway integration
- Add email notifications
- Enhance date parsing with dedicated libraries
- Add analytics and reporting
- Implement file upload for payment screenshots
- Add push notifications via Telegram
  │ ├── models/
  │ │ └── Registration.js
  │ ├── routes/
  │ │ └── registrationRoutes.js
  │ ├── utils/
  │ │ └── validation.js
  │ ├── package.json
  │ └── server.js
  ├── .env.example
  └── README.md

````

## Environment Setup

1. Copy `.env.example` to `server/.env`.
2. In development, the client uses the Vite proxy, so `VITE_API_BASE_URL=/api` is enough.
3. Update `MONGODB_URI` to match your MongoDB deployment.

Example `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kalab_barista_app
CLIENT_URL=http://localhost:5173
````

Optional `client/.env` for custom API host:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install

```bash
cd client
npm install

cd ../server
npm install
```

## Run Locally

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## Telegram Mini App Setup

1. Create a Telegram bot with `@BotFather`.
2. Use `/newapp` or `/mybots` in BotFather to configure the Mini App.
3. Set the Mini App URL to your deployed frontend URL, for example `https://your-domain.com`.
4. Make sure the backend is deployed and reachable from the frontend URL.
5. Open the Mini App from Telegram so `WebApp.initDataUnsafe.user` is available.

## Production Notes

- Build the client with `npm run build` in `client/`.
- Start the server with `npm start` in `server/`.
- Set `CLIENT_URL` to your production frontend domain.
- Point `VITE_API_BASE_URL` to your production API URL if frontend and backend are on different origins.
