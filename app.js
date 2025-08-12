// House Price Prediction App
class HousePricePrediction {
    constructor() {
        this.form = document.getElementById('predictionForm');
        this.resultsSection = document.getElementById('resultsSection');
        this.predictedPriceElement = document.getElementById('predictedPrice');
        this.predictBtn = document.querySelector('.predict-btn');
        this.btnText = document.querySelector('.btn-text');
        this.btnLoader = document.querySelector('.btn-loader');
        
        this.init();
    }

    init() {
        // Wait a bit for DOM to be fully loaded
        setTimeout(() => {
            this.attachEventListeners();
            this.setupFormValidation();
        }, 100);
    }

    attachEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Predict button direct click handler (in case form submit doesn't work)
        if (this.predictBtn) {
            this.predictBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }
        
        // Search functionality
        const searchBtn = document.querySelector('.search-btn');
        const searchInput = document.querySelector('.search-input');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(searchInput.value);
                }
            });
        }
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.textContent);
            });
        });
        
        // Header My Predictions button
        const headerBtn = document.querySelector('.header-btn');
        if (headerBtn) {
            headerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMyPredictions();
            });
        }
        
        // Setup event delegation for dynamically added buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('new-prediction-btn')) {
                e.preventDefault();
                this.startNewPrediction();
            } else if (e.target.classList.contains('save-prediction-btn')) {
                e.preventDefault();
                this.savePrediction();
            }
        });
    }

    setupFormValidation() {
        // Add change listeners to all form controls
        const formControls = this.form.querySelectorAll('input, select');
        formControls.forEach(control => {
            control.addEventListener('change', () => {
                this.clearFieldError(control);
            });
            
            control.addEventListener('input', () => {
                this.clearFieldError(control);
            });
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        console.log('Form submit triggered'); // Debug log
        
        if (!this.validateForm()) {
            console.log('Form validation failed'); // Debug log
            return;
        }
        
        const formData = this.getFormData();
        console.log('Form data:', formData); // Debug log
        
        // Show loading state
        this.showLoading();
        
        try {
            // Simulate prediction API call
            const prediction = await this.simulatePrediction(formData);
            console.log('Prediction result:', prediction); // Debug log
            
            // Hide loading and show results
            this.hideLoading();
            this.showResults(prediction);
            
        } catch (error) {
            console.error('Prediction error:', error); // Debug log
            this.hideLoading();
            this.showError('Prediction failed. Please try again.');
        }
    }

    validateForm() {
        const requiredFields = [
            'area', 'bedrooms', 'bathrooms', 'stories', 'mainroad',
            'guestroom', 'basement', 'hotwaterheating', 'airconditioning',
            'parking', 'prefarea', 'furnishingstatus'
        ];
        
        let isValid = true;
        
        // Clear existing error messages
        this.clearErrorMessages();
        
        for (const fieldName of requiredFields) {
            if (fieldName === 'furnishingstatus') {
                const radioButtons = this.form.querySelectorAll(`[name="${fieldName}"]`);
                const isChecked = Array.from(radioButtons).some(radio => radio.checked);
                
                if (!isChecked) {
                    this.showFieldError(fieldName, 'Please select furnishing status');
                    isValid = false;
                }
            } else {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                if (!field || !field.value.trim()) {
                    this.showFieldError(fieldName, `Please select ${this.getFieldLabel(fieldName)}`);
                    isValid = false;
                }
            }
        }
        
        // Validate area range
        const areaField = this.form.querySelector('[name="area"]');
        if (areaField && areaField.value) {
            const area = parseInt(areaField.value);
            if (area < 1000 || area > 20000) {
                this.showFieldError('area', 'Area must be between 1,000 and 20,000 sq ft');
                isValid = false;
            }
        }
        
        return isValid;
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    async simulatePrediction(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        
        // Calculate predicted price based on form data
        const basePrice = this.calculateBasePrice(formData);
        
        return {
            price: basePrice,
            confidence: 0.85 + Math.random() * 0.1,
            factors: this.getMainFactors(formData)
        };
    }

    calculateBasePrice(data) {
        let price = 0;
        
        // Base price from area (₹500-800 per sq ft depending on features)
        const area = parseInt(data.area);
        let pricePerSqFt = 500;
        
        // Adjust price per sq ft based on features
        if (data.prefarea === 'yes') pricePerSqFt += 150;
        if (data.mainroad === 'yes') pricePerSqFt += 100;
        if (data.basement === 'yes') pricePerSqFt += 50;
        if (data.hotwaterheating === 'yes') pricePerSqFt += 25;
        if (data.airconditioning === 'yes') pricePerSqFt += 75;
        if (data.guestroom === 'yes') pricePerSqFt += 50;
        
        price = area * pricePerSqFt;
        
        // Adjust for bedrooms/bathrooms
        const bedrooms = parseInt(data.bedrooms);
        const bathrooms = parseInt(data.bathrooms);
        price += (bedrooms - 1) * 100000;
        price += (bathrooms - 1) * 150000;
        
        // Adjust for stories
        const stories = parseInt(data.stories);
        if (stories > 1) {
            price += (stories - 1) * 200000;
        }
        
        // Adjust for parking
        const parking = parseInt(data.parking);
        price += parking * 100000;
        
        // Adjust for furnishing
        if (data.furnishingstatus === 'furnished') {
            price += 500000;
        } else if (data.furnishingstatus === 'semi-furnished') {
            price += 250000;
        }
        
        // Add some randomness (±10%)
        const variation = 0.9 + Math.random() * 0.2;
        price = Math.round(price * variation);
        
        return price;
    }

    getMainFactors(data) {
        const factors = [];
        
        if (data.prefarea === 'yes') factors.push('Premium location');
        if (data.mainroad === 'yes') factors.push('Main road access');
        if (parseInt(data.bedrooms) >= 4) factors.push('Spacious layout');
        if (data.basement === 'yes') factors.push('Basement included');
        if (data.furnishingstatus === 'furnished') factors.push('Fully furnished');
        
        return factors.slice(0, 3);
    }

    showLoading() {
        if (this.predictBtn && this.btnText && this.btnLoader) {
            this.predictBtn.disabled = true;
            this.btnText.classList.add('hidden');
            this.btnLoader.classList.remove('hidden');
        }
    }

    hideLoading() {
        if (this.predictBtn && this.btnText && this.btnLoader) {
            this.predictBtn.disabled = false;
            this.btnText.classList.remove('hidden');
            this.btnLoader.classList.add('hidden');
        }
    }

    showResults(prediction) {
        // Format price in Indian currency
        const formattedPrice = this.formatPrice(prediction.price);
        if (this.predictedPriceElement) {
            this.predictedPriceElement.textContent = formattedPrice;
        }
        
        // Show results section
        if (this.resultsSection) {
            this.resultsSection.classList.remove('hidden');
            
            // Smooth scroll to results
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Add success animation
            this.resultsSection.style.opacity = '0';
            this.resultsSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.resultsSection.style.transition = 'all 0.5s ease';
                this.resultsSection.style.opacity = '1';
                this.resultsSection.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    formatPrice(price) {
        // Convert to Indian currency format
        const crores = price / 10000000;
        const lakhs = (price % 10000000) / 100000;
        
        if (crores >= 1) {
            if (lakhs > 0) {
                return `₹${crores.toFixed(1)} Cr`;
            } else {
                return `₹${Math.round(crores)} Cr`;
            }
        } else if (lakhs >= 1) {
            return `₹${Math.round(lakhs)} Lakh`;
        } else {
            return `₹${price.toLocaleString('en-IN')}`;
        }
    }

    startNewPrediction() {
        // Reset form
        if (this.form) {
            this.form.reset();
        }
        
        // Hide results
        if (this.resultsSection) {
            this.resultsSection.classList.add('hidden');
        }
        
        // Clear any error messages
        this.clearErrorMessages();
        
        // Scroll to form
        if (this.form) {
            this.form.scrollIntoView({ behavior: 'smooth' });
            
            // Focus on first input
            const firstInput = this.form.querySelector('input, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 500);
            }
        }
    }

    savePrediction() {
        const saveBtn = document.querySelector('.save-prediction-btn');
        if (!saveBtn) return;
        
        const originalText = saveBtn.textContent;
        
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.textContent = '✓ Saved to Wishlist';
            saveBtn.style.backgroundColor = '#28a745';
            saveBtn.style.borderColor = '#28a745';
            saveBtn.style.color = 'white';
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                saveBtn.style.backgroundColor = '';
                saveBtn.style.borderColor = '';
                saveBtn.style.color = '';
            }, 2000);
        }, 1000);
    }

    handleSearch(query) {
        if (query.trim()) {
            this.showNotification(`Searching for "${query}"...`, 'info');
            
            // Simulate search delay
            setTimeout(() => {
                this.showNotification(`Found 0 results for "${query}". This is a demo interface.`, 'info');
            }, 1000);
        }
    }

    handleNavigation(linkText) {
        this.showNotification(`Navigating to ${linkText}... This is a demo interface.`, 'info');
    }

    handleMyPredictions() {
        this.showNotification('Opening My Predictions... This is a demo interface.', 'info');
    }

    showFieldError(fieldName, message) {
        let field;
        
        if (fieldName === 'furnishingstatus') {
            field = this.form.querySelector('.radio-group').parentElement;
        } else {
            const inputField = this.form.querySelector(`[name="${fieldName}"]`);
            field = inputField ? inputField.parentElement : null;
        }
        
        if (!field) return;
        
        // Remove existing error
        const existingError = field.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.appendChild(errorDiv);
        
        // Add error styling to field
        const inputField = field.querySelector('input, select');
        if (inputField) {
            inputField.style.borderColor = 'var(--color-error)';
        }
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
            field.style.borderColor = '';
        }
    }

    clearErrorMessages() {
        if (this.form) {
            const errorMessages = this.form.querySelectorAll('.error-message');
            errorMessages.forEach(error => error.remove());
            
            const fields = this.form.querySelectorAll('input, select');
            fields.forEach(field => {
                field.style.borderColor = '';
            });
        }
    }

    getFieldLabel(fieldName) {
        const labels = {
            'area': 'area',
            'bedrooms': 'number of bedrooms',
            'bathrooms': 'number of bathrooms',
            'stories': 'number of stories',
            'mainroad': 'main road access',
            'guestroom': 'guest room option',
            'basement': 'basement option',
            'hotwaterheating': 'hot water heating option',
            'airconditioning': 'air conditioning option',
            'parking': 'parking spaces',
            'prefarea': 'preferred area option'
        };
        
        return labels[fieldName] || fieldName;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const colors = {
            error: '#dc3545',
            success: '#28a745',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...'); // Debug log
    
    // Small delay to ensure all elements are ready
    setTimeout(() => {
        const app = new HousePricePrediction();
        
        // Additional enhancements
        setupAdditionalFeatures();
    }, 200);
});

function setupAdditionalFeatures() {
    // Add focus effects to form controls
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.classList.add('focused');
            }
        });
        
        control.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0px)';
        });
    });
}