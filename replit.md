# Yarres Pro - Freight Forwarder Management System

## Overview
**Yarres Pro** is a comprehensive freight forwarding management system built with React and Supabase. This application allows users to manage vehicle types, transport types, locations, partners, offers (teklifler), and a price database for freight forwarding operations.

**Developer:** Baris Pelin

**Current State:** Configured for Replit environment with Create React App running on port 5000. Features modern sidebar navigation with collapsible settings menu.

## Recent Changes
- **November 8, 2025**: Major UI Redesign + Complete Feature Set
  
  - **Branding Update:**
    - Platform renamed to **Yarres Pro**
    - Developer credit: **Baris Pelin** (in code comments only, not displayed on UI)

  - **Modern Sidebar Navigation:**
    - Left sidebar with hierarchical menu structure
    - Dashboard - Main overview page
    - Teklifler (Offers) - Renamed from Projects
    - Ayarlar (Settings) - Collapsible submenu containing:
      - Temel Tanımlar (Master Data)
      - Partnerler (Partners)
      - Müşteriler (Customers)
      - Fiyat Veritabanı (Price Database)
    - User email display and logout button in sidebar footer
    - Auto-expand settings menu when accessing any submenu item
    - Clean, modern design with hover states and active indicators

  - **Teklifler (Offers) Module:**
    - Renamed from "Projeler" to "Teklifler" throughout the application
    - **Advanced Filtering System:**
      - Search by title or ID
      - Filter by status (Yeni, Fiyatlandırma, Kazanıldı, Kaybedildi)
      - Filter by origin location
      - Filter by destination location
      - Filter by customer
      - Real-time filtered count display
      - One-click filter reset
    - All form labels updated to use "Teklif" terminology

  - **Interactive Dashboard:**
    - **Clickable Status Cards:** Teklif durum kartları now clickable
    - Clicking any status card (Yeni, Fiyatlandırma, Kazanıldı, Kaybedildi) navigates to Teklifler page with pre-filtered results
    - Seamless integration between Dashboard overview and detailed Teklifler view
    - Hover effects on status cards for better UX

  - **Authentication System:** Added Supabase Authentication for production security
    - **Login/Signup Page:** Beautiful blue gradient login form with email/password authentication
    - **Protected Routes:** Application requires login - no access without authentication
    - **Session Management:** Automatic session tracking and persistence
    - **Logout Functionality:** Logout button in navigation with user email display
    - **Loading States:** Proper loading indicators during authentication check
    - **RLS Policies:** Database security configured for authenticated users (see `setup_rls_policies.sql`)
    - **Email Confirmation:** New users must verify email before login (Supabase default setting)
  
  - **Projects Module Enhancements:**
    - **Customer Integration:** Projects now linked to customer database
      - Added `customer_id` field to projects table (UUID, nullable)
      - Customer dropdown in project form (create & edit)
      - Customer information displayed in project summary (name, city, country)
    - **Improved Partner Pricing Workflow:**
      - Changed from auto-save on input to manual "Ekle" (Add) button
      - Price input validation before saving
      - Success confirmation messages
      - Better UX with temporary state management
    - **Winning Partners Feature:**
      - Multiple winning partners can be selected per project
      - Checkbox-based selection in partner price list
      - Winning partners stored in `winning_partners` JSONB array
      - Displayed prominently in project summary with green badge
      - Visual indicators: green text, "Kazanan" badge
    - **Database Updates:**
      - Added `customer_id` column (UUID, references customers table)
      - Added `winning_partners` column (JSONB, default empty array)
      - Empty customer_id correctly handled (null instead of empty string)
  
  - **Customers Module:** Added comprehensive customer management
    - Created `customers` table in Supabase with fields: name, street, street2, zip, country, city, phone, email
    - **681 Customers Imported:** Successfully imported production customer data via SQL
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
4. **Customer Management**: 
   - Manage 681 customer records with filtering, pagination, and CSV import
   - Integration with projects module
5. **Project Management**: 
   - Track freight forwarding projects
   - Link projects to customers
   - Partner pricing with manual "Add" button workflow
   - Select multiple winning partners per project
   - Visual indicators for winning partners
6. **Price Database**: Manage pricing for different routes and transport types

### Database Schema (Supabase)
The application connects to the following Supabase tables:
- `vehicle_types` - Vehicle type definitions
- `transport_types` - Transport type definitions  
- `origin_locations` - Origin location list
- `destination_locations` - Destination location list
- `partners` - Partner company information with routes
- `customers` - **681 customer records** with fields: id (UUID), name, street, street2, zip, country, city, phone, email, created_at
- `projects` - Project tracking with fields: id, project_id, title, details, origin, destination, status, loss_reason, selected_partners (JSONB), request_text, **customer_id (UUID)**, **winning_partners (JSONB)**, created_at
- `prices` - Pricing database with origin, destination, partner, transport/vehicle types, dimensions

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
