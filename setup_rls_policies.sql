-- RLS Policies for Freight Forwarder Management System
-- Run this in Supabase SQL Editor to secure your database

-- Enable Row Level Security on all tables
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE origin_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON vehicle_types;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON transport_types;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON origin_locations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON destination_locations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON partners;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON prices;

-- Vehicle Types Policies
CREATE POLICY "Enable all for authenticated users" ON vehicle_types
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Transport Types Policies
CREATE POLICY "Enable all for authenticated users" ON transport_types
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Origin Locations Policies
CREATE POLICY "Enable all for authenticated users" ON origin_locations
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Destination Locations Policies
CREATE POLICY "Enable all for authenticated users" ON destination_locations
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Partners Policies
CREATE POLICY "Enable all for authenticated users" ON partners
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Customers Policies
CREATE POLICY "Enable all for authenticated users" ON customers
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Projects Policies
CREATE POLICY "Enable all for authenticated users" ON projects
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Prices Policies
CREATE POLICY "Enable all for authenticated users" ON prices
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
