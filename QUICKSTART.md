# Quick Start Guide - Docmobi Admin Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3001/api
```

### Step 2: Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 3: Login
Visit http://localhost:3000 and login with:
```
Email: admin@example.com
Password: 123456
```

---

## 📋 Feature Checklist

### ✅ Authentication
- [x] Login with email & password
- [x] Forgot password with OTP verification
- [x] Change password
- [x] Token auto-refresh
- [x] Logout

### ✅ Dashboard
- [x] Real-time statistics (Patients, Doctors, Signups)
- [x] Weekly trends chart
- [x] Professional UI with icons

### ✅ Doctor Management
- [x] List all doctors with pagination
- [x] Search by name or specialty
- [x] Filter by status (Pending, Approved, Suspended)
- [x] Approve/Reject pending registrations
- [x] View doctor details

### ✅ Patient Management
- [x] List all patients with pagination
- [x] Search by name
- [x] Filter by status (Active, Block)
- [x] Block/Unblock patients
- [x] View patient details

### ✅ Appointment Management
- [x] List all appointments with pagination
- [x] View appointment details
- [x] Cancel appointments
- [x] Filter by status

### ✅ Earnings Tracking
- [x] View total earnings
- [x] Track appointments count
- [x] Average earnings per doctor
- [x] Doctor-wise breakdown
- [x] Weekly/Monthly view toggle

### ✅ Category Management
- [x] List all medical specialties
- [x] Add new category
- [x] Edit category
- [x] Delete category
- [x] Toggle active/inactive status

### ✅ Settings
- [x] Change password
- [x] Account information
- [x] Security options

---

## 🎨 UI/UX Features

### Visual Elements
- ✅ Beautiful gradient blue healthcare theme
- ✅ Professional card layouts
- ✅ Responsive tables with proper formatting
- ✅ User avatars with fallbacks
- ✅ Status badges with color coding
- ✅ Skeleton loaders for data loading
- ✅ Icons for all sections
- ✅ Mobile-responsive sidebar

### User Experience
- ✅ Real-time search (debounced)
- ✅ Instant feedback via toast notifications
- ✅ Loading states on buttons
- ✅ Pagination controls
- ✅ Filter dropdowns
- ✅ Modal dialogs for actions
- ✅ Smooth transitions
- ✅ Touch-friendly mobile UI

---

## 🔌 API Integration

All requests include JWT token automatically via axios interceptor:

```typescript
// Token is automatically added to all requests
Authorization: Bearer {accessToken}
```

### Example Flow

**1. Login**
```
POST /auth/login
Body: { email, password }
Response: { accessToken, refreshToken }
```

**2. Use Token**
```
All subsequent requests automatically include:
Header: Authorization: Bearer {accessToken}
```

**3. Auto-Refresh**
```
If 401 response:
- Refresh token automatically
- Retry original request
- Update stored token
```

**4. Logout**
```
- Clear localStorage tokens
- Redirect to /login
```

---

## 📊 Data Tables

All tables include:
- ✅ Pagination (10 items per page)
- ✅ Search functionality
- ✅ Status filters
- ✅ Action buttons
- ✅ Responsive design
- ✅ Loading skeletons
- ✅ Empty states
- ✅ Item count display

---

## 🛠️ Customization

### Change API Base URL
Edit `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=https://your-api.com/api
```

### Change Theme Colors
Edit `app/globals.css`:
```css
:root {
  --primary: oklch(0.205 0 0);  /* Blue */
  /* ... other colors ... */
}
```

### Change Items Per Page
In each page component:
```typescript
const ITEMS_PER_PAGE = 10;  // Change to desired number
```

### Adjust Toast Position
In `components/providers.tsx`:
```typescript
<Toaster position="top-right" />  // Change position
```

---

## 🔐 Security

### Implemented
- ✅ JWT authentication
- ✅ Token refresh mechanism
- ✅ Secure token storage
- ✅ Protected routes
- ✅ Password hashing (on backend)
- ✅ OTP verification
- ✅ HTTPS-ready

### Best Practices
- Use HTTPS in production
- Set secure cookie flags
- Implement CORS properly
- Use environment variables for secrets
- Regular security audits

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px (lg)
- **Desktop**: > 1024px

All layouts are optimized for each breakpoint.

---

## 🎯 Common Tasks

### Add New API Endpoint
1. Create function in `lib/api.ts`:
```typescript
export const newAPI = {
  getItems: () => getAxiosInstance().get("/endpoint"),
};
```

2. Use in component with React Query:
```typescript
const { data } = useQuery({
  queryKey: ["items"],
  queryFn: () => newAPI.getItems(),
});
```

### Create New Page
1. Create folder: `app/dashboard/new-page/`
2. Add `page.tsx` with your content
3. Link from sidebar in `components/dashboard-sidebar.tsx`

### Add Toast Notification
```typescript
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
```

### Invalidate Query Cache
```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["doctors"] });
```

---

## 🧪 Testing the API

### Using Postman
1. Set Base URL: `{{baseURL}}`
2. Add token to Authorization header
3. Test endpoints

### Using cURL
```bash
curl -H "Authorization: Bearer {token}" \
     http://localhost:3001/api/user/dashboard/overview
```

### Using JavaScript
```typescript
const response = await fetch('/api/user/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

---

## 📈 Performance Tips

1. **Use Pagination**: Always paginate large datasets
2. **Search Debouncing**: Implemented automatically
3. **Cache Data**: TanStack Query handles caching
4. **Lazy Load**: Use Next.js dynamic imports
5. **Optimize Images**: Use next/image for avatars

---

## 🐛 Debugging

### Check Console Logs
```typescript
// Add debug statements
console.log("[v0] API Response:", data);
```

### Verify Token
```typescript
console.log(localStorage.getItem('accessToken'));
```

### Network Tab
1. Open DevTools → Network
2. Check request headers
3. Verify response status
4. Review response body

---

## 🚀 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod
```

### Docker Deployment
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD npm run start
```

---

## 📞 Support

### Troubleshooting
1. Check browser console for errors
2. Verify API endpoint in `.env.local`
3. Ensure backend is running
4. Check token in localStorage
5. Review API documentation

### Common Issues
- **Blank page**: Clear cache, check API URL
- **404 errors**: Verify endpoint paths
- **Token errors**: Check token format and expiry
- **CORS errors**: Configure backend CORS

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## ✨ Next Steps

1. Customize theme colors
2. Add more API endpoints
3. Implement advanced filtering
4. Add export to CSV functionality
5. Integrate email notifications
6. Set up analytics
7. Configure backup systems
8. Plan scaling strategy

---

**You're all set! 🎉 Start building with Docmobi Admin Dashboard!**
