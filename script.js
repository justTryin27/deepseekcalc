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

const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event Listeners
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