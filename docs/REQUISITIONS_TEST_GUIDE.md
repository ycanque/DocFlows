# Requisitions Frontend - Quick Test Guide

**Date**: December 15, 2025  
**Status**: Ready for Testing ✅

---

## 🚀 Quick Start

### 1. Start Development Servers

```powershell
# Terminal 1: Backend (from root)
cd apps/backend
npm run start:dev
# Backend running on http://localhost:5040

# Terminal 2: Frontend (from root)
npm run dev
# Frontend running on http://localhost:3000
```

### 2. Login

- URL: http://localhost:3000
- Email: `admin@docflow.com`
- Password: `admin123`

---

## 🧪 Testing Scenarios

### Scenario 1: Create a New Requisition

1. Login as admin user
2. Click "Requisition Slips" in sidebar (or navigate to http://localhost:3000/dashboard/requisitions)
3. Click "New Requisition" button
4. Fill in the form:
   - **Department**: Select "Admin Department"
   - **Date Requested**: Today's date (pre-filled)
   - **Date Needed**: Future date
   - **Purpose**: "Office supplies for Q1 2025"
   - **Items**:
     - Item 1: Qty=10, Unit="box", Particulars="A4 Paper", Cost=500
     - Item 2: Qty=5, Unit="pcs", Particulars="Blue Pens", Cost=50
     - Click "Add Item" for Item 2
5. Verify total cost calculation (₱750.00)
6. Click "Create Requisition"
7. ✅ **Expected**: Redirected to requisition details page, status shows "DRAFT"

### Scenario 2: Submit for Approval

1. From requisition details page (should be on it after creating)
2. Click "Submit for Approval" button
3. Confirm dialog
4. ✅ **Expected**: Status changes to "SUBMITTED", approval timeline shows submission

### Scenario 3: Approve Requisition (As Approver)

1. Login as approver: `approver@docflow.com` / `password123`
2. Go to Requisitions list
3. Click on the submitted requisition
4. Click "Approve" button (green)
5. Confirm dialog
6. ✅ **Expected**:
   - Status changes to "APPROVED" (if single-level) or "PENDING_APPROVAL" (if multi-level)
   - Approval timeline shows approval with approver name and timestamp

### Scenario 4: Reject Requisition (As Approver)

1. Create another requisition and submit it
2. Login as approver
3. Click "Reject" button (red)
4. Enter reason: "Insufficient budget justification"
5. Click "Reject Requisition"
6. ✅ **Expected**:
   - Status changes to "REJECTED"
   - Approval timeline shows rejection with reason

### Scenario 5: Search and Filter

1. Go to requisitions list
2. Test search:
   - Type requisition number in search box
   - Type part of purpose
   - Type requester name
3. Test filters:
   - Click "Draft" tab → shows only drafts
   - Click "Pending" tab → shows only pending
   - Click "Approved" tab → shows only approved
   - Click "All" tab → shows all
4. ✅ **Expected**: List updates dynamically with each search/filter

### Scenario 6: Cancel Requisition

1. Create a requisition (don't submit)
2. From details page, click "Cancel" button
3. Confirm dialog
4. ✅ **Expected**: Status changes to "CANCELLED"

### Scenario 7: View Approval History

1. Navigate to any approved/rejected requisition
2. Scroll to "Approval History" section
3. ✅ **Expected**:
   - Timeline shows all approval actions
   - Green checkmark for approvals
   - Red X for rejections
   - Comments/reasons displayed
   - Timestamps shown

### Scenario 8: Statistics Cards

1. Go to requisitions list
2. Verify statistics cards:
   - **Total**: Count of all requisitions
   - **Pending**: Count of PENDING_APPROVAL status
   - **Approved**: Count of APPROVED status
   - **Draft**: Count of DRAFT status
3. ✅ **Expected**: Numbers match actual counts in table

---

## 🎭 Role-Based Testing

### As Admin (`admin@docflow.com` / `admin123`)

- ✅ Can create requisitions
- ✅ Can submit requisitions
- ✅ Can approve any requisition
- ✅ Can reject any requisition
- ✅ Can cancel any requisition

### As Approver (`approver@docflow.com` / `password123`)

- ✅ Can create requisitions
- ✅ Can approve submitted requisitions
- ✅ Can reject submitted requisitions
- ❌ Cannot cancel others' requisitions

### As User (`user1@docflow.com` / `password123`)

- ✅ Can create requisitions
- ✅ Can submit own requisitions
- ✅ Can cancel own requisitions
- ❌ Cannot approve requisitions
- ❌ Cannot reject requisitions

---

## 🌓 Theme Testing

1. Go to Settings page (http://localhost:3000/dashboard/settings)
2. Toggle between Light and Dark themes
3. Navigate to requisitions pages
4. ✅ **Expected**: All components adapt to theme (status badges, tables, cards, forms)

---

## 📱 Responsive Testing

### Desktop (>1024px)

- ✅ Sidebar always visible
- ✅ Two-column grid layouts
- ✅ Full table width

### Tablet (768px - 1024px)

- ✅ Sidebar collapsible
- ✅ Two-column grid on forms
- ✅ Scrollable tables

### Mobile (<768px)

- ✅ Hamburger menu for sidebar
- ✅ Single-column layouts
- ✅ Stacked cards
- ✅ Horizontal scroll on tables

---

## 🐛 Error Scenarios to Test

### Validation Errors

1. Try creating requisition without department → Error: "Please select a department"
2. Try creating requisition without purpose → Error: "Please enter the purpose"
3. Try creating requisition with 0 quantity → Error: "Quantity must be greater than 0"
4. Try creating requisition with empty unit → Error: "Unit is required"

### Permission Errors

1. Login as regular user
2. Try to access approve action directly (via API) → Should get 403 Forbidden
3. UI should not show approve/reject buttons for non-approvers

### Network Errors

1. Stop backend server
2. Try to load requisitions list → Error: "No response from server"
3. Try to create requisition → Error: "Failed to create requisition"

---

## ✅ Feature Checklist

### List Page

- [x] Statistics cards display correctly
- [x] Status filter tabs work
- [x] Search functionality works
- [x] Table displays all requisitions
- [x] Click row navigates to details
- [x] "New Requisition" button works
- [x] Loading spinner shows during fetch
- [x] Error message displays on failure
- [x] Empty state message when no data

### Details Page

- [x] All requisition info displayed
- [x] Items table shows items with costs
- [x] Approval timeline shows history
- [x] Status badge displays correct status
- [x] Action buttons show/hide based on role
- [x] Submit button works (DRAFT → SUBMITTED)
- [x] Approve button works (SUBMITTED → APPROVED/PENDING)
- [x] Reject modal opens with textarea
- [x] Reject action works with reason
- [x] Cancel button works
- [x] Back button navigates to list
- [x] Real-time status updates after actions

### Create Page

- [x] Department selector populated from API
- [x] Default department set to user's dept
- [x] Date pickers work
- [x] Purpose textarea works
- [x] Add item button works
- [x] Remove item button works (min 1 item enforced)
- [x] All item fields editable
- [x] Total cost calculates dynamically
- [x] Form validation shows errors
- [x] Submit creates requisition
- [x] Success redirects to details
- [x] Cancel button navigates back

---

## 🔍 API Endpoints Used

All endpoints on `http://localhost:5040`:

- `GET /requisitions` - List all requisitions
- `GET /requisitions/:id` - Get single requisition
- `POST /requisitions` - Create requisition
- `PATCH /requisitions/:id` - Update requisition
- `DELETE /requisitions/:id` - Delete requisition
- `POST /requisitions/:id/submit` - Submit for approval
- `POST /requisitions/:id/approve` - Approve requisition
- `POST /requisitions/:id/reject` - Reject requisition
- `POST /requisitions/:id/cancel` - Cancel requisition
- `GET /requisitions/:id/approval-history` - Get approval history
- `GET /departments` - List all departments

---

## 🎯 Success Criteria

### Performance

- [ ] List page loads in <2 seconds
- [ ] Details page loads in <1 second
- [ ] Create form submits in <1 second
- [ ] Search/filter updates in <500ms

### Functionality

- [x] All CRUD operations work
- [x] All workflow actions work
- [x] Role-based permissions enforced
- [x] Form validation prevents bad data
- [x] Error handling graceful

### UX

- [x] Loading states prevent confusion
- [x] Error messages are user-friendly
- [x] Navigation is intuitive
- [x] Forms are easy to fill
- [x] Actions have confirmations

### Design

- [x] Consistent with dashboard design
- [x] Theme support works
- [x] Responsive on all devices
- [x] Accessible (keyboard, screen readers)

---

## 📸 Expected Screenshots

### List Page

- Header with "Requisitions" title and "New Requisition" button
- 4 statistics cards in a row
- Search bar and status filter tabs
- Table with requisitions data
- Status badges colored appropriately

### Details Page

- Header with requisition number and status badge
- Action buttons (Submit, Approve, Reject, Cancel) based on role
- Requisition information card (2-column grid)
- Requisition items table with total cost
- Approval history timeline

### Create Page

- Header with "Create Requisition" title and back button
- Basic information card with department, dates, purpose
- Requisition items card with add/remove item functionality
- Total cost display
- Cancel and Create buttons

---

**Ready to Test!** 🚀

Follow the scenarios above to verify all functionality works as expected.
