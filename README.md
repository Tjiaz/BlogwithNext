# BlogwithNext

BlogwithNext is a modern blog and content platform built with Next.js, Prisma, and MongoDB. It is designed for publishing articles, organizing content by topics and categories, managing subscribers, and supporting a lightweight admin/content workflow.

## Overview

This project combines a content-driven frontend with a database-backed backend so you can manage blog posts, categories, topics, and user authentication in a single app. The application uses the Next.js App Router and includes integration points for RSS ingestion, email features, social publishing hooks, and user account management.

## Features

- Blog homepage and article listing pages
- Individual article detail pages
- Topic and category-based organization
- Admin/content management routes
- User authentication and session management
- Subscriber tracking and newsletter-related functionality
- RSS feed processing and article import utilities
- Social/content publishing integrations
- Responsive UI built with Next.js and custom CSS

## Tech Stack

- Next.js 13
- React 18
- Prisma ORM
- MongoDB
- NextAuth
- JavaScript / JSX
- CSS Modules and global styles

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
├── package-lock.json
└── MONGODB_OPTIMIZATION.md
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18 or newer
- npm or yarn
- A MongoDB instance available
- A local environment file for configuration variables

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Tjiaz/BlogwithNext.git
cd BlogwithNext
```

### 2. Install dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the required variables.

Example:

```env
DATABASE_URL="mongodb://localhost:27017/blogwithnext"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Depending on your setup, additional variables may be required for email, auth, or publishing integrations.

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

The project includes the following scripts in `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run update-rss
```

### Script descriptions

- `dev` — starts the Next.js development server
- `build` — creates a production build
- `start` — runs the production build locally
- `lint` — checks code quality using ESLint
- `update-rss` — refreshes RSS-related data used by the application

## Database and Prisma

The application uses Prisma with MongoDB. The schema is defined in:

- `prisma/schema.prisma`

The schema includes models for:

- `User`
- `Account`
- `Session`
- `Category`
- `Post`
- `Topic`
- `Article`
- `Content`
- `Subscriber`
- `LinkedinAuth`

## Admin and Content Workflow

The app includes admin and content management routes under the `src/app` directory, which suggests a CMS-like workflow for handling posts, topics, categories, and site content. In many setups, these routes are used for content publishing workflows and administrative oversight.

## Deployment

This project is compatible with a standard Next.js deployment setup, including Vercel. For production deployment, make sure to:

- set all required environment variables
- configure a MongoDB connection string for the production environment
- ensure Prisma is generated in the deployment environment
- verify auth secrets and external service credentials are valid

## Notes

This repository appears to be a content-focused blog application with custom integrations and a data model designed for publishing and management. If you are extending the app, you may need to add or update environment variables depending on the specific features you enable.

## License

No explicit license file is present in the repository at this time. If you plan to distribute or publish the project publicly, it is recommended to add a license such as MIT.

## Contributing

Contributions are welcome. If you want to improve the app, fork the repository, create a feature branch, and open a pull request with a clear description of the changes.
