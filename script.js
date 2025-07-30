// Auth Page Elements
const signupTab = document.getElementById('signup-tab');
const loginTab = document.getElementById('login-tab');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const guestBtn = document.getElementById('guest-btn');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');

// Tab switching
signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

// Signup functionality
signupBtn.addEventListener('click', async () => {
    const email = signupEmail.value;
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    
    // Validation
    if (!email || !password || !confirm) {
        signupError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirm) {
        signupError.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        signupError.textContent = 'Password should be at least 6 characters';
        return;
    }
    
    try {
        await firebaseAuth.createUserWithEmailAndPassword(
            firebaseAuth.auth, 
            email, 
            password
        );
        // Success - show calculator
        showCalculator();
    } catch (error) {
        signupError.textContent = error.message;
    }
});

// Login functionality
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }
    
    try {
        await firebaseAuth.signInWithEmailAndPassword(
            firebaseAuth.auth, 
            email, 
            password
        );
        // Success - show calculator
        showCalculator();
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Guest access
guestBtn.addEventListener('click', () => {
    // Set guest flag
    localStorage.setItem('isGuest', 'true');
    showCalculator();
});

// Show calculator page
function showCalculator() {
    document.querySelector('body').classList.remove('auth-body');
    document.getElementById('calculator-page').classList.remove('hidden');
    
    // Load calculator content
    document.getElementById('calculator-page').innerHTML = `
        <div class="auth-container-calc">
            <div class="user-info">
                <span id="user-email"></span>
                <button id="logout-btn">Logout</button>
            </div>
        </div>
        
        <div class="calculator">
            <div class="header">
                <h1>NEO<span>CALC</span></h1>
                <button id="theme-toggle" aria-label="Toggle dark mode">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
            
            <div class="display">
                <div id="previous-operand"></div>
                <div id="current-operand">0</div>
            </div>
            
            <div class="buttons">
                <button data-action="clear" class="operator">C</button>
                <button data-action="delete">⌫</button>
                <button data-action="percentage" class="operator">%</button>
                <button data-action="divide" class="operator">÷</button>
                
                <button data-action="number">7</button>
                <button data-action="number">8</button>
                <button data-action="number">9</button>
                <button data-action="multiply" class="operator">×</button>
                
                <button data-action="number">4</button>
                <button data-action="number">5</button>
                <button data-action="number">6</button>
                <button data-action="subtract" class="operator">−</button>
                
                <button data-action="number">1</button>
                <button data-action="number">2</button>
                <button data-action="number">3</button>
                <button data-action="add" class="operator">+</button>
                
                <button data-action="negate" class="operator">±</button>
                <button data-action="number">0</button>
                <button data-action="decimal">.</button>
                <button data-action="equals" class="equals">=</button>
            </div>
        </div>
    `;
    
    // Initialize calculator functionality
    initCalculator();
}

// Initialize calculator
function initCalculator() {
    class Calculator {
        constructor(previousOperandElement, currentOperandElement) {
            this.previousOperandElement = previousOperandElement;
            this.currentOperandElement = currentOperandElement;
            this.clear();
        }

        clear() {
            this.currentOperand = '0';
            this.previousOperand = '';
            this.operation = undefined;
        }

        delete() {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
            if (this.currentOperand === '') this.currentOperand = '0';
        }

        appendNumber(number) {
            if (number === '.' && this.currentOperand.includes('.')) return;
            if (this.currentOperand === '0' && number !== '.') {
                this.currentOperand = number.toString();
            } else {
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }
        }

        chooseOperation(operation) {
            if (this.currentOperand === '') return;
            if (this.previousOperand !== '') {
                this.compute();
            }
            this.operation = operation;
            this.previousOperand = `${this.currentOperand} ${this.operation}`;
            this.currentOperand = '';
        }

        negate() {
            if (this.currentOperand === '0') return;
            this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
        }

        percentage() {
            this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
        }

        compute() {
            let computation;
            const prev = parseFloat(this.previousOperand);
            const current = parseFloat(this.currentOperand);
            if (isNaN(prev) || isNaN(current)) return;

            switch (this.operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '−':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    computation = prev / current;
                    break;
                default:
                    return;
            }

            this.currentOperand = computation.toString();
            this.operation = undefined;
            this.previousOperand = '';
        }

        updateDisplay() {
            this.currentOperandElement.innerText = this.formatDisplay(this.currentOperand);
            if (this.operation != null) {
                this.previousOperandElement.innerText = `${this.formatDisplay(this.previousOperand)}`;
            } else {
                this.previousOperandElement.innerText = '';
            }
        }

        formatDisplay(number) {
            if (number === '') return '';
            const stringNumber = number.toString();
            const integerDigits = parseFloat(stringNumber.split('.')[0]);
            const decimalDigits = stringNumber.split('.')[1];
            let integerDisplay;

            if (isNaN(integerDigits)) {
                integerDisplay = '';
            } else {
                integerDisplay = integerDigits.toLocaleString('en', {
                    maximumFractionDigits: 0
                });
            }

            if (decimalDigits != null) {
                return `${integerDisplay}.${decimalDigits}`;
            } else {
                return integerDisplay;
            }
        }
    }

    // DOM Elements
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const buttons = document.querySelector('.buttons');
    const themeToggle = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmail = document.getElementById('user-email');

    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // Set user info
    const user = firebaseAuth.auth.currentUser;
    if (user) {
        userEmail.textContent = user.email;
    } else if (localStorage.getItem('isGuest') === 'true') {
        userEmail.textContent = 'Guest User';
    }

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        // Sign out if authenticated
        if (user) {
            firebaseAuth.signOut(firebaseAuth.auth);
        }
        
        // Clear guest flag
        localStorage.removeItem('isGuest');
        
        // Clear theme preference
        localStorage.removeItem('darkMode');
        
        // Reload to show auth page
        location.reload();
    });

    // Calculator button clicks
    buttons.addEventListener('click', (e) => {
        if (!e.target.matches('button')) return;

        const button = e.target;
        const action = button.dataset.action;
        const buttonContent = button.textContent;

        if (!action) return;

        // Add active class for visual feedback
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 100);

        switch (action) {
            case 'number':
                calculator.appendNumber(buttonContent);
                break;
            case 'decimal':
                calculator.appendNumber('.');
                break;
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                calculator.chooseOperation(buttonContent);
                break;
            case 'equals':
                calculator.compute();
                break;
            case 'negate':
                calculator.negate();
                break;
            case 'percentage':
                calculator.percentage();
                break;
        }

        calculator.updateDisplay();
    });

    // Theme Toggler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.querySelector('i').classList.toggle('fa-moon');
        themeToggle.querySelector('i').classList.toggle('fa-sun');
        
        // Save theme preference
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });

    // Check saved theme preference
    function loadTheme() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', darkMode);
        
        const icon = themeToggle.querySelector('i');
        if (darkMode) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Numpad and Keyboard Support
    document.addEventListener('keydown', (e) => {
        // Skip if key is held down
        if (e.repeat) return;

        // Map keyboard keys to calculator actions
        const keyMap = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
            '.': '.', ',': '.',
            '+': '+', '-': '−', '*': '×', '/': '÷',
            'Enter': '=', '=': '=',
            'Escape': 'C', 'Delete': 'C',
            'Backspace': '⌫',
            '%': '%',
            'p': '%', 'P': '%'  // Percentage with P key
        };

        // Special case for numpad keys
        const numpadMap = {
            'Numpad0': '0', 'Numpad1': '1', 'Numpad2': '2', 'Numpad3': '3', 'Numpad4': '4',
            'Numpad5': '5', 'Numpad6': '6', 'Numpad7': '7', 'Numpad8': '8', 'Numpad9': '9',
            'NumpadDecimal': '.', 'NumpadAdd': '+', 'NumpadSubtract': '−',
            'NumpadMultiply': '×', 'NumpadDivide': '÷', 'NumpadEnter': '='
        };

        // Combine both maps
        const combinedMap = { ...keyMap, ...numpadMap };
        const key = combinedMap[e.key] || combinedMap[e.code];

        if (!key) return;

        // Prevent default behavior for calculator keys
        e.preventDefault();

        // Find the corresponding button
        const buttons = document.querySelectorAll('.buttons button');
        let targetButton;
        
        buttons.forEach(button => {
            if (button.textContent === key || 
                (key === '−' && button.textContent === '−') ||
                (key === '×' && button.textContent === '×') ||
                (key === '÷' && button.textContent === '÷') ||
                (key === '⌫' && button.textContent === '⌫') ||
                (key === 'C' && button.textContent === 'C') ||
                (key === '=' && (button.textContent === '=' || button.dataset.action === 'equals')) ||
                (key === '%' && button.textContent === '%') ||
                (key === '.' && button.textContent === '.')) {
                targetButton = button;
            }
        });

        if (!targetButton) return;

        // Simulate button press (visual feedback)
        targetButton.classList.add('active');
        setTimeout(() => targetButton.classList.remove('active'), 100);

        // Trigger the corresponding action
        const action = targetButton.dataset.action;
        const buttonContent = targetButton.textContent;

        switch (action) {
            case 'number':
                calculator.appendNumber(buttonContent);
                break;
            case 'decimal':
                calculator.appendNumber('.');
                break;
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                calculator.chooseOperation(buttonContent);
                break;
            case 'equals':
                calculator.compute();
                break;
            case 'negate':
                calculator.negate();
                break;
            case 'percentage':
                calculator.percentage();
                break;
        }

        calculator.updateDisplay();
    });

    // Initialize
    loadTheme();
    calculator.updateDisplay();
}

// Check if user is already authenticated or is guest
firebaseAuth.onAuthStateChanged(firebaseAuth.auth, (user) => {
    if (user || localStorage.getItem('isGuest') === 'true') {
        showCalculator();
    }
});
