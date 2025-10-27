# 🚀 Instruções para Configurar o Supabase - Conecta Autismo

## 📋 Pré-requisitos
- Conta no Supabase (gratuita)
- Acesso ao projeto Conecta Autismo

## 🔧 Passo a Passo da Configuração

### 1. Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Defina:
   - **Nome do projeto**: `conecta-autismo`
   - **Senha do banco**: (anote esta senha!)
   - **Região**: South America (São Paulo)
6. Clique em "Create new project"

### 2. Configurar o Banco de Dados
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole e execute o seguinte SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE conecta_users (
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

-- Criar tabela de configurações
CREATE TABLE conecta_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    speech_rate DECIMAL(3,2) DEFAULT 1.0,
    speech_volume DECIMAL(3,2) DEFAULT 1.0,
    high_contrast BOOLEAN DEFAULT false,
    large_icons BOOLEAN DEFAULT false,
    sound_feedback BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de ícones personalizados
CREATE TABLE conecta_icons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    text VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de atividades/logs
CREATE TABLE conecta_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES conecta_users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_conecta_users_username ON conecta_users(username);
CREATE INDEX idx_conecta_settings_user_id ON conecta_settings(user_id);
CREATE INDEX idx_conecta_icons_user_id ON conecta_icons(user_id);
CREATE INDEX idx_conecta_icons_category ON conecta_icons(category);
CREATE INDEX idx_conecta_activities_user_id ON conecta_activities(user_id);
CREATE INDEX idx_conecta_activities_type ON conecta_activities(activity_type);

-- Inserir usuário administrador padrão
INSERT INTO conecta_users (username, password, name, email) 
VALUES ('admin', 'admin123', 'Administrador', 'admin@conecta.com');
```

### 3. Obter as Credenciais
1. Vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto-id.supabase.co`
   - **anon public key**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

### 4. Configurar a Aplicação
1. Abra o arquivo `supabase-config.js`
2. Substitua as configurações:

```javascript
const SUPABASE_CONFIG = {
    // Cole sua URL aqui
    url: 'https://seu-projeto-id.supabase.co',
    
    // Cole sua chave pública aqui
    anonKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
    
    // Não altere estas configurações
    tables: {
        users: 'conecta_users',
        settings: 'conecta_settings', 
        icons: 'conecta_icons',
        activities: 'conecta_activities'
    }
};
```

### 5. Configurar Row Level Security (RLS)
1. No Supabase, vá em **Authentication** > **Policies**
2. Para cada tabela, clique em "Enable RLS"
3. Adicione as seguintes políticas:

**Para conecta_users:**
```sql
-- Política de leitura (todos podem ler usuários ativos)
CREATE POLICY "Usuários podem ler perfis ativos" ON conecta_users
FOR SELECT USING (is_active = true);

-- Política de inserção (qualquer um pode criar conta)
CREATE POLICY "Qualquer um pode criar conta" ON conecta_users
FOR INSERT WITH CHECK (true);

-- Política de atualização (usuários podem atualizar próprio perfil)
CREATE POLICY "Usuários podem atualizar próprio perfil" ON conecta_users
FOR UPDATE USING (auth.uid()::text = id::text);
```

### 6. Testar a Conexão
1. Abra o console do navegador (F12)
2. Recarregue a página
3. Verifique se aparece: "Supabase inicializado com sucesso!"
4. Teste o login com: `admin` / `admin123`

## 🔍 Verificação de Funcionamento

### ✅ Sinais de que está funcionando:
- Console mostra "Supabase inicializado com sucesso!"
- Login funciona normalmente
- Configurações são salvas entre sessões
- Novos usuários podem ser criados

### ❌ Sinais de problemas:
- Console mostra "Configuração do Supabase não definida"
- Dados não persistem entre sessões
- Erros de conexão no console

## 🛠️ Solução de Problemas

### Problema: "Configuração não definida"
**Solução**: Verifique se as credenciais em `supabase-config.js` estão corretas

### Problema: "Erro de conexão"
**Solução**: 
1. Verifique se o projeto Supabase está ativo
2. Confirme se a URL e chave estão corretas
3. Verifique se as tabelas foram criadas

### Problema: "Erro de autenticação"
**Solução**:
1. Verifique se o usuário admin foi inserido
2. Confirme se as políticas RLS estão configuradas
3. Teste com outros usuários

## 📊 Monitoramento

### Logs no Supabase:
1. Vá em **Logs** > **Database**
2. Monitore queries e erros
3. Verifique performance

### Logs na Aplicação:
- Abra o console do navegador
- Monitore mensagens de erro
- Verifique operações do Supabase

## 🔄 Backup e Migração

### Backup Automático:
- A aplicação mantém backup no localStorage
- Dados não são perdidos se Supabase falhar

### Migração de Dados:
- Dados existentes no localStorage são preservados
- Novos dados são sincronizados com Supabase
- Fallback automático para localStorage

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console
2. Confirme as configurações
3. Teste a conexão com Supabase
4. Entre em contato com o suporte técnico

---

**🎯 Objetivo**: Ter um banco de dados robusto e escalável para o Conecta Autismo, mantendo a compatibilidade com o sistema atual.