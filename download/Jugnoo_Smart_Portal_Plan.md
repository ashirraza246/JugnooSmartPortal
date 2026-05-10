# 🚀 Jugnoo Smart Portal — Complete Project Plan

## 📋 Project Overview

**Business:** Jugnoo Photostate, Chowk Azam  
**App Name:** Jugnoo Smart Portal  
**Goal:** AI-powered business management app that automates 80% of daily operations, reduces burden, and increases earnings 10x  
**Tech Stack:** Next.js 16 + Supabase + Cloudinary + Vercel

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (Deployment)                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Next.js 16 (App Router)             │   │
│  │                                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ Dashboard │  │ WhatsApp │  │  Orders  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │Customers │  │  Govt    │  │Notarise  │   │   │
│  │  │   CRM    │  │Services  │  │ Services │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ Payments │  │Pricing   │  │Inventory │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│           │                │              │          │
│     ┌─────┴─────┐   ┌─────┴─────┐  ┌────┴────┐   │
│     │  Supabase  │   │ Cloudinary│  │WhatsApp │   │
│     │  Database  │   │  Images   │  │  API    │   │
│     │  + Auth    │   │  + Docs   │  │         │   │
│     └───────────┘   └───────────┘  └─────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📱 App Modules (7 Core Modules)

### Module 1: 📊 Dashboard
- Real-time stats: Today's orders, revenue, pending tasks, active customers
- Quick actions: New order, send message, apply for scheme
- Revenue charts (daily/weekly/monthly)
- Recent activity feed
- Pending tasks & reminders

### Module 2: 💬 WhatsApp Template System ⭐ (CORE FEATURE)
- **Template Library:** 1000+ pre-built templates categorized by:
  - Order confirmations
  - Payment receipts
  - Document ready notifications
  - Government scheme updates
  - Scholarship notifications
  - Loan status updates
  - BISP payment alerts
  - Follow-up reminders
  - Festival/promotional messages
  - Service availability notices
- **Template Builder:** Create custom templates with variables like {name}, {amount}, {date}, {service}
- **Quick Send Flow:** Select Customer → Select Template → Preview → Send via WhatsApp
- **Category Management:** Organize templates by service type
- **Favorites:** Pin most-used templates
- **Search & Filter:** Find templates instantly

### Module 3: 📋 Order Management
- Create new order (walk-in / WhatsApp / online)
- Order types: Printing, Scanning, Copying, Custom Print, Photo Print, Posters, Forms
- Order status tracking: Pending → In Progress → Ready → Delivered
- Priority levels: Normal, Urgent, VIP
- Assign to staff member
- Auto-notify customer on status change (via WhatsApp template)
- Order history & search
- Print receipt / invoice

### Module 4: 👥 Customer CRM
- Customer database with full profile
- Contact info, WhatsApp number, CNIC
- Service history (all past orders)
- Payment history
- Tags: Regular, VIP, Student, Government Employee, etc.
- Quick actions: Send message, View orders, Create new order
- Follow-up reminders
- Customer search & filter
- Import/Export customer list

### Module 5: 🏛️ Government Services Hub
- **Sub-modules:**
  - **Schemes Application:** Ehsaas, Benazir, Sehat Card, Naya Pakistan Housing, etc.
  - **Scholarships:** Student wazeefy tracking, application status
  - **BISP Payments:** Payment status, issue tracking, next payment date
  - **Loan Applications:** Akhuwat, interest-free loans, bank loans
- Application form builder (pre-filled from customer data)
- Document checklist per service
- Status tracking: Applied → Under Review → Approved → Rejected
- Auto-reminder for pending documents
- Fee management per service
- WhatsApp notification on status change

### Module 6: ⚖️ Notarisation Services
- Service types: Deed, Demand for Payment, Divorce, E-Notary, General
- Document checklist per notarisation type
- Customer document upload (via Cloudinary)
- Appointment scheduling
- Fee calculation (auto)
- Status tracking
- WhatsApp notification on completion
- Digital record keeping

### Module 7: 💰 Payments & Pricing
- **Auto-Quoting System:** Select services → Auto-calculate price
- Custom pricing rules (per page, per document, per service)
- Payment recording (Cash / Online / Partial)
- Receipt generation (PDF)
- Daily/Weekly/Monthly revenue reports
- Expense tracking
- Profit & Loss dashboard
- Outstanding payments tracking

### Bonus: 📦 Service Inventory
- Track forms, paper, ink, supplies
- Low stock alerts
- Reorder reminders
- Usage reports

---

## 🗄️ Supabase Database Schema

### Tables:

```sql
-- 1. Users (Staff Authentication)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT (admin/staff),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP
)

-- 2. Customers
customers (
  id UUID PRIMARY KEY,
  full_name TEXT,
  whatsapp_number TEXT,
  cnic TEXT,
  email TEXT,
  address TEXT,
  tags TEXT[],
  notes TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 3. Orders
orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES customers,
  order_type TEXT (printing/scanning/copying/custom_print/photo_print/poster/form),
  status TEXT (pending/in_progress/ready/delivered/cancelled),
  priority TEXT (normal/urgent/vip),
  description TEXT,
  specifications JSONB,  -- {pages, copies, size, color/BW, paper_type, etc.}
  total_amount DECIMAL,
  paid_amount DECIMAL DEFAULT 0,
  payment_status TEXT (unpaid/partial/paid),
  assigned_to UUID REFERENCES users,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- 4. Order Items (for multi-service orders)
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  service_type TEXT,
  description TEXT,
  quantity INT,
  unit_price DECIMAL,
  total_price DECIMAL,
  specifications JSONB
)

-- 5. WhatsApp Templates
whatsapp_templates (
  id UUID PRIMARY KEY,
  name TEXT,
  category TEXT,  -- order/payment/govt/scholarship/loan/bisp/followup/promo/general
  content TEXT,  -- Template body with {variables}
  variables TEXT[],  -- List of variable names
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 6. WhatsApp Message Log
whatsapp_messages (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES whatsapp_templates,
  customer_id UUID REFERENCES customers,
  message_content TEXT,
  sent_at TIMESTAMP,
  sent_by UUID REFERENCES users,
  status TEXT (sent/delivered/read/failed)
)

-- 7. Government Services
govt_services (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers,
  service_type TEXT,  -- scheme/scholarship/bisp/loan
  service_name TEXT,  -- Ehsaas/Benazir/Akhuwat etc.
  application_id TEXT,
  status TEXT (applied/under_review/approved/rejected),
  documents JSONB,  -- {document_name: cloudinary_url}
  fee_amount DECIMAL,
  fee_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  applied_date DATE,
  status_updated_at TIMESTAMP,
  created_at TIMESTAMP
)

-- 8. Notarisation Services
notarisation_services (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers,
  service_type TEXT,  -- deed/demand_payment/divorce/e_notary/general
  description TEXT,
  documents JSONB,  -- {document_name: cloudinary_url}
  fee_amount DECIMAL,
  fee_paid BOOLEAN DEFAULT FALSE,
  status TEXT (pending/in_process/completed),
  appointment_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)

-- 9. Payments
payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  customer_id UUID REFERENCES customers,
  amount DECIMAL,
  payment_method TEXT,  -- cash/online/partial
  receipt_number TEXT,
  notes TEXT,
  received_by UUID REFERENCES users,
  created_at TIMESTAMP
)

-- 10. Pricing Rules
pricing_rules (
  id UUID PRIMARY KEY,
  service_type TEXT,
  service_name TEXT,
  unit TEXT,  -- per_page/per_document/per_service
  price DECIMAL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 11. Inventory
inventory (
  id UUID PRIMARY KEY,
  item_name TEXT,
  category TEXT,  -- paper/ink/form/supply
  current_stock INT,
  minimum_stock INT,
  unit TEXT,  -- ream/piece/cartridge
  last_restocked DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 12. Service Categories (for organizing services)
service_categories (
  id UUID PRIMARY KEY,
  name TEXT,
  icon TEXT,
  description TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT TRUE
)
```

---

## 🎨 UI/UX Design Plan

### Color Palette:
- **Primary:** #2563EB (Blue) — Trust, Professional
- **Secondary:** #F59E0B (Amber) — Energy, Jugnoo (Firefly)
- **Accent:** #10B981 (Green) — Success, Money
- **Danger:** #EF4444 (Red) — Urgent, Overdue
- **Background:** #F8FAFC (Light Gray)
- **Sidebar:** #1E293B (Dark Slate)

### Layout:
- **Left Sidebar:** Navigation with icons + labels
- **Top Header:** Search, Notifications, Profile
- **Main Content:** Module-specific views

### Key Screens:
1. **Login Page** — Email/Password auth
2. **Dashboard** — Stats + Quick Actions
3. **WhatsApp Templates** — Grid/List view, categories sidebar
4. **Template Detail** — Preview + Variables + Send
5. **Orders List** — Table with filters + status badges
6. **New Order** — Multi-step form
7. **Customer Profile** — Full CRM view
8. **Govt Services** — Tabs for each service type
9. **Notarisation** — Service cards with status
10. **Payments** — Table + Charts
11. **Settings** — Pricing rules, inventory, user management

---

## 🔧 API Routes Structure

```
/api/
  /auth/          → login, register, logout
  /customers/     → CRUD + search + tags
  /orders/        → CRUD + status update + assign
  /whatsapp/
    /templates/   → CRUD + categories + favorites
    /send/        → Send template to customer
    /messages/    → Message log
  /govt/          → CRUD + status tracking
  /notarisation/  → CRUD + appointments
  /payments/      → Record + receipt + reports
  /pricing/       → CRUD pricing rules
  /inventory/     → CRUD + low stock alerts
  /dashboard/     → Stats + charts data
  /upload/        → Cloudinary upload endpoint
```

---

## 📁 Project Folder Structure

```
jugnoo-smart-portal/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── login/                  # Auth page
│   ├── orders/
│   │   ├── page.tsx            # Orders list
│   │   ├── new/page.tsx        # New order form
│   │   └── [id]/page.tsx       # Order detail
│   ├── whatsapp/
│   │   ├── page.tsx            # Templates library
│   │   ├── new/page.tsx        # Create template
│   │   └── [id]/page.tsx       # Template detail + send
│   ├── customers/
│   │   ├── page.tsx            # Customers list
│   │   ├── new/page.tsx        # Add customer
│   │   └── [id]/page.tsx       # Customer profile
│   ├── govt-services/
│   │   ├── page.tsx            # All govt services
│   │   ├── new/page.tsx        # New application
│   │   └── [id]/page.tsx       # Application detail
│   ├── notarisation/
│   │   ├── page.tsx            # Services list
│   │   ├── new/page.tsx        # New notarisation
│   │   └── [id]/page.tsx       # Service detail
│   ├── payments/
│   │   ├── page.tsx            # Payments list + reports
│   │   └── receipt/[id]/       # Receipt PDF
│   ├── pricing/page.tsx        # Pricing rules management
│   ├── inventory/page.tsx      # Inventory management
│   └── settings/page.tsx       # App settings
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── RecentActivity.tsx
│   ├── whatsapp/
│   │   ├── TemplateCard.tsx
│   │   ├── TemplatePreview.tsx
│   │   ├── TemplateEditor.tsx
│   │   └── SendFlow.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderForm.tsx
│   │   └── StatusBadge.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── SearchBar.tsx
│       └── Modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── cloudinary.ts           # Cloudinary config
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # App constants
├── types/
│   └── index.ts                # TypeScript types
├── hooks/
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   ├── useOrders.ts
│   └── useTemplates.ts
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── .env.local                  # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 🔄 Development Phases

### Phase 1: Foundation (Day 1)
- ✅ Project initialization (Next.js + TypeScript + Tailwind)
- ✅ GitHub repo setup
- ✅ Supabase project + database schema
- ✅ Cloudinary setup
- ✅ Layout (Sidebar + Header + Responsive)
- ✅ Auth (Login/Logout)

### Phase 2: Core Modules (Day 2-3)
- ✅ Dashboard with real-time stats
- ✅ WhatsApp Template System (FULL)
- ✅ Order Management (CRUD + Status)

### Phase 3: CRM & Services (Day 4-5)
- ✅ Customer CRM
- ✅ Government Services Hub
- ✅ Notarisation Module

### Phase 4: Finance & Polish (Day 6-7)
- ✅ Payments & Pricing
- ✅ Inventory
- ✅ Settings
- ✅ WhatsApp 1000+ Templates seeding
- ✅ Testing & Bug fixes
- ✅ Vercel deployment

---

## 🔐 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Daily orders handled | ~30 | 100+ |
| WhatsApp reply rate | ~10% | 95%+ |
| Government services/month | ~20 | 100+ |
| Revenue | X | 10X |
| Customer wait time | 30+ min | <5 min |
| Manual work hours | 12+ hrs | 3-4 hrs |

---

**Plan Ready! Ab coding start karni hai? 🚀**
