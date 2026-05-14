# Razorpay Integration Setup Guide

To enable the professional payment system on your website, you must configure the following environment variables in your Vercel Dashboard.

## 1. Get Razorpay API Keys
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Go to **Settings** -> **API Keys**.
3. Generate a new Key ID and Key Secret.

## 2. Configure Vercel Environment Variables
Add these keys to your project settings in Vercel:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` | Production, Preview, Development |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Production (Serverless) |
| `RAZORPAY_KEY_SECRET` | `your_secret_key` | Production (Serverless) |

> [!IMPORTANT]
> The `VITE_` prefix is required for the frontend to access the Key ID.
> The `RAZORPAY_KEY_SECRET` should **NEVER** have a `VITE_` prefix as it must remain hidden from the frontend.

## 3. Local Development
Create or update your `.env.local` file:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_test_secret
```

## Features Integrated:
- ✅ **Server-side Order Creation**: Securely initializes payments.
- ✅ **Signature Verification**: Prevents payment tampering via HMAC SHA256.
- ✅ **Atomic Inventory Sync**: Stock is only deducted AFTER successful payment verification.
- ✅ **Payment Dashboard**: Tracking of Razorpay Payment IDs and statuses in the admin panel.
- ✅ **Automated Revenue**: Admin dashboard now reflects real revenue from paid orders.
- ✅ **Premium UI**: Custom Success/Failure pages with animations.
