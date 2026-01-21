# Docmobi Admin Dashboard - API Reference

## Overview

Complete API reference for the Docmobi Admin Dashboard. All endpoints are integrated and fully functional with automatic token management via Axios interceptors.

---

## Authentication

### Base Configuration

```typescript
// Automatically configured in lib/api.ts
Headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}

Base URL: process.env.NEXT_PUBLIC_BASE_URL
```

### Token Management

```typescript
// Tokens are automatically managed
localStorage.setItem('accessToken', token);  // After login
localStorage.setItem('refreshToken', token); // After login

// Auto-refreshed on 401 response
// Auto-removed on logout
```

---

## Endpoint Reference

### 1. Authentication Endpoints

#### Login
```
POST /auth/login

Request:
{
  "email": "admin@example.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "message": "User Logged in successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "role": "admin",
    "_id": "69314b2d...",
    "user": { /* full user object */ }
  }
}
```

**Used in**: `components/login/page.tsx`  
**Function**: `authAPI.login(email, password)`

---

#### Forgot Password (Send OTP)
```
POST /auth/forget

Request:
{
  "email": "admin@example.com"
}

Response:
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Used in**: `app/forgot-password/page.tsx` (Step 1)  
**Function**: `authAPI.forgotPassword(email)`

---

#### Verify OTP
```
POST /auth/verify-otp

Request:
{
  "email": "admin@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified"
}
```

**Used in**: `app/forgot-password/page.tsx` (Step 2)  
**Function**: `authAPI.verifyOTP(email, otp)`

---

#### Reset Password
```
POST /auth/reset-password

Request:
{
  "email": "admin@example.com",
  "otp": "123456",
  "password": "newPassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Used in**: `app/forgot-password/page.tsx` (Step 3)  
**Function**: `authAPI.resetPassword(email, otp, password)`

---

#### Change Password
```
POST /auth/change-password

Headers: Authorization: Bearer {accessToken}

Request:
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Used in**: `app/dashboard/settings/page.tsx`  
**Function**: `authAPI.changePassword(oldPassword, newPassword)`

---

### 2. Dashboard Endpoints

#### Get Dashboard Overview
```
GET /user/dashboard/overview

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Dashboard overview fetched",
  "data": {
    "totals": {
      "patients": {
        "count": 1450,
        "weeklyNew": 2,
        "weekOverWeekChangePct": 36
      },
      "doctors": {
        "count": 500,
        "weeklyNew": 0,
        "weekOverWeekChangePct": -14
      }
    },
    "weeklySignups": {
      "range": {
        "start": "2026-01-08T00:00:00.000Z",
        "end": "2026-01-14T23:59:59.999Z"
      },
      "days": [
        {
          "date": "2026-01-08",
          "label": "Wed",
          "patients": 0,
          "doctors": 0
        }
        // ... 7 days total
      ]
    }
  }
}
```

**Used in**: `app/dashboard/page.tsx`  
**Function**: `dashboardAPI.getOverview()`

---

### 3. Doctor Endpoints

#### Get All Doctors
```
GET /user/role/doctor?page=1&limit=10&search=&status=

Headers: Authorization: Bearer {accessToken}

Query Parameters:
- page (default: 1)
- limit (default: 10)
- search (optional: search by name/specialty)
- status (optional: pending|approved|suspended)

Response:
{
  "success": true,
  "message": "Users fetched for role: doctor",
  "data": [
    {
      "_id": "693103ace6c5c3f0299f6dcb",
      "fullName": "Dr. Ahmad",
      "email": "doctor@example.com",
      "phone": "0178965423",
      "specialty": "Dermatologists",
      "avatar": {
        "public_id": "docmobi/users/xyz",
        "url": "https://res.cloudinary.com/..."
      },
      "approvalStatus": "approved",
      "fees": {
        "amount": 20.5,
        "currency": "USD"
      },
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120
  }
}
```

**Used in**: `app/dashboard/doctors/page.tsx`  
**Function**: `doctorsAPI.getDoctors(page, limit, search, status)`

---

#### Get Doctor Details
```
GET /user/{doctorId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "User details fetched",
  "data": { /* full doctor object */ }
}
```

**Used in**: Doctor detail view  
**Function**: `doctorsAPI.getDoctorById(id)`

---

#### Approve/Reject Doctor Registration
```
PATCH /user/doctor/{doctorId}/approval

Headers: Authorization: Bearer {accessToken}

Request:
{
  "approvalStatus": "approved" | "suspended"
}

Response:
{
  "success": true,
  "message": "Doctor approval status updated",
  "data": { /* updated doctor object */ }
}
```

**Used in**: `app/dashboard/doctors/page.tsx`  
**Function**: `doctorsAPI.approveDoctorRegistration(id, status)`

---

#### Update Doctor
```
PATCH /user/doctor/{doctorId}

Headers: Authorization: Bearer {accessToken}

Request:
{
  "fullName": "Dr. Ahmad Updated",
  "phone": "0178965423",
  // ... other updateable fields
}

Response:
{
  "success": true,
  "message": "Doctor updated",
  "data": { /* updated doctor object */ }
}
```

**Used in**: Doctor editing  
**Function**: `doctorsAPI.updateDoctor(id, data)`

---

#### Delete Doctor
```
DELETE /user/doctor/{doctorId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Doctor deleted"
}
```

**Used in**: Doctor list  
**Function**: `doctorsAPI.deleteDoctor(id)`

---

### 4. Patient Endpoints

#### Get All Patients
```
GET /user/role/patient?page=1&limit=10&search=&status=

Headers: Authorization: Bearer {accessToken}

Query Parameters:
- page (default: 1)
- limit (default: 10)
- search (optional: search by name)
- status (optional: active|block)

Response:
{
  "success": true,
  "message": "Users fetched for role: patient",
  "data": [
    {
      "_id": "69321234...",
      "fullName": "Eleanor Pena",
      "email": "patient@example.com",
      "phone": "0178965423",
      "avatar": { "url": "https://..." },
      "status": "active",
      "appointmentCount": 2,
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 500
  }
}
```

**Used in**: `app/dashboard/patients/page.tsx`  
**Function**: `patientsAPI.getPatients(page, limit, search, status)`

---

#### Get Patient Details
```
GET /user/{patientId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "User details fetched",
  "data": { /* full patient object */ }
}
```

**Used in**: Patient detail view  
**Function**: `patientsAPI.getPatientById(id)`

---

#### Update Patient Status
```
PATCH /user/patient/{patientId}

Headers: Authorization: Bearer {accessToken}

Request:
{
  "status": "active" | "block"
}

Response:
{
  "success": true,
  "message": "Patient updated",
  "data": { /* updated patient object */ }
}
```

**Used in**: `app/dashboard/patients/page.tsx`  
**Function**: `patientsAPI.updatePatient(id, data)`

---

#### Delete Patient
```
DELETE /user/patient/{patientId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Patient deleted"
}
```

**Used in**: Patient list  
**Function**: `patientsAPI.deletePatient(id)`

---

### 5. Appointment Endpoints

#### Get All Appointments
```
GET /appointment?page=1&limit=10&search=&status=

Headers: Authorization: Bearer {accessToken}

Query Parameters:
- page (default: 1)
- limit (default: 10)
- search (optional: search by name)
- status (optional: pending|appoint|reschedule|cancelled)

Response:
{
  "success": true,
  "message": "Appointments fetched",
  "data": [
    {
      "_id": "6949ebaae952...",
      "date": "2025-11-28",
      "time": "10:30am",
      "patientName": "Eleanor Pena",
      "doctorName": "Dr. Nafisa Qureshi",
      "status": "appoint",
      "fees": {
        "amount": 20,
        "currency": "DZD"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 800
  }
}
```

**Used in**: `app/dashboard/appointments/page.tsx`  
**Function**: `appointmentsAPI.getAppointments(page, limit, search, status)`

---

#### Get Appointment Details
```
GET /appointment/{appointmentId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Appointment fetched",
  "data": { /* full appointment object */ }
}
```

**Used in**: Appointment detail view  
**Function**: `appointmentsAPI.getAppointmentById(id)`

---

#### Update Appointment
```
PATCH /appointment/{appointmentId}

Headers: Authorization: Bearer {accessToken}

Request:
{
  "date": "2025-11-29",
  "time": "11:00am",
  "status": "appoint"
}

Response:
{
  "success": true,
  "message": "Appointment updated",
  "data": { /* updated appointment */ }
}
```

**Used in**: Appointment editing  
**Function**: `appointmentsAPI.updateAppointment(id, data)`

---

#### Cancel Appointment
```
PATCH /appointment/{appointmentId}/cancel

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Appointment cancelled",
  "data": { /* updated appointment */ }
}
```

**Used in**: `app/dashboard/appointments/page.tsx`  
**Function**: `appointmentsAPI.cancelAppointment(id)`

---

### 6. Category Endpoints

#### Get All Categories
```
GET /category?page=1&limit=10&search=

Headers: Authorization: Bearer {accessToken}

Query Parameters:
- page (default: 1)
- limit (default: 10)
- search (optional: search by name)

Response:
{
  "success": true,
  "message": "Categories fetched",
  "data": [
    {
      "_id": "6949ebaae952...",
      "name": "Pediatrics",
      "icon": "https://res.cloudinary.com/.../icon.png",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Used in**: `app/dashboard/categories/page.tsx`  
**Function**: `categoriesAPI.getCategories(page, limit, search)`

---

#### Create Category
```
POST /category

Headers: Authorization: Bearer {accessToken}

Request:
{
  "name": "Cardiology",
  "icon": "https://example.com/icon.png"
}

Response:
{
  "success": true,
  "message": "Category created",
  "data": { /* created category object */ }
}
```

**Used in**: `app/dashboard/categories/page.tsx`  
**Function**: `categoriesAPI.createCategory(data)`

---

#### Get Category Details
```
GET /category/{categoryId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Category fetched",
  "data": { /* full category object */ }
}
```

**Used in**: Category detail view  
**Function**: `categoriesAPI.getCategoryById(id)`

---

#### Update Category
```
PATCH /category/{categoryId}

Headers: Authorization: Bearer {accessToken}

Request:
{
  "name": "Updated Cardiology",
  "isActive": true
}

Response:
{
  "success": true,
  "message": "Category updated",
  "data": { /* updated category */ }
}
```

**Used in**: `app/dashboard/categories/page.tsx`  
**Function**: `categoriesAPI.updateCategory(id, data)`

---

#### Delete Category
```
DELETE /category/{categoryId}

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Category deleted"
}
```

**Used in**: `app/dashboard/categories/page.tsx`  
**Function**: `categoriesAPI.deleteCategory(id)`

---

### 7. Earnings Endpoints

#### Get Earnings Overview
```
GET /earnings/overview

Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Earnings overview fetched",
  "data": {
    "totalEarnings": 1972.00,
    "earningsChange": 36,
    "totalAppointments": 500,
    "appointmentChange": -14,
    "avgPerDoctor": 200.00,
    "avgChange": -14
  }
}
```

**Used in**: `app/dashboard/earnings/page.tsx`  
**Function**: `earningsAPI.getEarningsOverview()`

---

#### Get Doctor Earnings
```
GET /earnings/doctors?page=1&limit=10

Headers: Authorization: Bearer {accessToken}

Query Parameters:
- page (default: 1)
- limit (default: 10)

Response:
{
  "success": true,
  "message": "Doctor earnings fetched",
  "data": [
    {
      "_id": "693103ace6c5c3f0299f6dcb",
      "fullName": "Dr. Anika Rahman",
      "email": "doctor@example.com",
      "specialty": "Paediatrics",
      "avatar": { "url": "https://..." },
      "completedAppointments": 10,
      "totalEarnings": 951.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120
  }
}
```

**Used in**: `app/dashboard/earnings/page.tsx`  
**Function**: `earningsAPI.getDoctorEarnings(page, limit)`

---

## Error Handling

All errors are automatically handled and displayed as toast notifications:

```typescript
// Example error response
{
  "success": false,
  "message": "Unauthorized: Invalid token",
  "error": { /* error details */ }
}

// Automatically caught and shown:
toast.error("Unauthorized: Invalid token")
```

---

## Status Codes

| Code | Meaning | Handling |
|------|---------|----------|
| 200 | Success | Display data, show success toast |
| 201 | Created | Show success message |
| 400 | Bad Request | Show error message |
| 401 | Unauthorized | Refresh token, retry, or logout |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show server error message |

---

## Rate Limiting

No explicit rate limiting implemented. Configure on backend as needed.

---

## Pagination

All list endpoints support pagination:

```typescript
// Request
GET /endpoint?page=1&limit=10

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## Search & Filtering

Endpoints supporting search:
- Doctors: `search`, `status`
- Patients: `search`, `status`
- Appointments: `search`, `status`
- Categories: `search`

---

## Authentication Headers

All authenticated endpoints require:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

These are automatically added by the Axios interceptor.

---

## Quick Integration Examples

### Get Data with Query
```typescript
const { data } = useQuery({
  queryKey: ["doctors"],
  queryFn: () => doctorsAPI.getDoctors(1, 10),
});
```

### Update Data
```typescript
const mutation = useMutation({
  mutationFn: () => doctorsAPI.approveDoctor(id, "approved"),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["doctors"] });
    toast.success("Doctor approved");
  },
});
```

### Delete Data
```typescript
const { mutate } = useMutation({
  mutationFn: (id) => doctorsAPI.deleteDoctor(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["doctors"] });
    toast.success("Deleted successfully");
  },
});

mutate(doctorId);
```

---

## Environment Configuration

```env
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3001/api
```

Change the URL to your backend API endpoint.

---

## Additional Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are MongoDB ObjectIds
3. Currencies are ISO 4217 codes (USD, DZD, etc.)
4. Status values are lowercase
5. Phone numbers include country code

---

**This API reference covers all 26 integrated endpoints. Refer to lib/api.ts for implementation details.**
