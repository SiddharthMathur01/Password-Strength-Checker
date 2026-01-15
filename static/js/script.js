class NeumorphismLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.login-btn');
        this.successMessage = document.getElementById('successMessage');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupNeumorphicEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        this.passwordInput.addEventListener('focus', (e) => this.addSoftPress(e));
        this.passwordInput.addEventListener('blur', (e) => this.removeSoftPress(e));
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (this.passwordInput.type === 'password') {
                this.passwordInput.type = 'text';
                this.passwordToggle.classList.add('show-password');
            } else {
                this.passwordInput.type = 'password';
                this.passwordToggle.classList.remove('show-password');
            }
        });
    }
    
    setupNeumorphicEffects() {
        const neuElements = document.querySelectorAll('.neu-icon');
        neuElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
        document.addEventListener('mousemove', (e) => {
            this.updateAmbientLight(e);
        });
    }
    
    updateAmbientLight(e) {
        const card = document.querySelector('.login-card');
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (x - centerX) / centerX;
        const angleY = (y - centerY) / centerY;
        
        const shadowX = angleX * 30;
        const shadowY = angleY * 30;
        
        card.style.boxShadow = `
            ${shadowX}px ${shadowY}px 60px #bec3cf,
            ${-shadowX}px ${-shadowY}px 60px #ffffff
        `;
    }
    
    addSoftPress(e) {
        const inputGroup = e.target.closest('.neu-input');
        inputGroup.style.transform = 'scale(0.98)';
    }
    
    removeSoftPress(e) {
        const inputGroup = e.target.closest('.neu-input');
        inputGroup.style.transform = 'scale(1)';
    }
    
    animateSoftPress(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
          
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        const input = document.getElementById(field);
        input.style.animation = 'gentleShake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    clearError(field) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        
        formGroup.classList.remove('error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 300);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isPasswordValid = this.validatePassword();
        
        if (!isPasswordValid) {
            this.animateSoftPress(this.submitButton);
            return;
        }
        
        this.setLoading(true);
        
        try {
            const password = this.passwordInput.value;
            const response = await fetch('/check-strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to check password strength');
            }

            this.showPasswordStrengthResult(result);
            
        } catch (error) {
            console.error('Password strength check error:', error);
            this.showError('password', 'Check failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
    }
    
    showPasswordStrengthResult(result) {
        const strengthMap = {
            0: { label: 'Very Weak', color: '#d32f2f', icon: 'critical' },
            1: { label: 'Weak', color: '#ff3b5c', icon: 'warning' },
            2: { label: 'Medium', color: '#ffa726', icon: 'shield' },
            3: { label: 'Strong', color: '#00c896', icon: 'good' },
            4: { label: 'Very Strong', color: '#00a850', icon: 'excellent' }
        };
        
        const predictionClass = result.prediction_class;
        const strength = strengthMap[predictionClass] || strengthMap[1];
        const confidencePercent = (result.confidence * 100).toFixed(1);
        
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        const headerText = document.querySelector('.login-header p');
        const upperLogo = document.querySelector('.login-header .neu-icon');
        
        if (headerText) {
            headerText.style.opacity = '0';
            headerText.style.transform = 'translateY(-10px)';
        }
        
        if (upperLogo) {
            upperLogo.style.opacity = '0';
            upperLogo.style.transform = 'scale(0.8)';
        }
        
        setTimeout(() => {
            this.form.style.display = 'none';
            if (headerText) {
                headerText.style.display = 'none';
            }
            if (upperLogo) {
                upperLogo.style.display = 'none';
            }
            
            const successIcon = this.successMessage.querySelector('.success-icon');
            const successTitle = this.successMessage.querySelector('h3');
            const successText = this.successMessage.querySelector('p');
            
            successIcon.style.color = strength.color;
            
            const iconSvg = successIcon.querySelector('svg');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('stroke-width', '2');
            iconSvg.setAttribute('stroke-linecap', 'round');
            iconSvg.setAttribute('stroke-linejoin', 'round');
            
            if (strength.icon === 'critical') {
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="9" y1="10" x2="15" y2="16"/>
                    <line x1="15" y1="10" x2="9" y2="16"/>
                `;
            } else if (strength.icon === 'warning') {
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
                `;
            } else if (strength.icon === 'shield') {
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
                `;
            } else if (strength.icon === 'good') {
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 11 12 14 16 10"/>
                `;
            } else {
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="8 12 11 15 16 9"/>
                `;
            }
            successTitle.textContent = `${strength.label} Password!`;
            successTitle.style.color = strength.color;
            successText.textContent = result.feedback || `Your password strength is ${result.strength.toLowerCase()}.`;
            
            this.successMessage.classList.add('show');
            
            successIcon.style.animation = 'successPulse 0.6s ease-out';
            
        }, 300);
    }
}

// Add custom animations
if (!document.querySelector('#neu-keyframes')) {
    const style = document.createElement('style');
    style.id = 'neu-keyframes';
    style.textContent = `
        @keyframes gentleShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        
        @keyframes successPulse {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeumorphismLoginForm();
});