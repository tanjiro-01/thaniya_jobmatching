# Job Portal

A full-stack job portal web application where candidates can apply for jobs and receive recommendations, and recruiters can post jobs and manage applications.

## Features

* **Candidate Module:** Register/login, profile management (resume upload), job search and filtering, AI-based job matching (keyword logic), dashboard.
* **Recruiter Module:** Register/login, post jobs, manage applications, dashboard.
* **Admin Module:** Overall platform management.

## Tech Stack

* **Frontend:** React.js, React Router, Axios, Vite.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas, Mongoose.
* **Storage:** Cloudinary (for resumes).

## Setup Instructions

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB Atlas connection string

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` (add your MongoDB URI).
4. Start the server: `npm run dev` (or `node index.js`)

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Project Structure
* `/client`: React application.
* `/server`: Node.js Express API.

## Screenshots
*(Coming soon)*
