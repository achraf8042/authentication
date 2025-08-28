/**
 * Modern Authentication Pages JavaScript
 * Handles form validation, interactivity, and user experience enhancements
 */

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function to limit the rate of function execution
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('authToast');
    const toastBody = toast.querySelector('.toast-body');
    const toastHeader = toast.querySelector('.toast-header');
    const icon = toastHeader.querySelector('i');
    
    // Update toast content
    toastBody.textContent = message;
    
    // Update icon based on type
    icon.className = `bi me-2`;
    switch (type) {
        case 'success':
            icon.classList.add('bi-check-circle-fill', 'text-success');
            break;
        case 'error':
            icon.classList.add('bi-exclamation-triangle-fill', 'text-danger');
            break;
        case 'warning':
            icon.classList.add('bi-exclamation-circle-fill', 'text-warning');
            break;
        default:
            icon.classList.add('bi-info-circle-fill', 'text-primary');
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

/**
 * Add loading state to button
 */
function setButtonLoading(button, loading = true) {
    const btnText = button.querySelector('.btn-text');
    const btnSpinner = button.querySelector('.btn-spinner');
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        btnText.style.opacity = '0';
        btnSpinner.classList.remove('d-none');
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        btnText.style.opacity = '1';
        btnSpinner.classList.add('d-none');
    }
}

// ===== PASSWORD VISIBILITY TOGGLE =====

/**
 * Initialize password visibility toggles
 */
function initPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
                this.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
                this.setAttribute('aria-label', 'Show password');
            }
        });
    });
}

// ===== PASSWORD STRENGTH INDICATOR =====

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 25;
    else feedback.push('At least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('One uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('One lowercase letter');
    
    // Number or special character check
    if (/[\d\W]/.test(password)) score += 25;
    else feedback.push('One number or special character');
    
    // Determine strength level
    let strength = 'weak';
    if (score >= 75) strength = 'strong';
    else if (score >= 50) strength = 'medium';
    
    return { score, strength, feedback };
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(passwordInput) {
    const strengthContainer = document.querySelector('.password-strength');
    const strengthText = strengthContainer?.querySelector('.strength-text');
    const progressBar = strengthContainer?.querySelector('.progress-bar');
    
    if (!strengthContainer) return;
    
    const password = passwordInput.value;
    
    if (password.length === 0) {
        strengthContainer.style.display = 'none';
        return;
    }
    
    strengthContainer.style.display = 'block';
    
    const { score, strength } = calculatePasswordStrength(password);
    
    // Update text
    strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
    strengthText.className = `strength-text ${strength}`;
    
    // Update progress bar
    progressBar.style.width = `${score}%`;
    progressBar.className = `progress-bar ${strength}`;
}

// ===== FORM VALIDATION =====

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
    return password.length >= 8;
}

/**
 * Validate form field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldId = field.id;
    let isValid = true;
    let message = '';
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required.';
    }
    
    // Specific validation based on field type/id
    if (value && fieldType === 'email') {
        if (!isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address.';
        }
    }
    
    if (value && fieldId === 'password') {
        if (!isValidPassword(value)) {
            isValid = false;
            message = 'Password must be at least 8 characters long.';
        }
    }
    
    if (value && fieldId === 'confirmPassword') {
        const passwordField = document.getElementById('password');
        if (passwordField && value !== passwordField.value) {
            isValid = false;
            message = 'Passwords do not match.';
        }
    }
    
    // Update field appearance
    field.classList.remove('is-valid', 'is-invalid');
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    
    if (isValid && value) {
        field.classList.add('is-valid');
    } else if (!isValid) {
        field.classList.add('is-invalid');
        if (feedback) feedback.textContent = message;
    }
    
    return isValid;
}

/**
 * Validate entire form
 */
function validateForm(form) {
    const fields = form.querySelectorAll('input[required], input[type="email"]');
    let isFormValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Special validation for terms checkbox
    const termsCheckbox = form.querySelector('#agreeTerms');
    if (termsCheckbox && !termsCheckbox.checked) {
        termsCheckbox.classList.add('is-invalid');
        isFormValid = false;
    } else if (termsCheckbox) {
        termsCheckbox.classList.remove('is-invalid');
    }
    
    return isFormValid;
}

// ===== FORM SUBMISSION =====

/**
 * Handle login form submission
 */
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.auth-submit-btn');
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Please fix the errors in the form.', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Get form data
    const formData = new FormData(form);
    const email = formData.get('email') || form.querySelector('#email').value;
    const password = formData.get('password') || form.querySelector('#password').value;
    const rememberMe = form.querySelector('#rememberMe').checked;
    
    // Simulate API call
    setTimeout(() => {
        setButtonLoading(submitBtn, false);
        
        // Demo: Always show success for demo purposes
        showToast('Login successful! Redirecting...', 'success');
        
        // In a real application, you would:
        // 1. Send credentials to your authentication API
        // 2. Handle the response (success/error)
        // 3. Redirect on success or show error message
        
        setTimeout(() => {
            // Simulate redirect
            console.log('Redirecting to dashboard...');
        }, 1500);
        
    }, 2000); // Simulate network delay
}

/**
 * Handle register form submission
 */
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.auth-submit-btn');
    
    // Validate form
    if (!validateForm(form)) {
        showToast('Please fix the errors in the form.', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Get form data
    const firstName = form.querySelector('#firstName').value;
    const lastName = form.querySelector('#lastName').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const newsletter = form.querySelector('#newsletter').checked;
    
    // Simulate API call
    setTimeout(() => {
        setButtonLoading(submitBtn, false);
        
        // Demo: Always show success for demo purposes
        showToast('Account created successfully! Please check your email to verify your account.', 'success');
        
        // In a real application, you would:
        // 1. Send registration data to your API
        // 2. Handle the response (success/error)
        // 3. Show appropriate message and redirect
        
        setTimeout(() => {
            // Simulate redirect to login
            window.location.href = 'login.html';
        }, 2000);
        
    }, 2500); // Simulate network delay
}

// ===== SOCIAL LOGIN =====

/**
 * Handle social login
 */
function handleSocialLogin(provider) {
    showToast(`Redirecting to ${provider}...`, 'info');
    
    // In a real application, you would redirect to the OAuth provider
    setTimeout(() => {
        console.log(`Redirecting to ${provider} OAuth...`);
        // window.location.href = `https://oauth.${provider.toLowerCase()}.com/...`;
    }, 1000);
}

// ===== INITIALIZATION =====

/**
 * Initialize the authentication pages
 */
function initAuthPages() {
    // Initialize password toggles
    initPasswordToggles();
    
    // Initialize form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => validateField(input));
            
            // Clear validation on focus
            input.addEventListener('focus', () => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
            // Password strength indicator
            if (input.id === 'password' && document.querySelector('.password-strength')) {
                const debouncedStrengthCheck = debounce(() => updatePasswordStrength(input), 300);
                input.addEventListener('input', debouncedStrengthCheck);
            }
            
            // Confirm password validation
            if (input.id === 'confirmPassword') {
                const passwordField = document.getElementById('password');
                if (passwordField) {
                    const validateConfirmPassword = () => validateField(input);
                    input.addEventListener('input', debounce(validateConfirmPassword, 300));
                    passwordField.addEventListener('input', debounce(validateConfirmPassword, 300));
                }
            }
        });
    });
    
    // Initialize form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Initialize social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.textContent.includes('Google') ? 'Google' : 'Facebook';
            handleSocialLogin(provider);
        });
    });
    
    // Initialize terms checkbox validation
    const termsCheckbox = document.getElementById('agreeTerms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            if (termsCheckbox.checked) {
                termsCheckbox.classList.remove('is-invalid');
            }
        });
    }
    
    // Add smooth scrolling for mobile keyboards
    if (window.innerWidth <= 768) {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }
    
    // Initialize tooltips if any
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    console.log('Authentication pages initialized successfully!');
}

// ===== EVENT LISTENERS =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthPages);

// Handle window resize for responsive adjustments
window.addEventListener('resize', debounce(() => {
    // Recalculate any responsive elements if needed
    console.log('Window resized, adjusting responsive elements...');
}, 250));

// Handle page visibility change (for security)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - could implement security measures
        console.log('Page hidden - implementing security measures...');
    } else {
        // Page is visible again
        console.log('Page visible again...');
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        isValidPassword,
        calculatePasswordStrength,
        validateField,
        validateForm
    };
}

