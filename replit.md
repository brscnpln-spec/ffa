# Freight Forwarder Management System

## Overview
A comprehensive freight forwarding management system built with React and Supabase. This application allows users to manage vehicle types, transport types, locations, partners, projects, and a price database for freight forwarding operations.

**Current State:** Configured for Replit environment with Create React App running on port 5000.

## Recent Changes
- **November 8, 2025**: Major UI and Feature Improvements
  - **Customers Module:** Added comprehensive customer management
    - Created `customers` table in Supabase with fields: name, street, street2, zip, country, city, phone, email
    - **CRUD Operations:** Add, edit, delete customer records with form validation
    - **CSV Bulk Import:** Import customers from CSV with format validation
      - Supported CSV format: id, name, street, street2, zip, country, city, phone, email
      - Email validation and required field checking
      - Partial success support (valid rows added, invalid rows reported)
    - **Pagination:** 50 customers per page with smart page navigation
    - **Advanced Filtering:** Filter by name, country, city, email
    - **Customer List Table:** Displays all customer fields in organized table format
    - Form validation: Required fields (name, street, country, city, email) with email format validation
  
  - **Price Database Enhancements:**
    - **CSV Bulk Import:** Added ability to import prices from CSV files with format validation
      - Supported CSV format: departure_city, arrival_city, transport_type, vehicle_type, company_name, price, weight, created_at, valid_until, cbm, ldm, length, height, width, notes
      - Real-time validation with error reporting for invalid rows
      - Success/failure notifications with detailed error messages
      - Automatic dimension field merging (length x width x height)
    - **Pagination System:** Implemented pagination for price listings
      - 50 records per page
      - Smart page number display with ellipsis for large datasets
      - Previous/Next navigation buttons
      - Page count and record range display
    - **Advanced Filtering:** Added comprehensive filtering capabilities
      - Filter by origin, destination, partner, transport type, vehicle type
      - Price range filtering (min/max)
      - Real-time filter updates
      - Filter reset functionality
      - Filtered record count display
    
  - **Master Data UI Enhancement:**
    - Converted "Temel Tanımlar" (Master Data) from dropdown selection to tab-based navigation
    - Users now stay on the same tab after making changes (add, edit, delete operations)
    - Implemented horizontal tabs for Vehicle Type, Transport Type, Origin Location, and Destination Location
    - Added accessibility features (role="tablist", aria-selected)
    - Improved user experience with visual tab indicators and hover states

- **November 6, 2025**: Initial Replit setup and bug fixes
  - **Setup:**
    - Configured Create React App to run on port 5000
    - Set up environment variables for Supabase credentials
    - Configured host settings to work with Replit's proxy
    - Updated supabaseClient.js to use environment variables
    - Installed all npm dependencies
    - Created workflow configuration for React App
    - Configured deployment settings (autoscale with serve)
    - Verified app is running correctly with Supabase connection
  
  - **Bug Fixes:**
    - Fixed "invalid input syntax for type numeric" error when adding prices with empty numeric fields
    - Fixed "invalid input syntax for type date" error when date field is empty
    - Added form validation for required fields in Price Database
    - Improved all error messages across the app (Master Data, Partners, Projects, Prices)
    - Added success confirmation messages for all CRUD operations
    - Marked required fields with asterisks (*) in Price form
    - Empty optional fields (weight, cbm, ldm, valid_until) now correctly save as NULL in database

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Backend**: Supabase (PostgreSQL database + API)
- **Styling**: Tailwind CSS 3.4.18
- **Icons**: Lucide React
- **Package Manager**: npm

### Project Structure
```
.
├── public/              # Static assets
│   ├── index.html       # HTML template
│   └── ...              # Icons and manifest
├── src/
│   ├── App.js           # Main application component with all business logic
│   ├── App.css          # App-specific styles
│   ├── index.js         # Entry point
│   ├── index.css        # Global styles including Tailwind
│   └── supabaseClient.js # Supabase configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── .env.local           # Environment variables (gitignored)
```

### Key Features
1. **Dashboard**: Overview of projects, pricing trends, and statistics
2. **Master Data Management**: 
   - Vehicle types
   - Transport types
   - Origin locations
   - Destination locations
3. **Partner Management**: Contact and company information
4. **Customer Management**: Manage customer information with filtering, pagination, and CSV import
5. **Project Management**: Track freight forwarding projects
6. **Price Database**: Manage pricing for different routes and transport types

### Database Schema (Supabase)
The application connects to the following Supabase tables:
- `vehicle_types`
- `transport_types`
- `origin_locations`
- `destination_locations`
- `partners`
- `customers` - Customer information (name, street, street2, zip, country, city, phone, email)
- `projects`
- `prices`

### Environment Configuration
The app uses the following environment variables (stored in `.env.local`):
- `PORT=5000` - Development server port
- `HOST=0.0.0.0` - Bind to all interfaces for Replit
- `DANGEROUSLY_DISABLE_HOST_CHECK=true` - Required for Replit's proxy
- `WDS_SOCKET_HOST=0.0.0.0` - WebSocket configuration
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_KEY` - Supabase anonymous key

## Development

### Running the Application
The application runs automatically via the configured workflow:
```bash
npm start
```

This starts the development server on port 5000 at 0.0.0.0.

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

## Deployment Notes
- The app is configured to run on port 5000 for Replit compatibility
- Host checking is disabled to work with Replit's iframe proxy
- Supabase credentials are stored in environment variables for security
