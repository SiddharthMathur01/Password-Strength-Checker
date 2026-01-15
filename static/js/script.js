// static/js/script.js - Neumorphism Password Strength Checker with JSON API Integration
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
        
        // Add soft press effects to inputs
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
        // Add hover effects to all neumorphic elements
        const neuElements = document.querySelectorAll('.neu-icon');
        neuElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
        
        // Add ambient light effect on mouse move
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
        
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
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
        
        // Add gentle shake animation
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
            // Step 1: Read password value from input field
            const password = this.passwordInput.value;
            
            // Step 2: Call Flask JSON API to validate password strength using predict_password function
            const response = await fetch('/check-strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });
            
            // Parse JSON response from API
            const result = await response.json();
            
            // Check if API call was successful
            if (!result.success) {
                throw new Error(result.error || 'Failed to check password strength');
            }
            
            // Step 3: Display result in existing success message element
            // result contains: prediction_class (0=Weak, 1=Medium, 2=Strong), strength, confidence
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
        // Map prediction class to colors and icons
        const strengthMap = {
            0: { label: 'Weak', color: '#ff3b5c', icon: 'warning' },
            1: { label: 'Medium', color: '#ffa726', icon: 'shield' },
            2: { label: 'Strong', color: '#00c896', icon: 'check' }
        };
        
        const predictionClass = result.prediction_class;
        const strength = strengthMap[predictionClass] || strengthMap[1];
        const confidencePercent = (result.confidence * 100).toFixed(1);
        
        // Soft fade out form
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        // Hide the "Please Enter password to continue" text
        const headerText = document.querySelector('.login-header p');
        if (headerText) {
            headerText.style.opacity = '0';
            headerText.style.transform = 'translateY(-10px)';
        }
        
        setTimeout(() => {
            this.form.style.display = 'none';
            if (headerText) {
                headerText.style.display = 'none';
            }
            
            // Step 4: Update success message with strength result and themed icon
            const successIcon = this.successMessage.querySelector('.success-icon');
            const successTitle = this.successMessage.querySelector('h3');
            const successText = this.successMessage.querySelector('p');
            
            // Update icon color to match strength
            successIcon.style.color = strength.color;
            
            // Update icon SVG based on strength (theme-matching shield icons with proper sizing)
            const iconSvg = successIcon.querySelector('svg');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('stroke-width', '2');
            iconSvg.setAttribute('stroke-linecap', 'round');
            iconSvg.setAttribute('stroke-linejoin', 'round');
            
            if (strength.icon === 'warning') {
                // Warning shield for weak passwords
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
                `;
            } else if (strength.icon === 'shield') {
                // Shield with exclamation for medium passwords
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
                `;
            } else {
                // Shield with checkmark for strong passwords
                iconSvg.innerHTML = `
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 11 12 14 16 10"/>
                `;
            }
            
            // Update text content with detailed results
            successTitle.textContent = `${strength.label} Password!`;
            successTitle.style.color = strength.color;
            successText.textContent = `Your password strength is ${result.strength.toLowerCase()} (${confidencePercent}% confidence).`;
            
            // Show success message with animation
            this.successMessage.classList.add('show');
            
            // Animate success icon
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