// Conecta Autismo - Main Application JavaScript
class ConectaAutismo {
    constructor() {
        this.currentCategory = 'sentimentos';
        this.settings = this.loadSettings();
        this.usage = this.loadUsage();
        this.icons = this.loadIcons();
        this.speechSynthesis = window.speechSynthesis;
        this.currentUser = null;
        this.users = [];
        
        this.init();
    }

    init() {
        this.users = this.loadUsers(); // Load users first
        this.checkAuthentication();
        this.setupEventListeners();
        // Profile setup will be called after authentication
    }

    // Profile Management Methods
    setupProfileEventListeners() {
        const photoUploadBtn = document.getElementById('photo-upload-btn');
        const photoUploadInput = document.getElementById('photo-upload-input');
        const removePhotoBtn = document.getElementById('remove-photo-btn');
        const profileForm = document.getElementById('profile-form');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileUsername = document.getElementById('profile-username');

        if (photoUploadBtn && photoUploadInput) {
            photoUploadBtn.addEventListener('click', () => {
                photoUploadInput.click();
            });

            photoUploadInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                this.removeProfilePhoto();
            });
        }

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate();
            });
        }
    }

    loadUserProfile() {
        if (!this.currentUser) {
            return;
        }

        const users = this.loadUsers();
        const user = users.find(u => u.username === this.currentUser.username);
        
        if (user) {
            this.currentUser = user;
            
            const nameInput = document.getElementById('profile-name');
            const emailInput = document.getElementById('profile-email');
            const usernameInput = document.getElementById('profile-username');

            if (nameInput) {
                nameInput.value = user.name || '';
            }

            if (emailInput) {
                emailInput.value = user.email || '';
            }

            if (usernameInput) {
                usernameInput.value = user.username || '';
            }

            if (user.profilePhoto) {
                const profileImg = document.getElementById('profile-photo');
                if (profileImg) {
                    profileImg.src = user.profilePhoto;
                }
            }
        }
    }

    updateHeaderUserInfo(user) {
        const userNameElement = document.getElementById('user-name');
        const headerPhoto = document.getElementById('header-profile-photo');
        const headerPlaceholder = document.getElementById('header-photo-placeholder');
    
        if (userNameElement) {
            userNameElement.textContent = user.name || user.username;
        }
    
        if (user.profilePhoto && headerPhoto && headerPlaceholder) {
            headerPhoto.src = user.profilePhoto;
            headerPhoto.classList.remove('hidden');
            headerPlaceholder.style.display = 'none';
        } else if (headerPhoto && headerPlaceholder) {
            headerPhoto.classList.add('hidden');
            headerPlaceholder.style.display = 'flex';
        }
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showProfileMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
            return;
        }
    
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showProfileMessage('A imagem deve ter no máximo 5MB.', 'error');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.updateProfilePhoto(imageData);
            this.saveProfilePhoto(imageData);
        };
        reader.readAsDataURL(file);
    }

    updateProfilePhoto(imageData) {
        const profilePhoto = document.getElementById('profile-photo');
        const photoPlaceholder = document.getElementById('photo-placeholder');
        const removeBtn = document.getElementById('remove-photo-btn');
    
        if (imageData && profilePhoto && photoPlaceholder) {
            profilePhoto.src = imageData;
            profilePhoto.classList.remove('hidden');
            photoPlaceholder.classList.add('hidden');
            if (removeBtn) removeBtn.classList.remove('hidden');
        } else if (profilePhoto && photoPlaceholder) {
            profilePhoto.classList.add('hidden');
            photoPlaceholder.classList.remove('hidden');
            if (removeBtn) removeBtn.classList.add('hidden');
        }
    }

    removeProfilePhoto() {
        this.updateProfilePhoto(null);
        this.saveProfilePhoto(null);
        
        // Update header
        const headerPhoto = document.getElementById('header-profile-photo');
        const headerPlaceholder = document.getElementById('header-photo-placeholder');
        
        if (headerPhoto && headerPlaceholder) {
            headerPhoto.classList.add('hidden');
            headerPlaceholder.style.display = 'flex';
        }
        
        this.showProfileMessage('Foto de perfil removida com sucesso!', 'success');
    }

    saveProfilePhoto(imageData) {
        if (!this.currentUser) return;
    
        const users = this.loadUsers();
        const userIndex = users.findIndex(u => u.username === this.currentUser.username);
        
        if (userIndex !== -1) {
            users[userIndex].profilePhoto = imageData;
            this.currentUser.profilePhoto = imageData;
            this.saveUsers(users);
            this.updateHeaderUserInfo(users[userIndex]);
        }
    }

    handleProfileUpdate() {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        if (!nameInput || !emailInput) {
            this.showProfileMessage('Erro: Elementos do formulário não encontrados', 'error');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
        const newPassword = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (!name) {
            this.showProfileMessage('Nome é obrigatório', 'error');
            return;
        }

        if (!email || !this.isValidEmail(email)) {
            this.showProfileMessage('Email válido é obrigatório', 'error');
            return;
        }

        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                this.showProfileMessage('Senha atual é obrigatória para alterar a senha', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                this.showProfileMessage('Nova senha e confirmação não coincidem', 'error');
                return;
            }
            if (newPassword.length < 6) {
                this.showProfileMessage('Nova senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
        }

        const profileData = {
            name: name,
            email: email
        };

        if (newPassword) {
            profileData.currentPassword = currentPassword;
            profileData.newPassword = newPassword;
        }

        this.updateUserProfile(profileData);
    }

    updateUserProfile(profileData) {
        if (!this.currentUser) {
            this.showProfileMessage('Erro: Usuário não encontrado', 'error');
            return;
        }

        const users = this.loadUsers();
        const userIndex = users.findIndex(u => u.username === this.currentUser.username);
        
        if (userIndex === -1) {
            this.showProfileMessage('Erro: Usuário não encontrado na base de dados', 'error');
            return;
        }

        if (profileData.newPassword) {
            if (users[userIndex].password !== profileData.currentPassword) {
                this.showProfileMessage('Senha atual incorreta', 'error');
                return;
            }
            users[userIndex].password = profileData.newPassword;
        }

        users[userIndex].name = profileData.name;
        users[userIndex].email = profileData.email;
        
        this.currentUser = users[userIndex];

        this.saveUsers(users);
        
        localStorage.setItem('conecta_current_user', JSON.stringify(this.currentUser));

        this.updateHeaderUserInfo(this.currentUser);

        if (document.getElementById('current-password')) {
            document.getElementById('current-password').value = '';
        }
        if (document.getElementById('new-password')) {
            document.getElementById('new-password').value = '';
        }
        if (document.getElementById('confirm-password')) {
            document.getElementById('confirm-password').value = '';
        }

        this.showProfileMessage('Perfil atualizado com sucesso!', 'success');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showProfileMessage(message, type) {
        const successDiv = document.getElementById('profile-success');
        const errorDiv = document.getElementById('profile-error');

        // Hide both messages first
        if (successDiv) successDiv.classList.add('hidden');
        if (errorDiv) errorDiv.classList.add('hidden');

        // Show appropriate message
        if (type === 'success' && successDiv) {
            successDiv.textContent = message;
            successDiv.classList.remove('hidden');
            setTimeout(() => successDiv.classList.add('hidden'), 5000);
        } else if (type === 'error' && errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => errorDiv.classList.add('hidden'), 5000);
        }
    }
    checkAuthentication() {
        const savedUser = localStorage.getItem('conecta_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showSplashThenLogin();
        }
    }

    showSplashThenLogin() {
        const splashScreen = document.getElementById('splash-screen');
        const loginScreen = document.getElementById('login-screen');
        
        splashScreen.classList.remove('hidden');
        
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            loginScreen.classList.remove('hidden');
        }, 3000);
    }

    showMainApp() {
        try {
            // Hide splash and login screens
            const splashScreen = document.getElementById('splash-screen');
            const loginScreen = document.getElementById('login-screen');
            const mainApp = document.getElementById('main-app');

            if (splashScreen) splashScreen.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';

            // Setup profile event listeners
            this.setupProfileEventListeners();

            // Load user profile if elements exist
            const profileForm = document.getElementById('profile-form');
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');

            if (profileForm && profileName && profileEmail) {
                this.loadUserProfile();
            }

            // Update user name in header
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.name || this.currentUser.username;
            }

            // Load initial content
            this.loadCategoryIcons();
            this.loadIconsManagement();
            this.loadSettingsValues();

            console.log('Main app loaded successfully');
        } catch (error) {
            console.error('Erro ao carregar aplicação principal:', error);
            alert('Erro ao carregar a aplicação. Recarregue a página.');
        }
    }

    showLoginScreen() {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }

    loadUsers() {
        const users = localStorage.getItem('conecta_users');
        if (users) {
            return JSON.parse(users);
        }
        
        // Create default admin user
        const defaultUsers = [{
            id: 1,
            username: 'admin',
            password: 'admin123',
            name: 'Administrador',
            createdAt: new Date().toISOString()
        }];
        
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    saveUsers(users) {
        console.log('saveUsers called with:', users);
        try {
            localStorage.setItem('conecta_users', JSON.stringify(users));
            console.log('Users saved to localStorage successfully');
            
            // Verify the save by reading it back
            const saved = localStorage.getItem('conecta_users');
            console.log('Verification - data read back from localStorage:', saved);
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
        }
    }

    authenticateUser(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('conecta_current_user', JSON.stringify(user));
            return true;
        }
        return false;
    }

    registerUser(userData) {
        // Check if username already exists
        if (this.users.find(u => u.username === userData.username)) {
            return { success: false, message: 'Nome de usuário já existe' };
        }

        // Check if passwords match
        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'Senhas não coincidem' };
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers(this.users);
        
        return { success: true, message: 'Conta criada com sucesso!' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('conecta_current_user');
        document.getElementById('main-app').classList.add('hidden');
        this.showSplashThenLogin();
    }

    // Default icons data
    getDefaultIcons() {
        return {
            sentimentos: [
                { id: 1, emoji: '😊', text: 'Estou feliz', category: 'sentimentos' },
                { id: 2, emoji: '😢', text: 'Estou triste', category: 'sentimentos' },
                { id: 3, emoji: '😰', text: 'Estou com medo', category: 'sentimentos' },
                { id: 4, emoji: '😡', text: 'Estou bravo', category: 'sentimentos' },
                { id: 5, emoji: '😴', text: 'Estou cansado', category: 'sentimentos' },
                { id: 6, emoji: '🤗', text: 'Quero um abraço', category: 'sentimentos' }
            ],
            necessidades: [
                { id: 7, emoji: '🍽️', text: 'Estou com fome', category: 'necessidades' },
                { id: 8, emoji: '💧', text: 'Estou com sede', category: 'necessidades' },
                { id: 9, emoji: '🚽', text: 'Preciso ir ao banheiro', category: 'necessidades' },
                { id: 10, emoji: '🛏️', text: 'Quero dormir', category: 'necessidades' },
                { id: 11, emoji: '🎮', text: 'Quero brincar', category: 'necessidades' },
                { id: 12, emoji: '📺', text: 'Quero assistir TV', category: 'necessidades' }
            ],
            comida: [
                { id: 13, emoji: '🍎', text: 'Maçã', category: 'comida' },
                { id: 14, emoji: '🍌', text: 'Banana', category: 'comida' },
                { id: 15, emoji: '🍞', text: 'Pão', category: 'comida' },
                { id: 16, emoji: '🥛', text: 'Leite', category: 'comida' },
                { id: 17, emoji: '🍕', text: 'Pizza', category: 'comida' },
                { id: 18, emoji: '🍪', text: 'Biscoito', category: 'comida' }
            ],
            cores: [
                { id: 19, emoji: '🔴', text: 'Vermelho', category: 'cores' },
                { id: 20, emoji: '🔵', text: 'Azul', category: 'cores' },
                { id: 21, emoji: '🟢', text: 'Verde', category: 'cores' },
                { id: 22, emoji: '🟡', text: 'Amarelo', category: 'cores' },
                { id: 23, emoji: '🟣', text: 'Roxo', category: 'cores' },
                { id: 24, emoji: '🟠', text: 'Laranja', category: 'cores' }
            ],
            alfabeto: [
                { id: 25, emoji: '🅰️', text: 'A', category: 'alfabeto' },
                { id: 26, emoji: '🅱️', text: 'B', category: 'alfabeto' },
                { id: 27, emoji: '🔤', text: 'C', category: 'alfabeto' },
                { id: 28, emoji: '🔤', text: 'D', category: 'alfabeto' },
                { id: 29, emoji: '🔤', text: 'E', category: 'alfabeto' },
                { id: 30, emoji: '🔤', text: 'F', category: 'alfabeto' }
            ],
            familia: [
                { id: 31, emoji: '👨', text: 'Papai', category: 'familia' },
                { id: 32, emoji: '👩', text: 'Mamãe', category: 'familia' },
                { id: 33, emoji: '❤️', text: 'Eu te amo', category: 'familia' },
                { id: 34, emoji: '🤗', text: 'Obrigado', category: 'familia' },
                { id: 35, emoji: '👋', text: 'Oi', category: 'familia' },
                { id: 36, emoji: '👋', text: 'Tchau', category: 'familia' }
            ]
        };
    }

    // Load/Save functions
    loadSettings() {
        const defaultSettings = {
            speechRate: 1.0,
            speechVolume: 1.0,
            highContrast: false,
            largeIcons: false,
            soundFeedback: true
        };
        
        const saved = localStorage.getItem('conecta-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('conecta-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    loadUsage() {
        const defaultUsage = {
            daily: {},
            weekly: {},
            categories: {}
        };
        
        const saved = localStorage.getItem('conecta-usage');
        return saved ? JSON.parse(saved) : defaultUsage;
    }

    saveUsage() {
        localStorage.setItem('conecta-usage', JSON.stringify(this.usage));
    }

    loadIcons() {
        const saved = localStorage.getItem('conecta-icons');
        return saved ? JSON.parse(saved) : this.getDefaultIcons();
    }

    saveIcons() {
        localStorage.setItem('conecta-icons', JSON.stringify(this.icons));
    }

    // Splash screen
    showSplashScreen() {
        document.getElementById('splash-screen').style.display = 'flex';
        document.getElementById('main-app').classList.add('hidden');
    }

    hideSplashScreen() {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('main-app').classList.remove('hidden');
    }

    // Event listeners
    setupEventListeners() {
        // Authentication event listeners
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.switchCategory(category);
            });
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Close settings
        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Voice settings
        document.getElementById('speech-rate').addEventListener('input', (e) => {
            this.settings.speechRate = parseFloat(e.target.value);
            document.getElementById('rate-value').textContent = e.target.value;
            this.saveSettings();
        });

        document.getElementById('speech-volume').addEventListener('input', (e) => {
            this.settings.speechVolume = parseFloat(e.target.value);
            document.getElementById('volume-value').textContent = Math.round(e.target.value * 100) + '%';
            this.saveSettings();
        });

        document.getElementById('test-voice').addEventListener('click', () => {
            this.speak('Olá, esta é a voz do Conecta Autismo');
        });

        // Accessibility settings
        document.getElementById('high-contrast').addEventListener('change', (e) => {
            this.settings.highContrast = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('large-icons').addEventListener('change', (e) => {
            this.settings.largeIcons = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('sound-feedback').addEventListener('change', (e) => {
            this.settings.soundFeedback = e.target.checked;
            this.saveSettings();
        });

        // Add icon button
        document.getElementById('add-icon-btn').addEventListener('click', () => {
            this.openAddIconModal();
        });

        // Add icon form
        document.getElementById('add-icon-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewIcon();
        });

        // Export report
        document.getElementById('export-report').addEventListener('click', () => {
            this.exportReport();
        });

        // FAQ button
        document.getElementById('show-faq').addEventListener('click', () => {
            this.showFAQ();
        });

        // User management event listeners
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openAddUserModal();
        });

        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateUser();
        });

        // Apply initial settings
        this.applySettings();
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.querySelector('.login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');

        // Clear any previous errors
        errorDiv.classList.add('hidden');

        // Validate inputs
        if (!username || !password) {
            errorDiv.classList.remove('hidden');
            errorDiv.textContent = 'Por favor, preencha todos os campos';
            return;
        }

        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        loginBtn.disabled = true;

        // Simulate loading delay
        setTimeout(() => {
            try {
                if (this.authenticateUser(username, password)) {
                    errorDiv.classList.add('hidden');
                    this.showMainApp();
                } else {
                    errorDiv.classList.remove('hidden');
                    errorDiv.textContent = 'Usuário ou senha incorretos';
                }
            } catch (error) {
                console.error('Erro durante login:', error);
                errorDiv.classList.remove('hidden');
                errorDiv.textContent = 'Erro interno. Tente novamente.';
            }

            // Reset button state
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            loginBtn.disabled = false;
        }, 1000);
    }

    // Category switching
    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Load icons for this category
        this.loadCategoryIcons();
    }

    // Load icons for current category
    loadCategoryIcons() {
        const iconsGrid = document.getElementById('icons-grid');
        const categoryIcons = this.icons[this.currentCategory] || [];
        
        iconsGrid.innerHTML = '';
        
        categoryIcons.forEach(icon => {
            const iconCard = this.createIconCard(icon);
            iconsGrid.appendChild(iconCard);
        });
    }

    // Create icon card element
    createIconCard(icon) {
        const card = document.createElement('div');
        card.className = 'icon-card';
        card.innerHTML = `
            <span class="icon-emoji">${icon.emoji}</span>
            <span class="icon-text">${icon.text}</span>
        `;
        
        card.addEventListener('click', () => {
            this.handleIconClick(icon);
        });
        
        return card;
    }

    // Handle icon click
    handleIconClick(icon) {
        // Visual feedback
        const cards = document.querySelectorAll('.icon-card');
        cards.forEach(card => card.classList.remove('clicked'));
        
        event.currentTarget.classList.add('clicked');
        
        // Speak the text
        this.speak(icon.text);
        
        // Show feedback modal
        this.showFeedback(icon);
        
        // Record usage
        this.recordUsage(icon);
        
        // Sound feedback
        if (this.settings.soundFeedback) {
            this.playClickSound();
        }
    }

    // Text-to-speech
    speak(text) {
        if (this.speechSynthesis) {
            // Cancel any ongoing speech
            this.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = this.settings.speechRate;
            utterance.volume = this.settings.speechVolume;
            
            // Try to find a Portuguese voice
            const voices = this.speechSynthesis.getVoices();
            const ptVoice = voices.find(voice => 
                voice.lang.includes('pt') || voice.lang.includes('PT')
            );
            
            if (ptVoice) {
                utterance.voice = ptVoice;
            }
            
            this.speechSynthesis.speak(utterance);
        }
    }

    // Show feedback modal
    showFeedback(icon) {
        const modal = document.getElementById('feedback-modal');
        const iconEl = modal.querySelector('.feedback-icon');
        const textEl = modal.querySelector('.feedback-text');
        
        iconEl.textContent = icon.emoji;
        textEl.textContent = icon.text;
        
        modal.classList.remove('hidden');
        
        // Hide after 2 seconds
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 2000);
    }

    // Record usage statistics
    recordUsage(icon) {
        const today = new Date().toDateString();
        const week = this.getWeekKey();
        
        // Daily usage
        if (!this.usage.daily[today]) {
            this.usage.daily[today] = 0;
        }
        this.usage.daily[today]++;
        
        // Weekly usage
        if (!this.usage.weekly[week]) {
            this.usage.weekly[week] = 0;
        }
        this.usage.weekly[week]++;
        
        // Category usage
        if (!this.usage.categories[icon.category]) {
            this.usage.categories[icon.category] = 0;
        }
        this.usage.categories[icon.category]++;
        
        this.saveUsage();
        this.updateUsageStats();
    }

    // Get week key for statistics
    getWeekKey() {
        const date = new Date();
        const year = date.getFullYear();
        const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
        return `${year}-W${week}`;
    }

    // Update usage statistics display
    updateUsageStats() {
        const today = new Date().toDateString();
        const week = this.getWeekKey();
        
        const todayUsage = this.usage.daily[today] || 0;
        const weekUsage = this.usage.weekly[week] || 0;
        
        document.getElementById('today-usage').textContent = `${todayUsage} interações`;
        document.getElementById('week-usage').textContent = `${weekUsage} interações`;
        
        // Find favorite category
        let favoriteCategory = '-';
        let maxUsage = 0;
        
        Object.entries(this.usage.categories).forEach(([category, count]) => {
            if (count > maxUsage) {
                maxUsage = count;
                favoriteCategory = this.getCategoryDisplayName(category);
            }
        });
        
        document.getElementById('favorite-category').textContent = favoriteCategory;
    }

    // Get display name for category
    getCategoryDisplayName(category) {
        const names = {
            sentimentos: 'Sentimentos',
            necessidades: 'Necessidades',
            comida: 'Comida',
            cores: 'Cores',
            alfabeto: 'Alfabeto',
            familia: 'Família'
        };
        return names[category] || category;
    }

    // Settings panel
    openSettings() {
        document.getElementById('settings-panel').classList.add('active');
        this.loadSettingsValues();
        this.setupSettingsPermissions();
    }

    setupSettingsPermissions() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const usersTab = document.querySelector('[data-tab="users"]');
        
        if (usersTab) {
            if (!currentUser || currentUser.type !== 'admin') {
                usersTab.style.display = 'none';
            } else {
                usersTab.style.display = 'block';
            }
        }
    }

    closeSettings() {
        document.getElementById('settings-panel').classList.remove('active');
    }

    // Load current settings into form
    loadSettingsValues() {
        document.getElementById('speech-rate').value = this.settings.speechRate;
        document.getElementById('rate-value').textContent = this.settings.speechRate;
        
        document.getElementById('speech-volume').value = this.settings.speechVolume;
        document.getElementById('volume-value').textContent = Math.round(this.settings.speechVolume * 100) + '%';
        
        document.getElementById('high-contrast').checked = this.settings.highContrast;
        document.getElementById('large-icons').checked = this.settings.largeIcons;
        document.getElementById('sound-feedback').checked = this.settings.soundFeedback;
    }

    // Switch settings tab
    switchTab(tabName) {
        // Check permissions for users tab
        if (tabName === 'users') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || currentUser.type !== 'admin') {
                alert('Acesso negado. Apenas administradores podem gerenciar usuários.');
                return;
            }
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load tab-specific content
        if (tabName === 'icons') {
            this.loadIconsManagement();
        } else if (tabName === 'users') {
            this.loadUsersList();
        }
    }

    // Apply settings to UI
    applySettings() {
        const body = document.body;
        
        // High contrast
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        // Large icons
        if (this.settings.largeIcons) {
            body.classList.add('large-icons');
        } else {
            body.classList.remove('large-icons');
        }
    }

    // Icon management
    loadIconsManagement() {
        const iconsList = document.getElementById('icons-list');
        iconsList.innerHTML = '';
        
        Object.entries(this.icons).forEach(([category, icons]) => {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `
                <h4>${this.getCategoryDisplayName(category)}</h4>
                <div class="category-icons"></div>
            `;
            
            const iconsContainer = categorySection.querySelector('.category-icons');
            
            icons.forEach(icon => {
                const iconItem = document.createElement('div');
                iconItem.className = 'icon-item';
                iconItem.innerHTML = `
                    <span class="icon-preview">${icon.emoji}</span>
                    <span class="icon-label">${icon.text}</span>
                    <button class="delete-icon-btn" onclick="app.deleteIcon(${icon.id})">🗑️</button>
                `;
                iconsContainer.appendChild(iconItem);
            });
            
            iconsList.appendChild(categorySection);
        });
    }

    // Add new icon modal
    openAddIconModal() {
        document.getElementById('add-icon-modal').classList.remove('hidden');
    }

    closeAddIconModal() {
        document.getElementById('add-icon-modal').classList.add('hidden');
        document.getElementById('add-icon-form').reset();
    }

    // Add new icon
    addNewIcon() {
        const category = document.getElementById('icon-category').value;
        const text = document.getElementById('icon-text').value;
        const emoji = document.getElementById('icon-emoji').value;
        
        if (!category || !text || !emoji) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        const newIcon = {
            id: Date.now(),
            emoji: emoji,
            text: text,
            category: category
        };
        
        if (!this.icons[category]) {
            this.icons[category] = [];
        }
        
        this.icons[category].push(newIcon);
        this.saveIcons();
        
        // Refresh current view if needed
        if (this.currentCategory === category) {
            this.loadCategoryIcons();
        }
        
        // Refresh icons management if open
        this.loadIconsManagement();
        
        this.closeAddIconModal();
        
        alert('Ícone adicionado com sucesso!');
    }

    // Delete icon
    deleteIcon(iconId) {
        if (confirm('Tem certeza que deseja excluir este ícone?')) {
            Object.keys(this.icons).forEach(category => {
                this.icons[category] = this.icons[category].filter(icon => icon.id !== iconId);
            });
            
            this.saveIcons();
            this.loadCategoryIcons();
            this.loadIconsManagement();
        }
    }

    // Export usage report
    exportReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            dailyUsage: this.usage.daily,
            weeklyUsage: this.usage.weekly,
            categoryUsage: this.usage.categories,
            totalIcons: Object.values(this.icons).flat().length
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `conecta-autismo-relatorio-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // Show FAQ
    showFAQ() {
        const faqContent = `
        <h3>Perguntas Frequentes</h3>
        
        <h4>Como adicionar novos ícones?</h4>
        <p>Vá em Configurações > Ícones > Adicionar Novo Ícone. Escolha a categoria, digite o texto e selecione um emoji.</p>
        
        <h4>Como ajustar a velocidade da voz?</h4>
        <p>Vá em Configurações > Voz e ajuste o controle de velocidade da fala.</p>
        
        <h4>Como ativar o modo de alto contraste?</h4>
        <p>Vá em Configurações > Acessibilidade e ative a opção "Alto Contraste".</p>
        
        <h4>Como ver os relatórios de uso?</h4>
        <p>Vá em Configurações > Relatórios para ver estatísticas de uso da criança.</p>
        
        <h4>O app funciona offline?</h4>
        <p>Sim! Após o primeiro carregamento, o app funciona completamente offline.</p>
        `;
        
        alert(faqContent);
    }

    // User Management Methods
    openAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
    }

    closeAddUserModal() {
        document.getElementById('add-user-modal').classList.add('hidden');
        document.getElementById('add-user-form').reset();
    }

    handleCreateUser() {
        const name = document.getElementById('user-name').value.trim();
        const username = document.getElementById('user-username').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const confirmPassword = document.getElementById('user-confirm-password').value;
        const userType = document.getElementById('user-type').value;

        // Validações
        if (!name || !username || !password || !confirmPassword) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Verificar se o usuário já existe
        const users = this.loadUsers();
        if (users.find(user => user.username === username)) {
            alert('Nome de usuário já existe. Escolha outro.');
            return;
        }

        // Criar novo usuário
        const newUser = {
            id: Date.now().toString(),
            name: name,
            username: username,
            email: email,
            password: password,
            type: userType,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        users.push(newUser);
        this.saveUsers(users);

        alert('Usuário criado com sucesso!');
        this.closeAddUserModal();
        this.loadUsersList();
    }

    loadUsersList() {
        const usersList = document.getElementById('users-list');
        const users = this.loadUsers();
        
        if (users.length === 0) {
            usersList.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>@${user.username}</p>
                    <p>Tipo: ${user.type === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    <p>Status: ${user.isActive ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div class="user-actions">
                    <button onclick="app.editUser('${user.id}')" class="btn-edit">✏️ Editar</button>
                    <button onclick="app.toggleUserStatus('${user.id}')" class="btn-toggle">
                        ${user.isActive ? '🚫 Desativar' : '✅ Ativar'}
                    </button>
                    <button onclick="app.deleteUser('${user.id}')" class="btn-delete">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');
    }

    editUser(userId) {
        // Implementar edição de usuário
        alert('Funcionalidade de edição será implementada em breve.');
    }

    toggleUserStatus(userId) {
        const users = this.loadUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            user.isActive = !user.isActive;
            this.saveUsers(users);
            this.loadUsersList();
            alert(`Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso!`);
        }
    }

    deleteUser(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            const users = this.loadUsers();
            const filteredUsers = users.filter(u => u.id !== userId);
            this.saveUsers(filteredUsers);
            this.loadUsersList();
            alert('Usuário excluído com sucesso!');
        }
    }

    // Play click sound (simple beep)
    playClickSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Global functions for HTML onclick handlers
function closeAddIconModal() {
    app.closeAddIconModal();
}

function closeAddUserModal() {
    if (window.app) {
        window.app.closeAddUserModal();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConectaAutismo();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}