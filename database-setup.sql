-- Script SQL para configurar o banco de dados Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    user_type VARCHAR(20) DEFAULT 'user' CHECK (user_type IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 2. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_type VARCHAR(50),
    settings JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- 6. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir usuário administrador padrão
INSERT INTO users (username, password_hash, full_name, user_type, email)
VALUES (
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: admin123
    'Administrador do Sistema',
    'admin',
    'admin@conectaautismo.com'
) ON CONFLICT (username) DO NOTHING;

-- 9. Configurar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas de segurança
-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR user_type = 'admin');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Perfis de usuário
CREATE POLICY "Users can view own profiles" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profiles" ON user_profiles
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Logs de atividade (apenas leitura para o próprio usuário)
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Configurações do sistema (apenas admins)
CREATE POLICY "Only admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND user_type = 'admin'
        )
    );

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE user_profiles IS 'Perfis e configurações específicas dos usuários';
COMMENT ON TABLE system_settings IS 'Configurações globais do sistema';
COMMENT ON TABLE activity_logs IS 'Logs de atividades dos usuários';