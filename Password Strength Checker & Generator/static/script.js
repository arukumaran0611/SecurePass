// DOM elements
const passwordInput = document.getElementById('passwordInput');
const checkBtn = document.getElementById('checkBtn');
const togglePassword = document.getElementById('togglePassword');
const strengthResult = document.getElementById('strengthResult');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthPercentage = document.getElementById('strengthPercentage');
const strengthDetails = document.getElementById('strengthDetails');
const breachResult = document.getElementById('breachResult');

const passwordLength = document.getElementById('passwordLength');
const lengthValue = document.getElementById('lengthValue');
const includeSymbols = document.getElementById('includeSymbols');
const includeNumbers = document.getElementById('includeNumbers');
const generateBtn = document.getElementById('generateBtn');
const generatedPassword = document.getElementById('generatedPassword');
const generatedPasswordInput = document.getElementById('generatedPasswordInput');
const copyBtn = document.getElementById('copyBtn');

const passwordHistory = document.getElementById('passwordHistory');
const clearHistory = document.getElementById('clearHistory');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');

// Password length slider
passwordLength.addEventListener('input', function() {
    lengthValue.textContent = this.value;
});

// Toggle password visibility
function togglePasswordVisibility() {
    const eyeIcon = togglePassword.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
        togglePassword.title = 'Hide password';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
        togglePassword.title = 'Show password';
    }
}

// Check password strength
async function checkPasswordStrength() {
    const password = passwordInput.value.trim();
    
    if (!password) {
        alert('Please enter a password to check');
        return;
    }
    
    // Show loading state
    checkBtn.textContent = 'Checking...';
    checkBtn.disabled = true;
    
    try {
        const response = await fetch('/check_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayStrengthResult(data.strength, data.breach, data.ai_suggestions, password);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while checking the password');
    } finally {
        checkBtn.textContent = 'Check Strength';
        checkBtn.disabled = false;
    }
}

// Display strength result
function displayStrengthResult(strengthData, breachData, aiSuggestions, password) {
    // Update strength cards
    const weakCard = document.getElementById('weakCard');
    const mediumCard = document.getElementById('mediumCard');
    const strongCard = document.getElementById('strongCard');
    
    // Remove active class from all cards
    weakCard.classList.remove('active');
    mediumCard.classList.remove('active');
    strongCard.classList.remove('active');
    
    // Add active class to the appropriate card
    const strength = strengthData.strength.toLowerCase();
    if (strength === 'weak') {
        weakCard.classList.add('active');
    } else if (strength === 'medium') {
        mediumCard.classList.add('active');
    } else if (strength === 'strong') {
        strongCard.classList.add('active');
    }
    
    // Update strength bar and text
    strengthBar.className = 'strength-fill ' + strengthData.strength.toLowerCase();
    strengthText.textContent = strengthData.strength;
    
    // Update strength percentage
    const percentage = Math.round((strengthData.score / strengthData.max_score) * 100);
    strengthPercentage.textContent = `${percentage}%`;
    
    // Add to password history
    addToHistory(password, strengthData.strength);
    
    // Update strength details
    strengthDetails.innerHTML = '';
    if (strengthData.feedback.length > 0) {
        const ul = document.createElement('ul');
        strengthData.feedback.forEach(feedback => {
            const li = document.createElement('li');
            li.textContent = feedback;
            li.className = 'invalid';
            ul.appendChild(li);
        });
        strengthDetails.appendChild(ul);
    } else {
        const p = document.createElement('p');
        p.textContent = 'Your password meets all security requirements!';
        p.style.color = '#34c759';
        p.style.fontWeight = '500';
        strengthDetails.appendChild(p);
    }
    
    // Add AI suggestions if available
    if (aiSuggestions && aiSuggestions.length > 0) {
        const aiSection = document.createElement('div');
        aiSection.className = 'ai-suggestions';
        aiSection.innerHTML = '<h4>🤖 AI Security Tips:</h4>';
        
        const aiList = document.createElement('ul');
        aiSuggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.style.color = '#666666';
            li.style.fontSize = '14px';
            li.style.marginBottom = '8px';
            aiList.appendChild(li);
        });
        
        aiSection.appendChild(aiList);
        strengthDetails.appendChild(aiSection);
    }
    
    // Update breach result
    breachResult.innerHTML = '';
    breachResult.className = 'breach-result';
    
    if (breachData.error) {
        breachResult.className += ' safe';
        breachResult.innerHTML = '⚠️ Unable to check breach status: ' + breachData.error;
    } else if (breachData.breached) {
        breachResult.className += ' breached';
        breachResult.innerHTML = `🚨 This password has been found in ${breachData.count.toLocaleString()} data breaches. Please use a different password.`;
    } else {
        breachResult.className += ' safe';
        breachResult.innerHTML = '✅ This password has not been found in any known data breaches.';
    }
    
    // Show result
    strengthResult.classList.remove('hidden');
}

// Generate password
async function generatePassword() {
    const length = parseInt(passwordLength.value);
    const symbols = includeSymbols.checked;
    const numbers = includeNumbers.checked;
    
    // Show loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    try {
        const response = await fetch('/generate_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                length: length,
                include_symbols: symbols,
                include_numbers: numbers
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            generatedPasswordInput.value = data.password;
            generatedPassword.classList.remove('hidden');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the password');
    } finally {
        generateBtn.textContent = 'Generate Password';
        generateBtn.disabled = false;
    }
}

// Password History Functions
function addToHistory(password, strength) {
    if (!password || password.length === 0) return;
    
    // Get existing history
    let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    // Add new entry
    const entry = {
        password: password,
        strength: strength,
        timestamp: new Date().toISOString()
    };
    
    // Remove duplicates
    history = history.filter(item => item.password !== password);
    
    // Add to beginning
    history.unshift(entry);
    
    // Keep only last 10 entries
    history = history.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    
    // Update display
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    if (history.length === 0) {
        passwordHistory.innerHTML = '<p class="no-history">No passwords checked yet</p>';
        return;
    }
    
    passwordHistory.innerHTML = history.map(entry => {
        const maskedPassword = entry.password.length > 8 
            ? entry.password.substring(0, 4) + '•'.repeat(entry.password.length - 8) + entry.password.substring(entry.password.length - 4)
            : '•'.repeat(entry.password.length);
        
        return `
            <div class="history-item">
                <span class="history-password">${maskedPassword}</span>
                <span class="history-strength ${entry.strength.toLowerCase()}">${entry.strength}</span>
            </div>
        `;
    }).join('');
}

function clearPasswordHistory() {
    localStorage.removeItem('passwordHistory');
    updateHistoryDisplay();
}

// Dark Mode Functions
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    darkModeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    darkModeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Copy password to clipboard
async function copyPassword() {
    const password = generatedPasswordInput.value;
    
    try {
        await navigator.clipboard.writeText(password);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#34c759';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('Failed to copy password:', error);
        
        // Fallback for older browsers
        generatedPasswordInput.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#34c759';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }
}

// Event listeners
checkBtn.addEventListener('click', checkPasswordStrength);
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);
togglePassword.addEventListener('click', togglePasswordVisibility);
clearHistory.addEventListener('click', clearPasswordHistory);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Allow Enter key to check password
passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPasswordStrength();
    }
});

// Real-time password strength checking (optional)
let checkTimeout;
passwordInput.addEventListener('input', function() {
    clearTimeout(checkTimeout);
    
    // Only auto-check if password is long enough
    if (this.value.length >= 4) {
        checkTimeout = setTimeout(() => {
            if (this.value.trim()) {
                checkPasswordStrength();
            }
        }, 1000); // Debounce for 1 second
    } else {
        strengthResult.classList.add('hidden');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set initial length value
    lengthValue.textContent = passwordLength.value;
    
    // Initialize theme
    initializeTheme();
    
    // Initialize password history
    updateHistoryDisplay();
    
    // Focus on password input
    passwordInput.focus();
});
