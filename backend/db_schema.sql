-- Table: viagens
CREATE TABLE IF NOT EXISTS viagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_inicio TIMESTAMPTZ DEFAULT NOW(),
    data_fim TIMESTAMPTZ,
    status TEXT DEFAULT 'em_andamento' -- 'em_andamento', 'concluida'
);

-- Table: localizacoes
CREATE TABLE IF NOT EXISTS localizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id UUID REFERENCES viagens(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;

-- Policies for viagens
CREATE POLICY "Users can manage their own trips" ON viagens
    FOR ALL USING (auth.uid() = user_id);

-- Policies for localizacoes (linked to user's trips)
CREATE POLICY "Users can manage locations for their own trips" ON localizacoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM viagens 
            WHERE viagens.id = localizacoes.viagem_id 
            AND viagens.user_id = auth.uid()
        )
    );

-- Table: user_settings
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    google_maps_key TEXT,
    map_provider TEXT DEFAULT 'google', -- 'google' ou 'leaflet'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

