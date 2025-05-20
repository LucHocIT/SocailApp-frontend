# SocialApp Frontend

This is the React.js frontend for the SocialApp social media application. This frontend is designed to be used with the .NET Core backend API.

## Features

- User authentication (login, registration, social login)
- Email verification
- User profile management
- Responsive design

## Tech Stack

- React.js
- React Router for navigation
- Axios for API requests
- Formik and Yup for form validation
- React-Toastify for notifications
- CSS for styling

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Backend API running (see main project README for backend setup)

### Installation

1. Clone this repository (frontend only):

```bash
git clone https://github.com/your-username/socialapp-frontend.git
cd socialapp-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Setting Up as a Separate Repository

This frontend is designed to work as a standalone repository, separate from the backend. Here's how to set it up:

1. Create a new repository on GitHub for the frontend.
2. Initialize git in this directory if it's not already initialized:

```bash
git init
```

3. Add the remote repository:

```bash
git remote add origin https://github.com/your-username/socialapp-frontend.git
```

4. Add, commit, and push the code:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Production Deployment

To build the project for production:

```bash
npm run build
```

This will create a `dist` directory with production-optimized files that can be deployed to any static hosting service.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
