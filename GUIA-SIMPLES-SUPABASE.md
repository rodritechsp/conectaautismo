# 🚀 Guia Super Simples - Conectar Supabase

## 📱 **Sua aplicação já está funcionando!**
- A aplicação está rodando em **modo demonstração**
- Todos os dados são salvos localmente
- Você pode usar normalmente: login, configurações, etc.

---

## 🌐 **Quer conectar ao banco de dados real? (Opcional)**

### **Passo 1: Criar conta no Supabase** (2 minutos)
1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"**
3. Faça login com **Google** ou **GitHub**

### **Passo 2: Criar projeto** (3 minutos)
1. Clique em **"New Project"**
2. Nome do projeto: **`conecta-autismo`**
3. Senha do banco: **`MinhaSenh@123`** (anote!)
4. Região: **"South America (São Paulo)"**
5. Clique em **"Create new project"**
6. ⏳ **Aguarde 2-3 minutos** (vai aparecer uma barra de progresso)

### **Passo 3: Configurar banco** (1 minuto)
1. No painel do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. **Copie e cole** este código:

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

-- Inserir usuário administrador
INSERT INTO conecta_users (username, password, name, email) 
VALUES ('admin', 'admin123', 'Administrador', 'admin@conecta.com');
```

4. Clique em **"Run"** (botão azul)

### **Passo 4: Pegar credenciais** (1 minuto)
1. Vá em **"Settings"** > **"API"**
2. **Copie** a **"Project URL"** (algo como: `https://abc123.supabase.co`)
3. **Copie** a **"anon public"** (chave longa que começa com `eyJ...`)

### **Passo 5: Configurar aplicação** (30 segundos)
1. Abra o arquivo **`supabase-config.js`**
2. **Substitua** estas linhas:

```javascript
// ANTES:
url: 'https://demo-conecta-autismo.supabase.co',
anonKey: 'demo-key-conecta-autismo-2024',
demoMode: true

// DEPOIS:
url: 'SUA-PROJECT-URL-AQUI',
anonKey: 'SUA-ANON-KEY-AQUI',
demoMode: false
```

3. **Salve** o arquivo
4. **Recarregue** a página

---

## ✅ **Como saber se funcionou?**

Abra o **console do navegador** (F12):
- ✅ **Funcionou**: "✅ Supabase inicializado com sucesso!"
- ❌ **Não funcionou**: "🎯 Modo demonstração ativado"

---

## 🆘 **Precisa de ajuda?**

### **Problemas comuns:**
- **"Projeto não carrega"**: Aguarde mais 2-3 minutos
- **"Erro de SQL"**: Verifique se copiou o código completo
- **"Não encontro as credenciais"**: Vá em Settings > API

### **Não conseguiu?**
- **Não tem problema!** A aplicação funciona perfeitamente em modo demonstração
- Todos os dados ficam salvos no seu navegador
- Você pode tentar conectar o Supabase depois

---

## 🎯 **Resumo:**
1. **Agora**: Aplicação funciona offline (modo demo)
2. **Depois**: Conecte ao Supabase para ter banco real
3. **Vantagem**: Dados sincronizados, backup automático, acesso de qualquer lugar

**🚀 Sua aplicação está pronta para usar!**