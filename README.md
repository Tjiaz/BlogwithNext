# BlogwithNext

A Next.js blog and content platform built with the App Router. The project includes blog pages, article detail views, admin content workflows, user authentication, RSS/article ingestion, and MongoDB-backed data models.

## Overview

This repository is a full-stack blog application focused on publishing articles, managing categories/topics, collecting subscribers, and supporting content-driven features. It uses:

- Next.js 13
- React
- Prisma ORM
- MongoDB
- NextAuth
- Custom styling and reusable components

## Features

- Blog home and article listing pages
- Individual article detail pages
- Topic and category-based browsing
- Admin dashboard and content management routes
- Authentication and account/session handling
- Subscriber tracking and newsletter-related functionality
- RSS feed and article import utilities
- Social/content integrations for publishing and sharing

## Tech Stack

- JavaScript / JSX
- CSS Modules and global styles
- Prisma with MongoDB
- Next.js server-side rendering and App Router
- NextAuth for authentication

## Project Structure

```text
.
├── prisma/
│   └── schema.prisma
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── lib/
│   ├── providers/
│   ├── utils/
│   ├── Data.js
│   ├── Data2.js
│   └── ...
├── .eslintrc.json
├── .gitignore
├── .gitpod.yml
├── jsconfig.json
├── next.config.js
├── package.json
├── README.md
├── vercel.json
├── yarn.lock
└── package-lock.json
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ installed
- npm or yarn installed
- A MongoDB database available
- Optional: environment variables for auth and third-party integrations

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Tjiaz/BlogwithNext.git
cd BlogwithNext
```

2. Install dependencies:

```bash
npm install
```

or:

```bash
yarn install
```

3. Create a local environment file:

```bash
cp .env.example .env.local
```

If there is no `.env.example` in the repo, create a `.env.local` file manually with the variables your app expects, including at least:

```env
DATABASE_URL="mongodb://localhost:27017/your-database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Available Scripts

This project includes the following scripts from `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run update-rss
```

### Script explanations

- `dev` — starts the Next.js development server
- `build` — creates a production build
- `start` — runs the production server
- `lint` — checks the project for linting issues
- `update-rss` — updates RSS feed data used by the app

## Database

The project uses Prisma with MongoDB. The schema is defined in:

- `prisma/schema.prisma`

The schema includes models for:

- `User`
- `Post`
- `Category`
- `Article`
- `Topic`
- `Subscriber`
- `LinkedinAuth`

## Notes

This repository appears to be configured for a content-heavy blog with personal publishing features and integrations. Depending on your deployment and environment, additional variables or credentials may be required for authentication, email delivery, and external social publishing features.

## License

This project does not currently declare a license in the repository metadata. If you plan to publish or share it publicly, consider adding an appropriate open-source license.

## Contributing

Contributions are welcome. If you want to improve the app, feel free to fork the project, make changes, and open a pull request.

## Deployment

This app is compatible with Vercel-based deployments for Next.js projects. For production deployment, ensure your environment variables and database connection are configured correctly.
