# QREats.

**The Modern Operating System for Restaurants.**

QREats is a comprehensive SaaS platform designed to streamline restaurant operations, reduce waste, and enhance the customer dining experience through digital innovation.

![QREats Dashboard](/docs/dashboard-preview.png)

## 🚀 Key Features

### For Customers
- **Contactless Ordering**: Scan QR code to access a rich, digital menu.
- **Advanced Menu**: Real-time search, category filtering (Veg/GF), and visual item displays.
- **Cart & Checkout**: Seamless ordering flow with modifier support (e.g., "Extra Cheese").
- **Payment Integration**: Secure payment processing (Stripe/M-Pesa ready).

### For Restaurants
- **Staff Dashboard**: Real-time overview of active tables and orders.
- **Kitchen Display System (KDS)**: Digital ticket management for chefs to track prep times.
- **Inventory Management**: Auto-deduct ingredients based on recipes as orders are placed.
- **Analytics**: Insightful reporting on sales trends and peak hours.

## 🛡️ Security & Privacy
QREats is built with a security-first architecture:
- **Strict Content Security Policy (CSP)**: Mitigates XSS attacks.
- **Secure Headers**: Implements HSTS, X-Frame-Options, and X-Content-Type-Options.
- **Input Sanitization**: All inputs validated with Zod schemas.
- **Authentication**: Role-based access control (RBAC) via secure session management.
- **Data Protection**: Zero-trust approach to sensitive user data.

## 🛠️ Technology Stack
- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: SQLite (Dev) / PostgreSQL (Prod) with [Prisma ORM](https://prisma.io)
- **Styling**: Tailwind CSS with custom Design System
- **State**: Server-side first + specialized client stores (Zustand)

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Connection (e.g., PostgreSQL or SQLite file)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

## 📂 Project Structure

```bash
├── app/                  # Next.js 16 App Router (Pages, API Routes)
├── components/           # Reusable UI Components
│   ├── ui/               # Basic UI elements (Buttons, Inputs)
│   └── ...               # Feature-specific components
├── lib/                  # Utilities, Hooks, and Stores
├── prisma/               # Database Schema and Seeds
├── public/               # Static Assets
└── types/                # TypeScript Definitions
```

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AmoreGiTs/QREats.git
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Initialize Database**:
   ```bash
   npx prisma migrate dev
   npx prisma seed
   ```

4. **Run Development Server**:
   ```bash
   # Standard start
   npm run dev
   
   # OR with Socket.IO support
   npm run dev:socket
   ```

## 🧰 Developer Scripts

- **`./start-dev.sh`**: Starts the dev server with a clean auth state and debug logging enabled. Recommended if you encounter login issues.
- **`./fix-auth.sh`**: Troubleshooting utility that backs up `.env`, clears Next.js/NextAuth caches, and regenerates the startup script.
- **`npm run dev:socket`**: Runs the custom server with Socket.IO support for real-time features.

## 📄 License
Generic SaaS License. Built for portfolio demonstration.

---
*Built with ❤️ by the QREats Engineering Team.*
