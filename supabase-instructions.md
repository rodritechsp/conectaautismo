# Instruções para Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha os dados do projeto:
   - **Name**: Conecta Autismo
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America)
6. Clique em "Create new project"

## 2. Configurar o Banco de Dados

1. Aguarde o projeto ser criado (pode levar alguns minutos)
2. No painel do Supabase, vá para **SQL Editor**
3. Copie todo o conteúdo do arquivo `database-setup.sql`
4. Cole no SQL Editor e execute (clique em "Run")
5. Verifique se todas as tabelas foram criadas em **Table Editor**

## 3. Obter as Credenciais

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: https://xyzcompany.supabase.co)
   - **anon public** key (chave pública anônima)

## 4. Configurar a Aplicação

1. Abra o arquivo `config.js`
2. Substitua as seguintes linhas:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'SUA_URL_DO_SUPABASE', // Cole aqui a Project URL
       anonKey: 'SUA_CHAVE_ANONIMA' // Cole aqui a anon public key
   };
   ```

## 5. Configurar Autenticação (Opcional)

1. No Supabase, vá para **Authentication** > **Settings**
2. Configure os provedores de autenticação desejados
3. Defina as URLs de redirecionamento:
   - Site URL: `http://localhost:8000` (desenvolvimento)
   - Redirect URLs: `http://localhost:8000` e sua URL de produção

## 6. Configurar Row Level Security (RLS)

As políticas de segurança já foram configuradas no script SQL, mas você pode:

1. Ir para **Authentication** > **Policies**
2. Verificar se as políticas foram criadas corretamente
3. Ajustar conforme necessário

## 7. Testar a Conexão

1. Abra o console do navegador na sua aplicação
2. Verifique se aparece a mensagem: "Supabase inicializado com sucesso"
3. Se aparecer um aviso sobre credenciais, configure o `config.js`

## 8. Estrutura das Tabelas Criadas

- **users**: Usuários do sistema
- **user_profiles**: Perfis e configurações dos usuários
- **system_settings**: Configurações globais
- **activity_logs**: Logs de atividades

## 9. Próximos Passos

Após a configuração:
1. A aplicação será atualizada para usar Supabase
2. Os dados não ficarão mais apenas no localStorage
3. Múltiplos usuários poderão usar o sistema
4. Os dados serão persistidos na nuvem

## 10. Troubleshooting

**Erro de CORS**: Verifique se a URL do site está configurada corretamente nas configurações de autenticação.

**Erro de conexão**: Verifique se as credenciais no `config.js` estão corretas.

**Tabelas não criadas**: Execute novamente o script SQL no SQL Editor.

---

**Importante**: Mantenha suas credenciais seguras e nunca as compartilhe publicamente!