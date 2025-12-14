# DocFlows Frontend

Next.js 16 application for the DocFlows document workflow management system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Development Server**: http://localhost:3000

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **State Management**: React Context API

## 🏗️ Project Structure

```
src/
├── app/                   # Next.js pages (App Router)
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── page.tsx          # Home (redirects)
│   ├── login/page.tsx    # Login page
│   └── dashboard/page.tsx # Dashboard (protected)
├── components/            # Reusable components
│   └── ProtectedRoute.tsx # Route protection
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Auth state
├── lib/                   # Utilities
│   └── api.ts            # Axios instance
└── services/              # API layer (coming)
```

## 🔐 Authentication

- **Login**: `POST /auth/login` → Store JWT in localStorage
- **Protected Routes**: Wrap pages with `<ProtectedRoute>`
- **Token**: Auto-injected via Axios interceptor
- **Logout**: Clears token and redirects to login

## 🎨 Styling

Using Tailwind CSS 4 with zinc color palette:

```tsx
// Primary button
<button className="bg-zinc-900 text-white px-4 py-2 rounded-md">
  Click Me
</button>

// Input field
<input className="border border-zinc-300 rounded-md px-3 py-2" />
```

## 🔌 API Integration

```typescript
import api from "@/lib/api";

// API calls (token auto-injected)
const users = await api.get("/users");
const newUser = await api.post("/users", data);
```

## 🧪 Test Credentials

```
Admin: admin@docflow.com / admin123
User: user1@docflow.com / password123
```

## 🌐 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5040
```

## 📚 Documentation

- [FRONTEND_SETUP_COMPLETE.md](../../docs/FRONTEND_SETUP_COMPLETE.md)
- [QUICK_START.md](../../docs/QUICK_START.md)

## ✅ Current Status

**Implemented**:

- ✅ Authentication flow
- ✅ Protected routes
- ✅ Dashboard with user profile
- ✅ Responsive design + dark mode

**Coming Soon**:

- ⏳ Requisitions management
- ⏳ Users/Departments pages
- ⏳ Shared components

---

**Status**: Frontend infrastructure complete  
**Next**: Requisitions management UI
