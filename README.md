# Little Star — Educational Website & Management System

Official full-stack MERN educational platform and coaching/school management system for **Little Star** (*A Caring Place for Young Learners*), directed by **Selina Parveen (Munni)**.

## Academic Programs

- **Regular Educational Program**: Pre-Play, Play, Class 1, Class 2, Class 3, Class 4 (Minimum age: 4 years)
- **Special Programs (Separate Track)**:
  - Special English Classes (Class 3–8)
  - Special ICT Classes (Class 3–8)

## Tech Stack

- **Frontend**: React.js (JavaScript), Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, React Hook Form
- **Backend**: Node.js, Express.js, MongoDB Atlas & Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `helmet`, `express-rate-limit`, `cors`, `multer`, `cloudinary`

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string (optional in local preview; falls back to local JSON persistence when blank)
   - `JWT_SECRET`: Strong random string for signing JWT cookies
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Initial admin credentials (if omitted, a one-time setup form appears at `/admin` and locks permanently once claimed)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary media upload credentials (falls back to secure `/uploads` disk storage when blank)
3. Start development server on port `3000`:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Deployment Guide

### Backend (Render)
1. Deploy the repository as a Node.js Web Service on Render.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Configure Environment Variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_*`).

### Frontend (Vercel)
If hosting the frontend separately on Vercel:
1. Build Command: `npm run build`
2. Output Directory: `dist`
3. Set `VITE_API_URL` to your deployed Render backend URL, and add the Vercel URL to `CLIENT_URL` on Render for CORS allowlisting.
