# Starlink Data Bundles Dashboard

A modern React + Flask application for purchasing Starlink data bundles in Kenya using M-Pesa STK Push payment.

## Tech Stack

- **Frontend**: React 19 + Vite (with Poppins font, futuristic design)
- **Backend**: Flask (Python) with Safaricom Daraja M-Pesa integration
- **Payments**: Safaricom M-Pesa STK Push
- **Data**: JSON-based order store (can be upgraded to DB)

## Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Safaricom Daraja sandbox credentials ([get them here](https://developer.safaricom.co.ke))

### Installation

1. **Install dependencies:**
```bash
npm install
pip install -r requirements.txt
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```
   Edit `.env` and fill in your Daraja credentials

3. **Start backend (Terminal 1):**
```bash
python server/app.py
```

4. **Start frontend (Terminal 2):**
```bash
npm run dev
```

5. **Open http://localhost:5173**

## Features

✨ **Futuristic UI** — Starlink-themed with neon colors, glass morphism, Poppins font  
📱 **Responsive** — 2-column mobile grid, adapts to tablet/desktop  
🔐 **M-Pesa STK Push** — Direct payment prompt to user's phone  
🏪 **Order Tracking** — Persisted orders with status polling  
🎯 **Category Filtering** — Daily, Weekly, Monthly, Unlimited bundles  
🌐 **Carrier Support** — Airtel & Safaricom badges  

## Testing with Safaricom Sandbox

1. **Expose backend with ngrok:**
```bash
ngrok http 3001
```

2. **Update `.env`:**
```
CALLBACK_URL=https://your-ngrok-url.ngrok.io/mpesa/callback
```

3. **Register webhook in Daraja dashboard**

4. **Click BUY → enter phone → complete payment**

## Deployment

### Backend (Flask)
```bash
pip install gunicorn
gunicorn -w 4 server.app:app
```

### Frontend (Static)
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

### Going Live
- Swap Daraja sandbox credentials for production ones
- Enable HTTPS everywhere
- Store `.env` secrets securely (not in repo)
- Monitor webhook delivery
