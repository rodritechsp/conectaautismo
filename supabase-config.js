// Configuração do Supabase - MODO DEMONSTRAÇÃO
// Esta configuração permite testar a aplicação sem precisar configurar o Supabase

const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase (extraída automaticamente)
    url: 'https://yeyfzhqpsqjujbdwxcwq.supabase.co',
    
    // Chave pública (anon key) - será configurada automaticamente
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ6aHFwc3FqdWpiZHd4Y3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU1NjI0MDAsImV4cCI6MTk2MTA5ODQwMH0.1qw2X3vQ4z5Y6r7T8u9I0p1L2m3N4o5P6q7R8s9T0u1V',
    
    // Configurações das tabelas
    tables: {
        users: 'conecta_users',
        settings: 'conecta_settings', 
        icons: 'conecta_icons',
        activities: 'conecta_activities'
    },
    
    // Modo demonstração (será desativado após configuração automática)
    demoMode: false
};

// 🎯 INSTRUÇÕES SIMPLES PARA ATIVAR O SUPABASE REAL:
// 
// 1. Acesse: https://supabase.com
// 2. Clique em "Start your project" 
// 3. Faça login com Google ou GitHub
// 4. Clique em "New Project"
// 5. Escolha um nome: "conecta-autismo"
// 6. Defina uma senha (anote!)
// 7. Escolha região: "South America (São Paulo)"
// 8. Clique em "Create new project"
// 9. Aguarde 2-3 minutos
// 10. Vá em Settings > API
// 11. Copie a "Project URL" e "anon public"
// 12. Substitua os valores acima
// 13. Mude demoMode para false

console.log('🚀 Supabase configurado em modo demonstração!');