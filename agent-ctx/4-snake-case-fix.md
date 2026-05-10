# Task 4: Fix API Routes to Return camelCase Mapped Data

## Summary
Fixed all 8 API routes + dashboard route to map snake_case Supabase field names to camelCase, matching what the React components expect.

## Changes Made

### 1. `/src/app/api/orders/route.ts`
- Added `mapOrder()` function mapping: `order_number` → `orderNumber`, `order_type` → `orderType`, `total_amount` → `totalAmount`, `paid_amount` → `paidAmount`, `payment_status` → `paymentStatus`, `customer_id` → `customerId`, `assigned_to_id` → `assignedToId`, `completed_at` → `completedAt`, `created_at` → `createdAt`
- Nested customer mapping: `full_name` → `fullName`, `whatsapp` → `whatsapp`
- Applied mapping in GET, POST, and PUT responses

### 2. `/src/app/api/customers/route.ts`
- Added `mapCustomer()` function mapping: `full_name` → `fullName`, `is_vip` → `isVip`, `orders_count` → `ordersCount`, `total_spent` → `totalSpent`, `created_at` → `createdAt`
- Applied mapping in GET, POST, and PUT responses

### 3. `/src/app/api/govt-services/route.ts`
- Added `mapGovtService()` function mapping: `service_type` → `serviceType`, `service_name` → `serviceName`, `application_id` → `applicationId`, `fee_amount` → `feeAmount`, `fee_paid` → `feePaid`, `applied_date` → `appliedDate`, `status_updated_at` → `statusUpdatedAt`, `customer_id` → `customerId`, `created_at` → `createdAt`
- Nested customer mapping: `full_name` → `fullName`

### 4. `/src/app/api/notarisation/route.ts`
- Added `mapNotarisation()` function mapping: `service_type` → `serviceType`, `fee_amount` → `feeAmount`, `fee_paid` → `feePaid`, `appointment_date` → `appointmentDate`, `completed_at` → `completedAt`, `customer_id` → `customerId`, `created_at` → `createdAt`
- Nested customer mapping: `full_name` → `fullName`

### 5. `/src/app/api/payments/route.ts`
- Added `mapPayment()` function mapping: `order_id` → `orderId`, `customer_id` → `customerId`, `payment_method` → `paymentMethod`, `receipt_number` → `receiptNumber`, `created_at` → `createdAt`
- Nested customer mapping: `full_name` → `fullName`
- Nested order mapping: `order_number` → `orderNumber`
- Fixed revenue keys: `week` → `thisWeek`, `month` → `thisMonth` (matching PaymentsModule expectations)

### 6. `/src/app/api/inventory/route.ts`
- Added `mapInventoryItem()` function mapping: `item_name` → `itemName`, `current_stock` → `currentStock`, `minimum_stock` → `minimumStock`, `last_restocked` → `lastRestocked`, `created_at` → `createdAt`

### 7. `/src/app/api/pricing/route.ts`
- Added `mapPricingRule()` function mapping: `service_type` → `serviceType`, `service_name` → `serviceName`, `is_active` → `isActive`, `created_at` → `createdAt`

### 8. `/src/app/api/whatsapp/templates/route.ts`
- Added `mapTemplate()` function mapping: `is_favorite` → `isFavorite`, `usage_count` → `usageCount`, `created_at` → `createdAt`, `updated_at` → `updatedAt`

### 9. `/src/app/api/dashboard/route.ts`
- Added mapping for `lowInventory` array: `item_name` → `itemName`, `current_stock` → `currentStock`, `minimum_stock` → `minimumStock`, `last_restocked` → `lastRestocked`

## Deployment
- Committed: `FIX: API routes return camelCase mapped data for all modules`
- Pushed to GitHub: main branch
- Deployed to Vercel: https://jugnoosmartportal.vercel.app
