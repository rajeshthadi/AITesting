/**
 * Frontend Application Logic
 * Handles UI interactions and API communication
 */

// ═══════════════════════════════════════════════════════════
// State Management
// ═══════════════════════════════════════════════════════════
const state = {
    targetLanguage: 'javascript',
    isConverting: false,
    ollamaConnected: false
};

// ═══════════════════════════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════════════════════════
const elements = {
    // Inputs
    inputCode: document.getElementById('inputCode'),
    outputCode: document.getElementById('outputCode'),
    inputLineNumbers: document.getElementById('inputLineNumbers'),
    outputLineNumbers: document.getElementById('outputLineNumbers'),
    inputHighlight: document.getElementById('inputHighlight'),
    outputHighlight: document.getElementById('outputHighlight'),
    outputBadge: document.getElementById('outputBadge'),

    // Buttons
    convertBtn: document.getElementById('convertBtn'),
    clearBtn: document.getElementById('clearBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyInputBtn: document.querySelector('.copy-input-btn'),
    jsBtn: document.getElementById('jsBtn'),
    tsBtn: document.getElementById('tsBtn'),
    shortcutsBtn: document.getElementById('shortcutsBtn'),
    closeModal: document.getElementById('closeModal'),
    closeReport: document.getElementById('closeReport'),

    // UI Elements
    statusIndicator: document.getElementById('statusIndicator'),
    outputLangLabel: document.getElementById('outputLangLabel'),
    conversionReport: document.getElementById('conversionReport'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    shortcutsModal: document.getElementById('shortcutsModal'),

    // Report Elements
    reportStatus: document.getElementById('reportStatus'),
    reportMethod: document.getElementById('reportMethod'),
    reportTime: document.getElementById('reportTime'),
    reportModel: document.getElementById('reportModel'),
    reportWarnings: document.getElementById('reportWarnings'),
    warningsList: document.getElementById('warningsList')
};

// ═══════════════════════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════════════════════
const API = {
    baseURL: 'http://localhost:3000/api',

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            return data.ollama === 'connected';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },

    async convert(sourceCode, targetLanguage, useLLM = true) {
        const response = await fetch(`${this.baseURL}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sourceCode,
                targetLanguage,
                useLLM
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    },

    async saveFile(code, fileName, language) {
        const response = await fetch(`${this.baseURL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code,
                fileName,
                language
            })
        });

        if (!response.ok) {
            throw new Error(`Save failed: ${response.status}`);
        }

        return await response.json();
    },

    async getSample() {
        const response = await fetch(`${this.baseURL}/sample`);
        if (!response.ok) {
            throw new Error(`Sample fetch failed: ${response.status}`);
        }
        return await response.json();
    }
};

// ═══════════════════════════════════════════════════════════
// Line Number Utilities
// ═══════════════════════════════════════════════════════════
function updateLineNumbers(textarea, lineNumbersDiv) {
    const lines = textarea.value.split('\n').length;
    const lineNumbersHtml = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    lineNumbersDiv.textContent = lineNumbersHtml;
}

function updateHighlight(textarea, highlightElement, language) {
    if (!textarea || !highlightElement) return;

    const code = textarea.value + (textarea.value.endsWith('\n') ? ' ' : '');
    const codeElement = highlightElement.querySelector('code');
    if (!codeElement) return;

    codeElement.className = `language-${language}`;
    codeElement.textContent = code;

    // Safety check for Prism
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(codeElement);
    } else {
        console.warn('Prism not loaded yet...');
    }

    // Sync scroll
    highlightElement.scrollTop = textarea.scrollTop;
    highlightElement.scrollLeft = textarea.scrollLeft;
}

function syncScroll(textarea, lineNumbersDiv, highlightElement) {
    if (lineNumbersDiv) lineNumbersDiv.scrollTop = textarea.scrollTop;
    if (highlightElement) {
        highlightElement.scrollTop = textarea.scrollTop;
        highlightElement.scrollLeft = textarea.scrollLeft;
    }
}
// ═══════════════════════════════════════════════════════════
// UI Functions
// ═══════════════════════════════════════════════════════════
const UI = {
    updateStatus(connected) {
        state.ollamaConnected = connected;
        const indicator = elements.statusIndicator;
        const statusText = indicator.querySelector('.status-text');

        if (connected) {
            indicator.classList.add('connected');
            indicator.classList.remove('disconnected');
            statusText.textContent = 'Ollama Connected';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('disconnected');
            statusText.textContent = 'Ollama Disconnected';
        }
    },

    setLanguage(language) {
        state.targetLanguage = language;

        // Update button states
        if (language === 'javascript') {
            elements.jsBtn.classList.add('active');
            elements.tsBtn.classList.remove('active');
            elements.outputLangLabel.textContent = 'JavaScript';
            if (elements.outputBadge) elements.outputBadge.textContent = 'javascript';
        } else {
            elements.tsBtn.classList.add('active');
            elements.jsBtn.classList.remove('active');
            elements.outputLangLabel.textContent = 'TypeScript';
            if (elements.outputBadge) elements.outputBadge.textContent = 'typescript';
        }

        // Refresh output highlighting for the new language
        updateHighlight(elements.outputCode, elements.outputHighlight, language);
    },

    setConverting(isConverting) {
        state.isConverting = isConverting;
        const btn = elements.convertBtn;
        const btnText = btn.querySelector('.btn-text');

        if (isConverting) {
            btn.classList.add('loading');
            btn.disabled = true;
            btnText.textContent = 'Converting';
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            btnText.textContent = 'Convert Code';
        }
    },

    showToast(message, type = 'success') {
        const toast = elements.toast;
        const toastMessage = elements.toastMessage;
        const icon = toast.querySelector('.toast-icon');

        toastMessage.textContent = message;

        // Update color based on type
        if (type === 'success') {
            toast.style.background = 'var(--color-success)';
            icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        } else if (type === 'error') {
            toast.style.background = 'var(--color-error)';
            icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
        } else if (type === 'warning') {
            toast.style.background = 'var(--color-warning)';
            icon.innerHTML = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    showReport(result) {
        const report = elements.conversionReport;

        elements.reportStatus.textContent = result.success ? '✅ Success' : '❌ Failed';
        elements.reportMethod.textContent = result.method || 'N/A';
        elements.reportTime.textContent = result.conversionTime ? `${result.conversionTime}ms` : 'N/A';
        elements.reportModel.textContent = result.model || 'codellama:7b';

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
            elements.reportWarnings.style.display = 'block';
            elements.warningsList.innerHTML = result.warnings
                .map(warning => `<li>${warning}</li>`)
                .join('');
        } else {
            elements.reportWarnings.style.display = 'none';
        }

        report.style.display = 'block';
    },

    hideReport() {
        elements.conversionReport.style.display = 'none';
    },

    showModal() {
        elements.shortcutsModal.style.display = 'flex';
    },

    hideModal() {
        elements.shortcutsModal.style.display = 'none';
    }
};

// ═══════════════════════════════════════════════════════════
// Core Functions
// ═══════════════════════════════════════════════════════════
async function convertCode() {
    const sourceCode = elements.inputCode.value.trim();

    if (!sourceCode) {
        UI.showToast('Please enter Selenium code to convert', 'warning');
        return;
    }

    if (!state.ollamaConnected) {
        UI.showToast('Ollama is not connected. Using rule-based conversion.', 'warning');
    }

    UI.setConverting(true);
    UI.hideReport();

    try {
        const result = await API.convert(
            sourceCode,
            state.targetLanguage,
            state.ollamaConnected
        );

        if (result.success) {
            elements.outputCode.value = result.convertedCode;
            updateLineNumbers(elements.outputCode, elements.outputLineNumbers);
            updateHighlight(elements.outputCode, elements.outputHighlight, state.targetLanguage);
            UI.showToast('Conversion successful!', 'success');
            UI.showReport(result);
        } else {
            UI.showToast(`Conversion failed: ${result.error}`, 'error');
            elements.outputCode.value = `// Conversion failed\n// Error: ${result.error}`;
        }
    } catch (error) {
        console.error('Conversion error:', error);
        UI.showToast(`Error: ${error.message}`, 'error');
        elements.outputCode.value = `// Conversion failed\n// Error: ${error.message}`;
    } finally {
        UI.setConverting(false);
    }
}

async function loadSample() {
    try {
        const result = await API.getSample();
        if (result.success) {
            elements.inputCode.value = result.code;
            updateLineNumbers(elements.inputCode, elements.inputLineNumbers);
            updateHighlight(elements.inputCode, elements.inputHighlight, 'java');
            UI.showToast('Sample code loaded', 'success');
        }
    } catch (error) {
        console.error('Load sample error:', error);
        UI.showToast('Failed to load sample code', 'error');
    }
}

function clearAll() {
    elements.inputCode.value = '';
    elements.outputCode.value = '';
    updateLineNumbers(elements.inputCode, elements.inputLineNumbers);
    updateLineNumbers(elements.outputCode, elements.outputLineNumbers);
    updateHighlight(elements.inputCode, elements.inputHighlight, 'java');
    updateHighlight(elements.outputCode, elements.outputHighlight, state.targetLanguage);
    UI.hideReport();
    UI.showToast('Cleared all code', 'success');
}

async function copyToClipboard() {
    const code = elements.outputCode.value;

    if (!code) {
        UI.showToast('No code to copy', 'warning');
        return;
    }

    try {
        await navigator.clipboard.writeText(code);
        UI.showToast('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        UI.showToast('Failed to copy', 'error');
    }
}

async function copyInputToClipboard() {
    const code = elements.inputCode.value;
    if (!code) return;
    try {
        await navigator.clipboard.writeText(code);
        UI.showToast('Input copied to clipboard!', 'success');
    } catch (err) {
        console.error('Copy input error:', err);
    }
}

function downloadCode() {
    const code = elements.outputCode.value;

    if (!code) {
        UI.showToast('No code to download', 'warning');
        return;
    }

    const extension = state.targetLanguage === 'typescript' ? '.spec.ts' : '.spec.js';
    const fileName = `converted-test${extension}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    UI.showToast(`Downloaded ${fileName}`, 'success');
}

// ═══════════════════════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════════════════════
function setupEventListeners() {
    // Button clicks
    elements.convertBtn.addEventListener('click', convertCode);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.sampleBtn.addEventListener('click', loadSample);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.downloadBtn.addEventListener('click', downloadCode);
    elements.copyInputBtn.addEventListener('click', copyInputToClipboard);

    // Language toggle
    elements.jsBtn.addEventListener('click', () => UI.setLanguage('javascript'));
    elements.tsBtn.addEventListener('click', () => UI.setLanguage('typescript'));

    // Modal
    elements.shortcutsBtn.addEventListener('click', () => UI.showModal());
    elements.closeModal.addEventListener('click', () => UI.hideModal());
    elements.closeReport.addEventListener('click', () => UI.hideReport());

    // Click outside modal to close
    elements.shortcutsModal.addEventListener('click', (e) => {
        if (e.target === elements.shortcutsModal) {
            UI.hideModal();
        }
    });

    // Line number and highlight synchronization
    elements.inputCode.addEventListener('input', () => {
        updateLineNumbers(elements.inputCode, elements.inputLineNumbers);
        updateHighlight(elements.inputCode, elements.inputHighlight, 'java');
    });

    elements.inputCode.addEventListener('scroll', () => {
        syncScroll(elements.inputCode, elements.inputLineNumbers, elements.inputHighlight);
    });

    elements.outputCode.addEventListener('scroll', () => {
        syncScroll(elements.outputCode, elements.outputLineNumbers, elements.outputHighlight);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter: Convert
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            convertCode();
        }

        // Ctrl+K: Clear
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            clearAll();
        }

        // Ctrl+S: Download
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            downloadCode();
        }

        // Ctrl+L: Load sample
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            loadSample();
        }

        // Ctrl+/: Toggle language
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const newLang = state.targetLanguage === 'javascript' ? 'typescript' : 'javascript';
            UI.setLanguage(newLang);
        }

        // Escape: Close modal
        if (e.key === 'Escape') {
            UI.hideModal();
        }
    });
}

function syncScroll(textarea, lineNumbersDiv, highlightElement) {
    lineNumbersDiv.scrollTop = textarea.scrollTop;
    if (highlightElement) {
        highlightElement.scrollTop = textarea.scrollTop;
        highlightElement.scrollLeft = textarea.scrollLeft;
    }
}

// ═══════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════
async function initialize() {
    console.log('🚀 Initializing Selenium to Playwright Converter...');

    // Setup event listeners
    setupEventListeners();

    // Initialize line numbers
    updateLineNumbers(elements.inputCode, elements.inputLineNumbers);
    updateLineNumbers(elements.outputCode, elements.outputLineNumbers);

    // Initialize highlighting
    updateHighlight(elements.inputCode, elements.inputHighlight, 'java');
    updateHighlight(elements.outputCode, elements.outputHighlight, state.targetLanguage);

    // Check Ollama connection
    const connected = await API.checkHealth();
    UI.updateStatus(connected);

    // Set initial language
    UI.setLanguage('javascript');

    console.log('✅ Application initialized');
    console.log(`📡 Ollama status: ${connected ? 'Connected' : 'Disconnected'}`);

    // Periodic health check (every 30 seconds)
    setInterval(async () => {
        const connected = await API.checkHealth();
        UI.updateStatus(connected);
    }, 30000);
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
