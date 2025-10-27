// Configuração do Supabase
// IMPORTANTE: Substitua pelas suas credenciais do Supabase
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Ex: https://xyzcompany.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Sua chave anônima do Supabase
};

// Inicialização do cliente Supabase
let supabase;

// Função para inicializar Supabase
function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('Supabase inicializado com sucesso');
        return true;
    } else {
        console.error('Supabase não carregado. Verifique a conexão.');
        return false;
    }
}

// Verificar se as credenciais foram configuradas
function checkSupabaseConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ ATENÇÃO: Configure suas credenciais do Supabase no arquivo config.js');
        return false;
    }
    return true;
}