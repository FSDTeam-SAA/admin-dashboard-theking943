# Technical Documentation

## 1. System Architecture

The Docmobi Admin Dashboard is built as a generic implementation of a modern Single Page Application (SPA) using Next.js 16's App Router, while primarily leveraging client-side rendering for improved interactivity in the administrative interface.

### Core Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI based)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest) (Server state), React Context/Hooks (Local state)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v4)
- **Icons**: [Lucide React](https://lucide.dev/)

## 2. Project Structure

```
admin-dashboard-theking943/
├── app/                        # Next.js App Router directory
│   ├── dashboard/              # Protected dashboard routes
│   │   ├── appointments/       # Appointment management
│   │   ├── categories/         # Category management
│   │   ├── doctors/            # Doctor profile management
│   │   ├── earnings/           # Financial tracking
│   │   ├── patients/           # Patient management
│   │   ├── referral/           # Referral code system
│   │   └── settings/           # User settings
│   ├── login/                  # Authentication entry
│   └── layout.tsx              # Root layout with Providers
├── components/                 # React components
│   ├── ui/                     # Reusable UI components (shadcn)
│   ├── dashboard-sidebar.tsx   # Main navigation
│   └── skeletons.tsx           # Loading states
├── lib/
│   ├── api-client.ts           # Centralized API client & methods
│   └── utils.ts                # Helper functions
└── public/                     # Static assets
```

## 3. Key Concepts & Patterns

### 3.1 Authentication Pattern
Authentication is handled via `NextAuth.js` with a custom credentials provider.
- **Login**: `authorize` callback in NextAuth validates credentials against the backend API.
- **Session**: The JWT returned by the backend (accessToken) is stored in the NextAuth session.
- **Middleware**: `API Request Interceptor` in `lib/api-client.ts` automatically attaches the `Bearer` token to every outgoing request.

### 3.2 Data Fetching Strategy
We uses **TanStack Query (React Query)** for efficient server state management.
- **Queries**: Used for fetching data (e.g., `useQuery({ queryKey: ['doctors'], ... })`).
- **Mutations**: Used for modifying data (e.g., `useMutation({ mutationFn: ... })`).
- **Caching**: Data is cached with a default stale time (typically 5 minutes) to minimize network requests.
- **Invalidation**: Queries are automatically invalidated after successful mutations to ensure UI freshness without manual state updates.

### 3.3 Component Design
- **Atomic Design**: Components are small, reusable, and composable.
- **Headless UI**: Uses `radix-ui` primitives for accessibility and functionality, styled with Tailwind CSS.
- **Composition**: Helper components like `dashboard-sidebar` are composed into layouts.

## 4. API Integration
All API calls are centralized in `lib/api-client.ts`. This ensures:
- **Type Safety**: Request and response types can be defined centrally (though mainly `any` is used currently, strong typing is encouraged).
- **Consistency**: Base URL and headers are managed in one place.
- **Error Handling**: Global error handling via axios interceptors (e.g., auto-logout on 401).

### Example Service Method
```typescript
export const doctorsAPI = {
  getDoctors: async (page = 1, limit = 10, search = "", status = "") => {
    const client = await getApiClient();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status
    });
    return client.get(`/user/role/doctor?${params.toString()}`);
  },
};
```

## 5. Deployment
The application is designed to be deployed on any platform supporting Next.js (Vercel, Node.js server, Docker).

### Build Command
```bash
npm run build
```

### Environment Variables
Required variables in `.env.local` or production environment:
- `NEXT_PUBLIC_BASE_URL`: URL of the backend API.
- `NEXTAUTH_URL`: URL of the frontend application.
- `NEXTAUTH_SECRET`: Secret key for session encryption.
