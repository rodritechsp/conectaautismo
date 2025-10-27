// Serviço para gerenciar operações do Supabase
class SupabaseService {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
    }

    // Inicializar Supabase
    async init() {
        try {
            if (!checkSupabaseConfig()) {
                console.warn('Supabase não configurado. Usando localStorage como fallback.');
                return false;
            }

            if (initSupabase()) {
                this.supabase = supabase;
                this.isInitialized = true;
                console.log('SupabaseService inicializado com sucesso');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao inicializar SupabaseService:', error);
            return false;
        }
    }

    // Verificar se está inicializado
    isReady() {
        return this.isInitialized && this.supabase;
    }

    // === MÉTODOS DE USUÁRIOS ===

    // Carregar usuários
    async loadUsers() {
        if (!this.isReady()) {
            return this.loadUsersFromLocalStorage();
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao carregar usuários do Supabase:', error);
                return this.loadUsersFromLocalStorage();
            }

            return data || [];
        } catch (error) {
            console.error('Erro na consulta de usuários:', error);
            return this.loadUsersFromLocalStorage();
        }
    }

    // Salvar usuários
    async saveUser(userData) {
        if (!this.isReady()) {
            return this.saveUserToLocalStorage(userData);
        }

        try {
            // Hash da senha (em produção, use bcrypt no backend)
            const hashedPassword = await this.hashPassword(userData.password);
            
            const userToSave = {
                username: userData.username,
                password_hash: hashedPassword,
                full_name: userData.name,
                email: userData.email || null,
                user_type: userData.userType || 'user'
            };

            const { data, error } = await this.supabase
                .from('users')
                .insert([userToSave])
                .select();

            if (error) {
                console.error('Erro ao salvar usuário no Supabase:', error);
                return { success: false, message: error.message };
            }

            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            return { success: false, message: error.message };
        }
    }

    // Autenticar usuário
    async authenticateUser(username, password) {
        if (!this.isReady()) {
            return this.authenticateUserFromLocalStorage(username, password);
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { success: false, message: 'Usuário não encontrado' };
            }

            // Verificar senha (em produção, use bcrypt)
            const isValidPassword = await this.verifyPassword(password, data.password_hash);
            
            if (!isValidPassword) {
                return { success: false, message: 'Senha incorreta' };
            }

            // Registrar log de atividade
            await this.logActivity(data.id, 'login', { ip: this.getClientIP() });

            return { success: true, user: data };
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return { success: false, message: 'Erro interno do servidor' };
        }
    }

    // === MÉTODOS DE CONFIGURAÇÕES ===

    // Carregar configurações
    async loadSettings(userId) {
        if (!this.isReady()) {
            return this.loadSettingsFromLocalStorage();
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('settings')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return this.getDefaultSettings();
            }

            return data.settings || this.getDefaultSettings();
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return this.getDefaultSettings();
        }
    }

    // Salvar configurações
    async saveSettings(userId, settings) {
        if (!this.isReady()) {
            return this.saveSettingsToLocalStorage(settings);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    settings: settings,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Erro ao salvar configurações:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }

    // === MÉTODOS DE ÍCONES ===

    // Carregar ícones personalizados
    async loadCustomIcons(userId) {
        if (!this.isReady()) {
            return this.loadIconsFromLocalStorage();
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('preferences')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return {};
            }

            return data.preferences?.custom_icons || {};
        } catch (error) {
            console.error('Erro ao carregar ícones:', error);
            return {};
        }
    }

    // Salvar ícones personalizados
    async saveCustomIcons(userId, icons) {
        if (!this.isReady()) {
            return this.saveIconsToLocalStorage(icons);
        }

        try {
            const { data: currentData } = await this.supabase
                .from('user_profiles')
                .select('preferences')
                .eq('user_id', userId)
                .single();

            const currentPreferences = currentData?.preferences || {};
            const updatedPreferences = {
                ...currentPreferences,
                custom_icons: icons
            };

            const { error } = await this.supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    preferences: updatedPreferences,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Erro ao salvar ícones:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao salvar ícones:', error);
            return false;
        }
    }

    // === MÉTODOS DE LOGS ===

    // Registrar atividade
    async logActivity(userId, action, details = {}) {
        if (!this.isReady()) {
            return;
        }

        try {
            await this.supabase
                .from('activity_logs')
                .insert([{
                    user_id: userId,
                    action: action,
                    details: details,
                    ip_address: this.getClientIP(),
                    user_agent: navigator.userAgent
                }]);
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
        }
    }

    // === MÉTODOS AUXILIARES ===

    // Hash simples da senha (em produção, use bcrypt no backend)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Verificar senha
    async verifyPassword(password, hash) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hash;
    }

    // Obter IP do cliente (simplificado)
    getClientIP() {
        return 'unknown'; // Em produção, obter do servidor
    }

    // === MÉTODOS DE FALLBACK (localStorage) ===

    loadUsersFromLocalStorage() {
        const users = localStorage.getItem('conecta_users');
        if (users) {
            return JSON.parse(users);
        }
        
        const defaultUsers = [{
            id: 1,
            username: 'admin',
            password_hash: 'admin123', // Em produção, seria hasheado
            full_name: 'Administrador',
            user_type: 'admin',
            created_at: new Date().toISOString()
        }];
        
        localStorage.setItem('conecta_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    saveUserToLocalStorage(userData) {
        try {
            const users = this.loadUsersFromLocalStorage();
            
            // Verificar se usuário já existe
            if (users.find(u => u.username === userData.username)) {
                return { success: false, message: 'Nome de usuário já existe' };
            }

            const newUser = {
                id: Date.now(),
                username: userData.username,
                password_hash: userData.password, // Em produção, seria hasheado
                full_name: userData.name,
                email: userData.email,
                user_type: userData.userType || 'user',
                created_at: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('conecta_users', JSON.stringify(users));
            
            return { success: true, data: newUser };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    authenticateUserFromLocalStorage(username, password) {
        const users = this.loadUsersFromLocalStorage();
        const user = users.find(u => u.username === username && u.password_hash === password);
        
        if (user) {
            return { success: true, user: user };
        }
        
        return { success: false, message: 'Credenciais inválidas' };
    }

    loadSettingsFromLocalStorage() {
        const settings = localStorage.getItem('conecta_settings');
        return settings ? JSON.parse(settings) : this.getDefaultSettings();
    }

    saveSettingsToLocalStorage(settings) {
        try {
            localStorage.setItem('conecta_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações no localStorage:', error);
            return false;
        }
    }

    loadIconsFromLocalStorage() {
        const icons = localStorage.getItem('conecta_icons');
        return icons ? JSON.parse(icons) : {};
    }

    saveIconsToLocalStorage(icons) {
        try {
            localStorage.setItem('conecta_icons', JSON.stringify(icons));
            return true;
        } catch (error) {
            console.error('Erro ao salvar ícones no localStorage:', error);
            return false;
        }
    }

    getDefaultSettings() {
        return {
            volume: 0.8,
            speed: 1,
            voice: 0,
            theme: 'light',
            soundEnabled: true,
            autoSpeak: false
        };
    }
}

// Instância global do serviço
const supabaseService = new SupabaseService();