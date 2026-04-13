-- Migration: Create saved_places table
CREATE TABLE IF NOT EXISTS saved_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    icon_type TEXT DEFAULT 'MapPin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saved places" 
ON saved_places FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved places" 
ON saved_places FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved places" 
ON saved_places FOR DELETE 
USING (auth.uid() = user_id);
