# iDEAL School Portal

A modern school management system built with Vite, React, and TypeScript.

## Features

- **Multi-role Dashboard**: Support for students, parents, teachers, school administrators, and super administrators
- **Assignment Management**: Create, submit, and grade assignments
- **Payment Tracking**: Monitor school fees and payment status
- **Results Management**: View and manage academic results
- **Timetable System**: Class schedules and timetable management
- **User Management**: Comprehensive user administration
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: Radix UI + Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   └── ui/            # UI component library
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   └── dashboard/     # Dashboard pages by role
├── services/          # API service functions
├── store/             # Zustand state stores
├── types/             # TypeScript type definitions
├── lib/               # Utility functions
└── styles/            # Global styles
```

## User Roles

- **Student**: View assignments, results, payments, and timetable
- **Parent**: Monitor ward's progress, payments, and results
- **Teacher**: Manage classes, assignments, and resources
- **School Admin**: Oversee school operations and users
- **Super Admin**: Manage multiple schools and system-wide settings

## Migration Notes

This application has been migrated from Next.js to Vite + TypeScript:

- ✅ Converted from Next.js App Router to React Router
- ✅ Replaced Next.js middleware with client-side auth handling
- ✅ Updated theme provider from next-themes to custom implementation
- ✅ Migrated all pages from Next.js structure to Vite structure
- ✅ Fixed all TypeScript compilation errors
- ✅ Maintained all existing functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
