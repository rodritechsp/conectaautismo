// Cliente Supabase para Conecta Autismo
class SupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.currentUser = null;
    }

    // Inicializar conexão com Supabase
    async init() {
        try {
            // Verificar se está em modo demonstração
            if (SUPABASE_CONFIG.demoMode) {
                console.log('🎯 Modo demonstração ativado - usando localStorage');
                console.log('📝 Para ativar Supabase real, siga as instruções em supabase-config.js');
                this.isInitialized = false; // Força uso do localStorage
                return false;
            }

            if (typeof supabase === 'undefined') {
                console.warn('Supabase library não carregada. Usando localStorage como fallback.');
                return false;
            }

            if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || 
                SUPABASE_CONFIG.url === 'https://seu-projeto.supabase.co' ||
                SUPABASE_CONFIG.anonKey === 'sua-chave-publica-aqui') {
                console.warn('Configuração do Supabase não definida. Usando localStorage como fallback.');
                return false;
            }

            this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            this.isInitialized = true;
            
            console.log('✅ Supabase inicializado com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar Supabase:', error);
            return false;
        }
    }

    // Verificar se está conectado
    isConnected() {
        return this.isInitialized && this.client !== null;
    }

    // Carregar usuários
    async loadUsers() {
        if (!this.isConnected()) {
            return this.loadUsersFromLocalStorage();
        }

        try {
            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.users)
                .select('*')
                .eq('is_active', true);

            if (error) throw error;

            const users = data.map(user => ({
                username: user.username,
                password: user.password,
                name: user.name,
                email: user.email,
                profilePhoto: user.profile_photo
            }));

            // Salvar no localStorage como backup
            localStorage.setItem('conecta_users', JSON.stringify(users));
            return users;
        } catch (error) {
            console.error('Erro ao carregar usuários do Supabase:', error);
            return this.loadUsersFromLocalStorage();
        }
    }

    // Salvar usuários
    async saveUsers(users) {
        // Sempre salvar no localStorage como backup
        localStorage.setItem('conecta_users', JSON.stringify(users));

        if (!this.isConnected()) {
            return true;
        }

        try {
            // Para cada usuário, verificar se existe e atualizar ou inserir
            for (const user of users) {
                const { data: existingUser } = await this.client
                    .from(SUPABASE_CONFIG.tables.users)
                    .select('id')
                    .eq('username', user.username)
                    .single();

                const userData = {
                    username: user.username,
                    password: user.password,
                    name: user.name,
                    email: user.email,
                    profile_photo: user.profilePhoto,
                    updated_at: new Date().toISOString()
                };

                if (existingUser) {
                    // Atualizar usuário existente
                    await this.client
                        .from(SUPABASE_CONFIG.tables.users)
                        .update(userData)
                        .eq('id', existingUser.id);
                } else {
                    // Inserir novo usuário
                    await this.client
                        .from(SUPABASE_CONFIG.tables.users)
                        .insert(userData);
                }
            }

            return true;
        } catch (error) {
            console.error('Erro ao salvar usuários no Supabase:', error);
            return true; // Retorna true porque salvou no localStorage
        }
    }

    // Autenticar usuário
    async authenticateUser(username, password) {
        if (!this.isConnected()) {
            return this.authenticateUserFromLocalStorage(username, password);
        }

        try {
            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.users)
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return this.authenticateUserFromLocalStorage(username, password);
            }

            this.currentUser = {
                username: data.username,
                name: data.name,
                email: data.email,
                profilePhoto: data.profile_photo
            };

            // Registrar atividade de login
            await this.logActivity(data.id, 'login', `Login realizado por ${data.name}`);

            return this.currentUser;
        } catch (error) {
            console.error('Erro ao autenticar no Supabase:', error);
            return this.authenticateUserFromLocalStorage(username, password);
        }
    }

    // Registrar novo usuário
    async registerUser(userData) {
        // Sempre salvar no localStorage como backup
        const users = this.loadUsersFromLocalStorage();
        users.push(userData);
        localStorage.setItem('conecta_users', JSON.stringify(users));

        if (!this.isConnected()) {
            return true;
        }

        try {
            const { error } = await this.client
                .from(SUPABASE_CONFIG.tables.users)
                .insert({
                    username: userData.username,
                    password: userData.password,
                    name: userData.name,
                    email: userData.email,
                    profile_photo: userData.profilePhoto
                });

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Erro ao registrar usuário no Supabase:', error);
            return true; // Retorna true porque salvou no localStorage
        }
    }

    // Carregar configurações do usuário
    async loadSettings(username) {
        if (!this.isConnected()) {
            return this.loadSettingsFromLocalStorage();
        }

        try {
            // Primeiro, buscar o ID do usuário
            const { data: user } = await this.client
                .from(SUPABASE_CONFIG.tables.users)
                .select('id')
                .eq('username', username)
                .single();

            if (!user) {
                return this.loadSettingsFromLocalStorage();
            }

            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.settings)
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                return this.loadSettingsFromLocalStorage();
            }

            const settings = {
                speechRate: data.speech_rate,
                speechVolume: data.speech_volume,
                highContrast: data.high_contrast,
                largeIcons: data.large_icons,
                soundFeedback: data.sound_feedback
            };

            // Salvar no localStorage como backup
            localStorage.setItem('conecta_settings', JSON.stringify(settings));
            return settings;
        } catch (error) {
            console.error('Erro ao carregar configurações do Supabase:', error);
            return this.loadSettingsFromLocalStorage();
        }
    }

    // Salvar configurações do usuário
    async saveSettings(username, settings) {
        // Sempre salvar no localStorage como backup
        localStorage.setItem('conecta_settings', JSON.stringify(settings));

        if (!this.isConnected()) {
            return true;
        }

        try {
            // Primeiro, buscar o ID do usuário
            const { data: user } = await this.client
                .from(SUPABASE_CONFIG.tables.users)
                .select('id')
                .eq('username', username)
                .single();

            if (!user) {
                return true;
            }

            const settingsData = {
                user_id: user.id,
                speech_rate: settings.speechRate,
                speech_volume: settings.speechVolume,
                high_contrast: settings.highContrast,
                large_icons: settings.largeIcons,
                sound_feedback: settings.soundFeedback,
                updated_at: new Date().toISOString()
            };

            // Verificar se já existe configuração para este usuário
            const { data: existingSettings } = await this.client
                .from(SUPABASE_CONFIG.tables.settings)
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (existingSettings) {
                // Atualizar configurações existentes
                await this.client
                    .from(SUPABASE_CONFIG.tables.settings)
                    .update(settingsData)
                    .eq('id', existingSettings.id);
            } else {
                // Inserir novas configurações
                await this.client
                    .from(SUPABASE_CONFIG.tables.settings)
                    .insert(settingsData);
            }

            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações no Supabase:', error);
            return true; // Retorna true porque salvou no localStorage
        }
    }

    // Registrar atividade
    async logActivity(userId, activityType, description) {
        if (!this.isConnected()) {
            return;
        }

        try {
            await this.client
                .from(SUPABASE_CONFIG.tables.activities)
                .insert({
                    user_id: userId,
                    activity_type: activityType,
                    description: description
                });
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
        }
    }

    // Métodos de fallback para localStorage
    loadUsersFromLocalStorage() {
        const users = localStorage.getItem('conecta_users');
        return users ? JSON.parse(users) : [
            {
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                email: 'admin@conecta.com',
                profilePhoto: null
            }
        ];
    }

    authenticateUserFromLocalStorage(username, password) {
        const users = this.loadUsersFromLocalStorage();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            return user;
        }
        
        return null;
    }

    loadSettingsFromLocalStorage() {
        const settings = localStorage.getItem('conecta_settings');
        return settings ? JSON.parse(settings) : {
            speechRate: 1.0,
            speechVolume: 1.0,
            highContrast: false,
            largeIcons: false,
            soundFeedback: true
        };
    }
}

// Instância global do cliente Supabase
const supabaseClient = new SupabaseClient();