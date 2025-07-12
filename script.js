
let intelligenceEnabled = true;
let currentSuggestions = [];
let selectedSuggestionIndex = -1;


const htmlTags = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'form', 'input', 'button', 'textarea',
    'select', 'option', 'label', 'nav', 'header', 'footer', 'main', 'section', 'article',
    'aside', 'figure', 'figcaption', 'video', 'audio', 'canvas', 'svg', 'iframe'
];

const htmlAttributes = [
    'id', 'class', 'src', 'href', 'alt', 'title', 'style', 'onclick', 'onload', 'type',
    'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked',
    'selected', 'multiple', 'size', 'maxlength', 'min', 'max', 'step', 'pattern'
];

const cssProperties = [
    'color', 'background', 'background-color', 'font-size', 'font-family', 'font-weight',
    'margin', 'padding', 'border', 'width', 'height', 'display', 'position', 'top', 'left',
    'right', 'bottom', 'z-index', 'opacity', 'transform', 'transition', 'animation',
    'flex', 'grid', 'justify-content', 'align-items', 'text-align', 'line-height',
    'border-radius', 'box-shadow', 'text-shadow', 'overflow', 'cursor', 'pointer-events'
];

const cssValues = {
    'display': ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
    'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    'text-align': ['left', 'center', 'right', 'justify'],
    'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    'cursor': ['pointer', 'default', 'text', 'move', 'not-allowed', 'grab', 'grabbing']
};

const jsKeywords = [
    'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this',
    'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'Promise'
];

const jsMethods = [
    'addEventListener', 'removeEventListener', 'getElementById', 'querySelector',
    'querySelectorAll', 'createElement', 'appendChild', 'removeChild', 'innerHTML',
    'textContent', 'setAttribute', 'getAttribute', 'classList.add', 'classList.remove',
    'classList.toggle', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    'console.log', 'console.error', 'console.warn', 'JSON.parse', 'JSON.stringify'
];

function runCode() {
    const html = document.getElementById("htmlCode").value;
    const css = document.getElementById("cssCode").value;
    const js = document.getElementById("jsCode").value;
    const output = document.getElementById("output");
    const consoleContent = document.getElementById("consoleContent");
    

    consoleContent.innerHTML = '';
    

    if (intelligenceEnabled) {
        checkAllErrors();
    }
    
    const fullCode = `
        <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>
                    // Override console methods to capture output
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;
                    
                    console.log = function(...args) {
                        parent.postMessage({type: 'console', method: 'log', args: args}, '*');
                        originalLog.apply(console, args);
                    };
                    
                    console.error = function(...args) {
                        parent.postMessage({type: 'console', method: 'error', args: args}, '*');
                        originalError.apply(console, args);
                    };
                    
                    console.warn = function(...args) {
                        parent.postMessage({type: 'console', method: 'warn', args: args}, '*');
                        originalWarn.apply(console, args);
                    };
                    
                    // Capture runtime errors
                    window.onerror = function(msg, url, line, col, error) {
                        parent.postMessage({
                            type: 'console', 
                            method: 'error', 
                            args: ['Runtime Error: ' + msg + ' (Line: ' + line + ')']
                        }, '*');
                        return false;
                    };
                    
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Error:', error.message);
                    }
                <\/script>
            </body>
        </html>
    `;
    
    output.srcdoc = fullCode;
}


window.addEventListener('message', function(event) {
    if (event.data.type === 'console') {
        const consoleContent = document.getElementById("consoleContent");
        const logElement = document.createElement('div');
        logElement.className = `console-log ${event.data.method}`;
        logElement.textContent = event.data.args.join(' ');
        consoleContent.appendChild(logElement);
        consoleContent.scrollTop = consoleContent.scrollHeight;
    }
});

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

function toggleIntelligence() {
    intelligenceEnabled = !intelligenceEnabled;
    const button = document.querySelector('.intelligence-toggle');
    
    if (intelligenceEnabled) {
        button.textContent = '🧠 AI ON';
        button.classList.remove('disabled');
        showSuccessMessage('Code Intelligence Enabled! 🧠');
    } else {
        button.textContent = '🧠 AI OFF';
        button.classList.add('disabled');
        hideAllAutocomplete();
        hideAllErrors();
        showSuccessMessage('Code Intelligence Disabled 😴');
    }
}

function saveCode() {
    const html = document.getElementById("htmlCode").value;
    const css = document.getElementById("cssCode").value;
    const js = document.getElementById("jsCode").value;
    
    const codeData = {
        html: html,
        css: css,
        js: js,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('savedCode', JSON.stringify(codeData));
    showSuccessMessage('Code saved successfully! 💾');
}

function downloadZip() {
    const html = document.getElementById("htmlCode").value;
    const css = document.getElementById("cssCode").value;
    const js = document.getElementById("jsCode").value;
    
    if (!html && !css && !js) {
        showSuccessMessage('Please write some code first! ✍️');
        return;
    }
    
    const zip = new JSZip();
    
    let htmlContent = html;
    if (css || js) {
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    ${css ? '<link rel="stylesheet" href="style.css">' : ''}
</head>
<body>
    ${html}
    ${js ? '<script src="script.js"></script>' : ''}
</body>
</html>`;
    }
    
    zip.file("index.html", htmlContent);
    
    if (css) {
        zip.file("style.css", css);
    }
    
    if (js) {
        zip.file("script.js", js);
    }
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `my-project-${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccessMessage('ZIP file downloaded! 📦');
    });
}


function showAutocomplete(textarea, suggestions, type) {
    if (!intelligenceEnabled || suggestions.length === 0) return;
    
    const dropdown = textarea.parentElement.querySelector('.autocomplete-dropdown');
    dropdown.innerHTML = '';
    dropdown.style.display = 'block';
    
    currentSuggestions = suggestions;
    selectedSuggestionIndex = -1;
    
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
            <span>${suggestion}</span>
            <span class="suggestion-type">${type}</span>
        `;
        
        item.addEventListener('click', () => {
            insertSuggestion(textarea, suggestion);
            hideAutocomplete(dropdown);
        });
        
        dropdown.appendChild(item);
    });
}

function hideAutocomplete(dropdown) {
    dropdown.style.display = 'none';
    currentSuggestions = [];
    selectedSuggestionIndex = -1;
}

function hideAllAutocomplete() {
    document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
        hideAutocomplete(dropdown);
    });
}

function insertSuggestion(textarea, suggestion) {
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    

    const words = textBefore.split(/[\s<>"'=]/);
    const currentWord = words[words.length - 1];
    const wordStart = cursorPos - currentWord.length;
    

    textarea.value = textarea.value.substring(0, wordStart) + suggestion + textAfter;
    textarea.selectionStart = textarea.selectionEnd = wordStart + suggestion.length;
    textarea.focus();
}

function getHTMLSuggestions(text, cursorPos) {
    const textBefore = text.substring(0, cursorPos);
    const currentWord = textBefore.split(/[\s<>"'=]/).pop().toLowerCase();
    
    if (textBefore.includes('<') && !textBefore.includes('>')) {

        return htmlTags.filter(tag => tag.startsWith(currentWord));
    } else if (textBefore.includes('=') && (textBefore.includes('"') || textBefore.includes("'"))) {

        return [];
    } else if (textBefore.includes('<') && textBefore.includes(' ')) {

        return htmlAttributes.filter(attr => attr.startsWith(currentWord));
    }
    
    return [];
}

function getCSSSuggestions(text, cursorPos) {
    const textBefore = text.substring(0, cursorPos);
    const currentWord = textBefore.split(/[\s{}:;]/).pop().toLowerCase();
    
    if (textBefore.includes(':') && !textBefore.includes(';')) {

        const lines = textBefore.split('\n');
        const currentLine = lines[lines.length - 1];
        const property = currentLine.split(':')[0].trim();
        
        if (cssValues[property]) {
            return cssValues[property].filter(value => value.startsWith(currentWord));
        }
        return [];
    } else {

        return cssProperties.filter(prop => prop.startsWith(currentWord));
    }
}

function getJSSuggestions(text, cursorPos) {
    const textBefore = text.substring(0, cursorPos);
    const currentWord = textBefore.split(/[\s{}();,.]/).pop().toLowerCase();
    
    const suggestions = [];
    

    suggestions.push(...jsKeywords.filter(keyword => keyword.startsWith(currentWord)));
    

    suggestions.push(...jsMethods.filter(method => method.startsWith(currentWord)));
    
    return suggestions;
}

function checkHTMLErrors(code) {
    const errors = [];
    

    const openTags = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(code)) !== null) {
        const tagName = match[1].toLowerCase();
        const isClosing = match[0].startsWith('</');
        const isSelfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName);
        
        if (isClosing) {
            if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                errors.push(`Unexpected closing tag: </${tagName}>`);
            } else {
                openTags.pop();
            }
        } else if (!isSelfClosing) {
            openTags.push(tagName);
        }
    }
    
    openTags.forEach(tag => {
        errors.push(`Unclosed tag: <${tag}>`);
    });
    
    return errors;
}

function checkCSSErrors(code) {
    const errors = [];
    

    const lines = code.split('\n');
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.includes(':') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && trimmed !== '') {
            errors.push(`Line ${index + 1}: Missing semicolon`);
        }
    });
    

    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        errors.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }
    
    return errors;
}

function checkJSErrors(code) {
    const errors = [];
    
    try {

        new Function(code);
    } catch (error) {
        errors.push(`Syntax Error: ${error.message}`);
    }
    

    const lines = code.split('\n');
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        

        if (trimmed.match(/^(var|let|const|return)\s+.*[^;{}]$/)) {
            errors.push(`Line ${index + 1}: Consider adding semicolon`);
        }
        

        if (trimmed.includes('console.log') && !trimmed.includes('console.log(')) {
            errors.push(`Line ${index + 1}: Possible syntax error in console.log`);
        }
    });
    
    return errors;
}

function showErrors(errorPanel, errors) {
    if (!intelligenceEnabled) return;
    
    if (errors.length > 0) {
        errorPanel.innerHTML = errors.map(error => 
            `<div class="error-item error">⚠️ ${error}</div>`
        ).join('');
        errorPanel.classList.add('show');
    } else {
        errorPanel.classList.remove('show');
    }
}

function hideAllErrors() {
    document.querySelectorAll('.error-panel').forEach(panel => {
        panel.classList.remove('show');
    });
}

function checkAllErrors() {
    const htmlCode = document.getElementById("htmlCode").value;
    const cssCode = document.getElementById("cssCode").value;
    const jsCode = document.getElementById("jsCode").value;
    
    const htmlErrors = checkHTMLErrors(htmlCode);
    const cssErrors = checkCSSErrors(cssCode);
    const jsErrors = checkJSErrors(jsCode);
    
    showErrors(document.getElementById("htmlErrors"), htmlErrors);
    showErrors(document.getElementById("cssErrors"), cssErrors);
    showErrors(document.getElementById("jsErrors"), jsErrors);
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    

    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        const codeData = JSON.parse(savedCode);
        document.getElementById("htmlCode").value = codeData.html || '';
        document.getElementById("cssCode").value = codeData.css || '';
        document.getElementById("jsCode").value = codeData.js || '';
    }
    

    const htmlTextarea = document.getElementById("htmlCode");
    const cssTextarea = document.getElementById("cssCode");
    const jsTextarea = document.getElementById("jsCode");
    

    htmlTextarea.addEventListener('input', function(e) {
        if (!intelligenceEnabled) return;
        
        const suggestions = getHTMLSuggestions(this.value, this.selectionStart);
        showAutocomplete(this, suggestions, 'HTML');
        

        clearTimeout(this.errorTimeout);
        this.errorTimeout = setTimeout(() => {
            const errors = checkHTMLErrors(this.value);
            showErrors(document.getElementById("htmlErrors"), errors);
        }, 1000);
    });
    
    htmlTextarea.addEventListener('keydown', handleAutocompleteKeydown);
    htmlTextarea.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(this.parentElement.querySelector('.autocomplete-dropdown')), 200);
    });
    

    cssTextarea.addEventListener('input', function(e) {
        if (!intelligenceEnabled) return;
        
        const suggestions = getCSSSuggestions(this.value, this.selectionStart);
        showAutocomplete(this, suggestions, 'CSS');
        
        clearTimeout(this.errorTimeout);
        this.errorTimeout = setTimeout(() => {
            const errors = checkCSSErrors(this.value);
            showErrors(document.getElementById("cssErrors"), errors);
        }, 1000);
    });
    
    cssTextarea.addEventListener('keydown', handleAutocompleteKeydown);
    cssTextarea.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(this.parentElement.querySelector('.autocomplete-dropdown')), 200);
    });
    

    jsTextarea.addEventListener('input', function(e) {
        if (!intelligenceEnabled) return;
        
        const suggestions = getJSSuggestions(this.value, this.selectionStart);
        showAutocomplete(this, suggestions, 'JS');
        
        clearTimeout(this.errorTimeout);
        this.errorTimeout = setTimeout(() => {
            const errors = checkJSErrors(this.value);
            showErrors(document.getElementById("jsErrors"), errors);
        }, 1000);
    });
    
    jsTextarea.addEventListener('keydown', handleAutocompleteKeydown);
    jsTextarea.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(this.parentElement.querySelector('.autocomplete-dropdown')), 200);
    });
    

    let timeout;
    function autoRun() {
        clearTimeout(timeout);
        timeout = setTimeout(runCode, 1500);
    }
    
    htmlTextarea.addEventListener('input', autoRun);
    cssTextarea.addEventListener('input', autoRun);
    jsTextarea.addEventListener('input', autoRun);
    

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !document.querySelector('.autocomplete-dropdown[style*="block"]')) {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    });
});

function handleAutocompleteKeydown(e) {
    const dropdown = this.parentElement.querySelector('.autocomplete-dropdown');
    const isVisible = dropdown.style.display === 'block';
    
    if (!isVisible || currentSuggestions.length === 0) return;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, currentSuggestions.length - 1);
            updateSelectedSuggestion(dropdown);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSelectedSuggestion(dropdown);
            break;
            
        case 'Enter':
        case 'Tab':
            if (selectedSuggestionIndex >= 0) {
                e.preventDefault();
                insertSuggestion(this, currentSuggestions[selectedSuggestionIndex]);
                hideAutocomplete(dropdown);
            }
            break;
            
        case 'Escape':
            hideAutocomplete(dropdown);
            break;
    }
}

function updateSelectedSuggestion(dropdown) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}


document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCode();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadZip();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        toggleIntelligence();
    }
});