-- Script SQL para configurar automaticamente o banco Conecta Autismo
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS conecta_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    profile_photo TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de configurações
CREATE TABLE IF NOT EXISTS conecta_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    speech_rate DECIMAL(3,2) DEFAULT 1.0,
    speech_volume DECIMAL(3,2) DEFAULT 1.0,
    high_contrast BOOLEAN DEFAULT false,
    large_icons BOOLEAN DEFAULT false,
    sound_feedback BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Criar tabela de ícones personalizados
CREATE TABLE IF NOT EXISTS conecta_icons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    icon_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de atividades/logs
CREATE TABLE IF NOT EXISTS conecta_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_conecta_settings_user_id ON conecta_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conecta_icons_user_id ON conecta_icons(user_id);
CREATE INDEX IF NOT EXISTS idx_conecta_activities_user_id ON conecta_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_conecta_activities_created_at ON conecta_activities(created_at);

-- 6. Inserir usuário administrador padrão
INSERT INTO conecta_users (username, password, name, email) 
VALUES ('admin', 'admin123', 'Administrador', 'admin@conecta.com')
ON CONFLICT (username) DO NOTHING;

-- 7. Configurar Row Level Security (RLS)
ALTER TABLE conecta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conecta_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conecta_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE conecta_activities ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de segurança

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own data" ON conecta_users;
DROP POLICY IF EXISTS "Users can update own data" ON conecta_users;
DROP POLICY IF EXISTS "Users can manage own settings" ON conecta_settings;
DROP POLICY IF EXISTS "Users can manage own icons" ON conecta_icons;
DROP POLICY IF EXISTS "Users can view own activities" ON conecta_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON conecta_activities;

-- Política para usuários: podem ver e editar apenas seus próprios dados
CREATE POLICY "Users can view own data" ON conecta_users
    FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'anon');

CREATE POLICY "Users can update own data" ON conecta_users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para configurações: usuários podem gerenciar suas próprias configurações
CREATE POLICY "Users can manage own settings" ON conecta_settings
    FOR ALL USING (auth.uid()::text = user_id::text OR auth.role() = 'anon');

-- Política para ícones: usuários podem gerenciar seus próprios ícones
CREATE POLICY "Users can manage own icons" ON conecta_icons
    FOR ALL USING (auth.uid()::text = user_id::text OR auth.role() = 'anon');

-- Política para atividades: usuários podem ver suas próprias atividades
CREATE POLICY "Users can view own activities" ON conecta_activities
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'anon');

CREATE POLICY "Users can insert own activities" ON conecta_activities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.role() = 'anon');

-- 9. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Criar triggers para atualizar timestamps automaticamente
DROP TRIGGER IF EXISTS update_conecta_users_updated_at ON conecta_users;
DROP TRIGGER IF EXISTS update_conecta_settings_updated_at ON conecta_settings;
DROP TRIGGER IF EXISTS update_conecta_icons_updated_at ON conecta_icons;

CREATE TRIGGER update_conecta_users_updated_at 
    BEFORE UPDATE ON conecta_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conecta_settings_updated_at 
    BEFORE UPDATE ON conecta_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conecta_icons_updated_at 
    BEFORE UPDATE ON conecta_icons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Banco de dados Conecta Autismo configurado com sucesso!';
    RAISE NOTICE '👤 Usuário padrão: admin / admin123';
    RAISE NOTICE '🔒 Row Level Security ativado';
    RAISE NOTICE '📊 Tabelas criadas: conecta_users, conecta_settings, conecta_icons, conecta_activities';
END $$;