# Elite CLV & BI Enterprise Dashboard

A premium, high-performance analytics platform for Customer Lifetime Value (CLV) prediction and business intelligence. Built with Next.js 14, Tailwind CSS, Framer Motion, and a Python-powered Machine Learning pipeline.

## 🚀 Key Features

- **Advanced BI Dashboard**: Real-time analytics with glassmorphism UI and fluid animations.
- **ML Pipeline**: Predictive modeling for CLV using XGBoost and Scikit-Learn.
- **Data Management**: Robust CSV upload and data processing engine.
- **Enterprise Auth**: Secure user authentication and management.
- **Responsive Design**: State-of-the-art interface optimized for all devices.

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Prisma ORM, SQLite/PostgreSQL.
- **ML Engine**: Python 3, Scikit-Learn, XGBoost, Pandas.
- **State Management**: React Hooks & Context API.

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- pnpm or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd project-2
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Initialize the database:
   ```bash
   sh scripts/setup-db.sh
   ```

5. Setup Machine Learning environment:
   ```bash
   sh setup-ml.sh
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add your environment variables in the Vercel dashboard.
3. Deploy!

---

Built with precision and high-performance design.
