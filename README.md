# Vendor Management System - Backend Documentation

## 1. Project Overview

### Project Name
Vendor Management System

### Brief Description
A comprehensive backend system for managing a hierarchical vendor structure with vehicles and drivers for a cab/transportation company. This system enables super vendors to manage sub-vendors at multiple levels (regional, city, local), handle vehicle and driver onboarding, document verification workflows, and delegated permission management.

### Key Features/Modules
- Multi-level vendor hierarchy management
- Role-based access control and permission delegation
- Vehicle onboarding and document verification
- Driver onboarding and license verification
- Document expiration tracking and automated notifications
- Super vendor dashboard for ride oversight
- Secure authentication with JWT

### Tech Stack
- **Language & Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Cloud Storage**: Cloudinary (for document uploads)
- **Email Service**: Nodemailer with Gmail SMTP
- **Scheduled Tasks**: Node-cron for document expiry checks
- **Middleware**: Multer for file handling

## 2. Architecture Diagrams

### System Architecture
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526447/image-5_tmqvjl.png)


### Vendor Hierarchy

![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526533/image-3_cnuqtq.png)

### Database Schema

![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526584/image_mqrvoo.png)

### Authentication and Authorization Diagram
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526633/image-1_o7ahue.png)

### Vehicle - Driver Assignment Flow
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526677/image-6_wmrwrv.png)

## 3. System Components/Modules

### Authentication Module
- **Responsibilities**: User login, logout, token generation
- **APIs exposed**: `/api/v1/vendor/login`, `/api/v1/vendor/logout`
- **Services it depends on**: JWT
- **Main files**: `auth.controller.js`, `auth.middleware.js`

### Vendor Management Module
- **Responsibilities**: Creating vendors, managing vendor hierarchy
- **APIs exposed**: `/api/v1/vendor/create-vendor`, `/api/v1/root/super-vendor`
- **Services it depends on**: Vendor Hierarchy Service
- **Main files**: `vendor.controller.js`, `root.controller.js`, `Vendor.model.js`

### Permission Delegation Module
- **Responsibilities**: Delegating and revoking permissions between vendors
- **APIs exposed**: `/api/v1/delegation/delegate`, `/api/v1/delegation/revoke`
- **Services it depends on**: Delegation Service
- **Main files**: `delegation.controller.js`, `accessControl.middleware.js`

### Vehicle Management Module
- **Responsibilities**: Creating and managing vehicles, document uploads
- **APIs exposed**: `/api/v1/ride/vehicles`
- **Services it depends on**: Cloudinary
- **Main files**: `vehicle.controller.js`, `Vehicle.model.js`

### Driver Management Module
- **Responsibilities**: Creating drivers, managing licenses, assigning vehicles
- **APIs exposed**: `/api/v1/ride/drivers`, `/api/v1/ride/assign-driver`
- **Services it depends on**: Cloudinary
- **Main files**: `drivers.controller.js`, `Driver.model.js`

### Super Vendor Dashboard Module
- **Responsibilities**: Providing oversight, overriding operations, forcing verifications
- **APIs exposed**: `/api/v1/super-vendor/dashboard`, `/api/v1/super-vendor/override/*`
- **Services it depends on**: None
- **Main files**: `dashboard.controller.js`

### Document Validation Module
- **Responsibilities**: Checking document expiry, sending notifications
- **APIs exposed**: None (internal cron job)
- **Services it depends on**: Nodemailer
- **Main files**: `documentValidation.js`

## 4. API Documentation

### Root Routes

#### `POST /api/v1/root/super-vendor`
- **Description**: Creates the first super vendor (restricted by environment variable)
- **Request Body**:
```json
{
  "name": "Super Admin",
  "email": "super@example.com",
  "password": "secure-password123"
}
```
- **Response**:
```json
{
  "success": true,
  "superVendor": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Super Admin",
    "email": "super@example.com",
    "role": "SUPER"
  },
  "message": "successfully created super vendor"
}
```
- **Status Codes**: 201, 400, 403, 500

### Vendor Routes

#### `POST /api/v1/vendor/login`
- **Description**: Authenticates a vendor and returns a JWT token
- **Request Body**:
```json
{
  "email": "super@example.com",
  "password": "secure-password123"
}
```
- **Response**:
```json
{
  "success": true,
  "vendor": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Super Admin",
    "email": "super@example.com",
    "role": "SUPER"
  },
  "message": "Login successfully as SUPER"
}
```
- **Status Codes**: 200, 400, 401, 500

#### `POST /api/v1/vendor/create-vendor`
- **Description**: Creates a sub-vendor under the authenticated vendor
- **Authorization**: Required, with `vendor:create` permission
- **Request Body**:
```json
{
  "name": "North Region Manager",
  "email": "north@example.com",
  "password": "region-pass123",
  "role": "REGIONAL"
}
```
- **Response**:
```json
{
  "status": "success",
  "vendor": {
    "email": "north@example.com",
    "name": "North Region Manager",
    "role": "REGIONAL"
  },
  "message": "Successfully creating vendor"
}
```
- **Status Codes**: 201, 400, 401, 403, 500

#### `POST /api/v1/vendor/logout`
- **Description**: Logs out a vendor by clearing the JWT cookie
- **Authorization**: Required
- **Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
- **Status Codes**: 200, 401, 404, 500

### Delegation Routes

#### `POST /api/v1/delegation/delegate`
- **Description**: Delegates permissions from parent vendor to sub-vendor
- **Authorization**: Required, with `delegation:manage` permission
- **Request Body**:
```json
{
  "subVendorId": "60d21b4667d0d8992e610c86",
  "permissions": ["vehicle:create", "driver:create"]
}
```
- **Response**:
```json
{
  "success": true,
  "permissions": ["vehicle:create", "driver:create"],
  "message": "delegated permissions successfully"
}
```
- **Status Codes**: 200, 400, 401, 403, 500

#### `POST /api/v1/delegation/revoke`
- **Description**: Revokes permissions from a sub-vendor
- **Authorization**: Required, with `delegation:manage` permission
- **Request Body**:
```json
{
  "subVendorId": "60d21b4667d0d8992e610c86",
  "permissions": ["vehicle:create"]
}
```
- **Response**:
```json
{
  "success": true,
  "revokedPermissions": ["vehicle:create"],
  "message": "revoked permissions successfully"
}
```
- **Status Codes**: 200, 400, 401, 403, 500

### Ride Routes

#### `POST /api/v1/ride/vehicles`
- **Description**: Creates a new vehicle with document uploads
- **Authorization**: Required, with `ride:manage` permission
- **Request Body**: multipart/form-data with:
  - `registrationNumber`: "KA01MG1234"
  - `model`: "Toyota Innova"
  - `seatingCapacity`: 7
  - `fuelType`: "DIESEL"
  - `rcNumber`: "RC123456789"
  - `rcExpiry`: "2026-04-10"
  - `pollutionNumber`: "PUCC987654"
  - `pollutionExpiry`: "2025-12-31"
  - `rc`: [file upload]
  - `pollution`: [file upload]
  - `permit`: [file upload] (optional)
- **Response**:
```json
{
  "success": true,
  "vehicle": {
    "registrationNumber": "KA01MG1234",
    "model": "Toyota Innova",
    "seatingCapacity": 7,
    "fuelType": "DIESEL",
    "rc": "https://cloudinary.com/...",
    "rcNumber": "RC123456789",
    "rcExpiry": "2026-04-10",
    "pollution": "https://cloudinary.com/...",
    "pollutionNumber": "PUCC987654",
    "pollutionExpiry": "2025-12-31"
  },
  "message": "Vehicle created successfully"
}
```
- **Status Codes**: 201, 400, 401, 403, 500

#### `POST /api/v1/ride/drivers`
- **Description**: Creates a new driver with document uploads
- **Authorization**: Required, with `ride:manage` permission
- **Request Body**: multipart/form-data with:
  - `fullName`: "John Doe"
  - `contactNumber`: "+919876543210"
  - `email`: "john.doe@example.com"
  - `licenseNumber`: "DL987654321"
  - `licenseExpiry`: "2026-05-15"
  - `aadhaarNumber`: "1234-5678-9012"
  - `aadhaarExpiry`: "2030-01-01"
  - `panNumber`: "ABCDE1234F"
  - `panExpiry`: "2035-01-01"
  - `aadhaar`: [file upload]
  - `pan`: [file upload]
  - `medical`: [file upload] (optional)
- **Response**:
```json
{
  "success": true,
  "driver": {
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "email": "john.doe@example.com",
    "licenseNumber": "DL987654321",
    "licenseExpiry": "2026-05-15"
  },
  "message": "Driver created successfully"
}
```
- **Status Codes**: 201, 400, 401, 403, 500

#### `POST /api/v1/ride/assign-driver`
- **Description**: Assigns a driver to a vehicle
- **Authorization**: Required, with `ride:manage` permission
- **Request Body**:
```json
{
  "driverId": "60d21b4667d0d8992e610c87",
  "vehicleId": "60d21b4667d0d8992e610c88"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Assignment successful",
  "driver": "60d21b4667d0d8992e610c88",
  "vehicle": "60d21b4667d0d8992e610c87"
}
```
- **Status Codes**: 200, 400, 401, 403, 404, 500

### Super Vendor Routes

#### `GET /api/v1/super-vendor/dashboard`
- **Description**: Gets dashboard data for super vendor
- **Authorization**: Required, with `super:override` permission
- **Response**:
```json
{
  "success": true,
  "message": "Fetched dashboard successfully",
  "dashboard": {
    "superVendor": {...},
    "allVendors": [...],
    "fleetStatus": {
      "activeVehiclesCount": 25,
      "inactiveVehiclesCount": 5,
      "pendingVerifications": 3
    },
    "driverStatus": {
      "availableDriversCount": 18
    }
  }
}
```
- **Status Codes**: 200, 400, 401, 403, 500

#### `PATCH /api/v1/super-vendor/override/vehicle/:vehicleId`
- **Description**: Overrides vehicle operation status
- **Authorization**: Required, with `super:override` permission
- **Response**:
```json
{
  "success": true,
  "message": "Vehicle operation overridden by Super Vendor"
}
```
- **Status Codes**: 200, 401, 403, 404, 500

#### `PATCH /api/v1/super-vendor/override/vehicle-documents/:vehicleId`
- **Description**: Force-verifies pending vehicle documents
- **Authorization**: Required, with `super:override` permission
- **Response**:
```json
{
  "success": true,
  "message": "Documents verified successfully!",
  "data": {
    "verifiedDocuments": ["RC", "POLLUTION"]
  }
}
```
- **Status Codes**: 200, 400, 401, 403, 404, 500

#### `PATCH /api/v1/super-vendor/override/driver-documents/:driverId`
- **Description**: Force-verifies driver license
- **Authorization**: Required, with `super:override` permission
- **Response**:
```json
{
  "success": true,
  "message": "License verified successfully!"
}
```
- **Status Codes**: 200, 400, 401, 403, 404, 500

## 5. Database Design

### Entity Relationship Diagram

![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1744526719/image-4_g1utg0.png)

### Main Tables

#### Vendor
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String, required
  - `email`: String, required, unique
  - `password`: String, required (hashed)
  - `role`: String, enum ['SUPER', 'REGIONAL', 'CITY', 'LOCAL']
  - `parent`: ObjectId, ref: 'Vendor'
  - `permissions`: [String]
  - `delegatedPermissions`: [{permission: String, delegatedBy: ObjectId}]
- **Relationships**:
  - Self-referential relationship (parent-child)
  - One-to-many with Vehicle
  - One-to-many with Driver

#### Vehicle
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `registrationNumber`: String, required, unique
  - `model`: String, required
  - `seatingCapacity`: Number, required
  - `fuelType`: String, enum ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG']
  - `vendor`: ObjectId, ref: 'Vendor', required
  - `documents`: Array of document objects
    - `type`: String, enum ['RC', 'PERMIT', 'POLLUTION']
    - `documentNumber`: String
    - `fileUrl`: String
    - `expiryDate`: Date
    - `verified`: Boolean
    - `verificationDate`: Date
  - `status`: String, enum ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE']
  - `assignedDriver`: ObjectId, ref: 'Driver'
- **Relationships**:
  - Many-to-one with Vendor
  - One-to-one with Driver

#### Driver
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `fullName`: String, required
  - `contactNumber`: String, required
  - `email`: String, required
  - `license`: Object
    - `licenseNumber`: String, required, unique
    - `expiryDate`: Date, required
    - `verified`: Boolean
  - `vendor`: ObjectId, ref: 'Vendor', required
  - `assignedVehicle`: ObjectId, ref: 'Vehicle'
  - `status`: String, enum ['AVAILABLE', 'ON_TRIP', 'INACTIVE']
  - `documents`: Array of document objects
    - `type`: String, enum ['AADHAAR', 'PAN', 'MEDICAL_CERTIFICATE']
    - `documentNumber`: String, required
    - `fileUrl`: String, required
    - `expiryDate`: Date, required
- **Relationships**:
  - Many-to-one with Vendor
  - One-to-one with Vehicle

## 6. Authentication & Authorization

### Authentication Method
- **JWT (JSON Web Tokens)** used for stateless authentication
- Tokens are stored in HTTP-only cookies for security
- Token expiry set to 15 days (configurable)

### Authorization Model
- **Role-based access control** with four vendor roles:
  - SUPER: Has full system access ('*' permission)
  - REGIONAL: Regional-level management
  - CITY: City-level management
  - LOCAL: Local operations management

### Permission System
- **Default permissions** set based on vendor role
- **Permission delegation** allowed from higher-level to lower-level vendors
- Permissions format: `resource:action` (e.g., `vehicle:create`, `driver:read`)

### Access Control Flow
1. JWT authentication middleware validates token and attaches vendor to request
2. Permission middleware checks if vendor has required permission
3. Permission can be obtained through:
   - Direct permission assignment
   - Wildcard permission ('*')
   - Delegated permission from parent vendor

## 7. Error Handling

### Error Structure
The system uses a centralized error handling approach with a custom `ApiError` class and middleware.

```javascript
// Error response structure
{
  "status": "error",
  "message": "Detailed error message"
}
```

### Error Types
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

### MongoDB-Specific Errors
- **Cast Errors**: Invalid ID format (400)
- **Duplicate Key Errors**: Unique constraint violation (400)

## 8. Logging & Monitoring

### Logging
- Console logging is implemented for development
- Server start/stop logs
- Database connection logs
- Document validation logs
- Cloudinary upload logs

### Automated Tasks Monitoring
- Document expiry checking runs daily at midnight
- Email notifications sent to drivers with expired documents

## 9. Deployment & DevOps

### Local Development Setup
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see Environment Variables section)
4. Start the server with `npm start`

### Environment Setup
- Development, testing, and production environments configurable via environment variables
- MongoDB connection string configurable for different environments

### Required Services
- MongoDB database
- Cloudinary account for document storage
- SMTP service (Gmail) for notifications

## 10. Third-Party Integrations

### Cloudinary
- Used for storing vehicle and driver documents
- Integration via the Cloudinary SDK
- Document uploads handled through a utility function

### Email Service
- Nodemailer with Gmail SMTP for sending notifications
- Used for alerting drivers about document expiry

## 11. Security

### Authentication Security
- Passwords hashed using bcrypt
- JWT stored in HTTP-only, secure cookies with 'Same-Site: None' attribute
- Token validation on every protected request

### Authorization Security
- Middleware-based permission checking
- Role-based access control
- Hierarchical permission validation

### Input Validation
- Request body validation for all endpoints
- File upload validation and filtering

### Document Security
- Documents stored securely in Cloudinary
- Document URLs accessible only to authorized vendors

## 12. Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB
- Cloudinary account
- Gmail account with app password for SMTP

### Environment Variables
Create a `.env` file with:

```
# Server
PORT=8000


# Database
MONGODB_URL=Your Mongo DB URL

# Authentication
ACCESSTOKEN_KEY=your-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Super Vendor Creation
ALLOW_ROOTING=true
```

### Installation Steps
1. Clone the repository
```bash
git clone [https://github.com/yourusername/VISCO-MOVEINSYNC.git](https://github.com/Nikhilagrawalcoder/VISCO-MOVEINSYNC)
cd VISCO-MOVEINSYNC
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

## 13. Testing with Postman

### Postman Setup
1. Create a new Postman collection
2. Set up environment variables:
   - `BASE_URL`: Your API base URL (e.g., `http://localhost:8000/api/v1`)
   - `TOKEN`: Will be automatically populated from cookies

### Testing Workflow

#### 1. Create Super Vendor

First, set `ALLOW_ROOTING=true` in your `.env` file, then:

1. **Request**:
   - Method: POST
   - URL: `{{BASE_URL}}/root/super-vendor`
   - Body (JSON):
   ```json
   {
     "name": "Super Admin",
     "email": "super@example.com",
     "password": "secure-password123"
   }
   ```

2. **Expected Response**:
   - Status: 201 Created
   - Body:
   ```json
   {
     "success": true,
     "superVendor": {
       "_id": "...",
       "name": "Super Admin",
       "email": "super@example.com",
       "role": "SUPER"
     },
     "message": "successfully created super vendor"
   }
   ```

#### 2. Login as Super Vendor

1. **Request**:
   - Method: POST
   - URL: `{{BASE_URL}}/vendor/login`
   - Body (JSON):
   ```json
   {
     "email": "super@example.com",
     "password": "secure-password123"
   }
   ```

2. **Expected Response**:
   - Status: 200 OK
   - Body:
   ```json
   {
     "success": true,
     "vendor": {
       "_id": "...",
       "name": "Super Admin",
       "email": "super@example.com",
       "role": "SUPER"
     },
     "message": "Login successfully as SUPER"
   }
   ```
   - Cookie: `accessToken` will be set automatically

#### 3. Create Regional Vendor

1. **Request**:
   - Method: POST
   - URL: `{{BASE_URL}}/vendor/create-vendor`
   - Body (JSON):
   ```json
   {
     "name": "North Region Manager",
     "email": "north@example.com",
     "password": "region-pass123",
     "role": "REGIONAL"
   }
   ```

2. **Expected Response**:
   - Status: 201 Created
   - Body:
   ```json
   {
     "status": "success",
     "vendor": {
       "email": "north@example.com",
       "name": "North Region Manager",
       "role": "REGIONAL"
     },
     "message": "Successfully creating vendor"
   }
   ```

#### 4. Create Vehicle

1. **Request**:
   - Method: POST
   - URL: `{{BASE_URL}}/ride/vehicles`
   - Body (Form-data):
     - Key: `registrationNumber`, Value: "KA01MG1234"
     - Key: `model`, Value: "Toyota Innova"
     - Key: `seatingCapacity`, Value: 7
     - Key: `fuelType`, Value: "DIESEL"
     - Key: `rcNumber`, Value: "RC123456789"
     - Key: `rcExpiry`, Value: "2026-04-10"
     - Key: `pollutionNumber`, Value: "PUCC987654"
     - Key: `pollutionExpiry`, Value: "2025-12-31"
     - Key: `rc`, Value: [upload RC document file]
     - Key: `pollution`, Value: [upload pollution certificate file]

2. **Expected Response**:
   - Status: 201 Created
   - Body:
   ```json
   {
     "success": true,
     "vehicle": {
       "registrationNumber": "KA01MG1234",
       "model": "Toyota Innova",
       "seatingCapacity": 7,
       "fuelType": "DIESEL",
       "rc": "https://cloudinary.com/...",
       "rcNumber": "RC123456789",
       "rcExpiry": "2026-04-10",
       "pollution": "https://cloudinary.com/...",
       "pollutionNumber": "PUCC987654",
       "pollutionExpiry": "2025-12-31"
     },
     "message": "Vehicle created successfully"
   }
   ```

#### 5. Get Super Vendor Dashboard

1. **Request**:
   - Method: GET
   - URL: `{{BASE_URL}}/super-vendor/dashboard`

2. **Expected Response**:
   - Status: 200 OK
   - Body:
   ```json
   {
     "success": true,
     "message": "Fetched dashboard successfully",
     "dashboard": {
       "superVendor": {...},
       "allVendors": [...],
       "fleetStatus": {
         "activeVehiclesCount": 1,
         "inactiveVehiclesCount": 0,
         "pendingVerifications": 1
       },
       "driverStatus": {
         "availableDriversCount": 0
       }
     }
   }
   ```

## 14. Appendix

### Future Considerations

1. **Document Upload Size Limits**:
   - Configure Multer properly for production to handle file size limits
   - Consider adding file type validation for security

2. **Database Indexing**:
   - Key fields are indexed for performance
   - Consider additional indexes based on query patterns in production

3. **Security Enhancements**:
   - For production, implement rate limiting
   - Add CSRF protection
   - Consider IP-based access restrictions for admin endpoints

4. **Scalability**:
   - The system supports N-level vendor hierarchy for scalability
   - Consider adding caching for frequently accessed data
   - Implement database connection pooling for high load

### Glossary

- **Super Vendor**: Top-level vendor with complete system access
- **Regional Vendor**: Second-level vendor managing a geographical region
- **City Vendor**: Third-level vendor managing a city
- **Local Vendor**: Lowest-level vendor handling local operations
- **Document Verification**: Process of validating uploaded documents
- **Permission Delegation**: Granting specific permissions to sub-vendors
