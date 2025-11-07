// =================== موتور ترجمه APAL (نسخه ۸.۰ - کامل و قدرتمند) ===================

// --- بخش ۱: توابع کمکی ---

// تابعی برای تمیز کردن نام متغیرها و توابع (تبدیل فاصله به آندرلاین)
function sanitizeName(name) {
    return name.replace(/ /g, '_');
}

// تابع کمکی برای ترجمه مقادیر (بدون تغییر)
function translateValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) return value;
    if (!isNaN(value)) return value;
    // ... (تمام عملگرها مثل قبل) ...
    const greaterOrEqualPattern = /(.*) بزرگتر مساوی (.*)/; const lessOrEqualPattern = /(.*) کوچکتر مساوی (.*)/; const greaterPattern = /(.*) بزرگتر از (.*)/; const lessPattern = /(.*) کوچکتر از (.*)/; const equalPattern = /(.*) مساوی با (.*)/; const notEqualPattern = /(.*) مساوی نیست با (.*)/; const divisionPattern = /(.*) تقسیم بر (.*)/; const multiplicationPattern = /(.*) ضربدر (.*)/; const subtractionPattern = /(.*) منفی (.*)/; const additionPattern = /(.*) جمع (.*)/;
    if (value.match(greaterOrEqualPattern)) { const parts = value.match(greaterOrEqualPattern); return `${translateValue(parts[1])} >= ${translateValue(parts[2])}`; } if (value.match(lessOrEqualPattern)) { const parts = value.match(lessOrEqualPattern); return `${translateValue(parts[1])} <= ${translateValue(parts[2])}`; } if (value.match(greaterPattern)) { const parts = value.match(greaterPattern); return `${translateValue(parts[1])} > ${translateValue(parts[2])}`; } if (value.match(lessPattern)) { const parts = value.match(lessPattern); return `${translateValue(parts[1])} < ${translateValue(parts[2])}`; } if (value.match(equalPattern)) { const parts = value.match(equalPattern); return `${translateValue(parts[1])} === ${translateValue(parts[2])}`; } if (value.match(notEqualPattern)) { const parts = value.match(notEqualPattern); return `${translateValue(parts[1])} !== ${translateValue(parts[2])}`; } if (value.match(divisionPattern)) { const parts = value.match(divisionPattern); return `${translateValue(parts[1])} / ${translateValue(parts[2])}`; } if (value.match(multiplicationPattern)) { const parts = value.match(multiplicationPattern); return `${translateValue(parts[1])} * ${translateValue(parts[2])}`; } if (value.match(subtractionPattern)) { const parts = value.match(subtractionPattern); return `${translateValue(parts[1])} - ${translateValue(parts[2])}`; } if (value.match(additionPattern)) { const parts = value.match(additionPattern); return `${translateValue(parts[1])} + ${translateValue(parts[2])}`; }
    return value;
}

// تابع کمکی برای پردازش یک بلوک تورفته
function processIndentedBlock(lines, startIndex) {
    let blockJsCode = '';
    let i = startIndex;
    while (i < lines.length && lines[i].startsWith('    ')) {
        const innerLine = lines[i].trim();
        const reassignPattern = /تغییر بده (.*) مساوی (.*)/;
        const returnPattern = /برگردان (.*)/;
        const printPattern = /چاپ کن به (.*)/;
        if (innerLine.match(reassignPattern)) {
            const matches = innerLine.match(reassignPattern);
            const varName = sanitizeName(matches[1]);
            const newValue = translateValue(matches[2]);
            blockJsCode += `    ${varName} = ${newValue};\n`;
        } else if (innerLine.match(returnPattern)) {
            const valueToReturn = translateValue(innerLine.match(returnPattern)[1]);
            blockJsCode += `    return ${valueToReturn};\n`;
        } else if (innerLine.match(printPattern)) {
            const itemToPrint = innerLine.match(printPattern)[1];
            const translatedItem = translateValue(itemToPrint);
            blockJsCode += `    console.log(${translatedItem});\n`;
        }
        i++;
    }
    return { code: blockJsCode, nextIndex: i };
}

// --- بخش ۲: موتور جدید برای ترجمه بلوک‌های if/else ---

// تابعی برای ترجمه کل بلوک if/else/else if
function translateIfBlock(lines, startIndex) {
    let jsCode = '';
    let i = startIndex;

    // پردازش خط 'اگر'
    const ifLine = lines[i].trim();
    const condition = translateValue(ifLine.match(/^اگر (.*)$/)[1]);
    jsCode += `if (${condition}) {\n`;
    i++;

    // پردازش بدنه 'اگر'
    const ifBlock = processIndentedBlock(lines, i);
    jsCode += ifBlock.code;
    i = ifBlock.nextIndex;

    // نادیده گرفتن خطوط خالی بعد از بلوک if
    while (i < lines.length && lines[i].trim() === '') {
        i++;
    }

    // پردازش 'گرنه' یا 'وگرنه اگر'
    if (i < lines.length && (lines[i].trim() === 'گرنه' || lines[i].trim().startsWith('وگرنه اگر'))) {
        if (lines[i].trim().startsWith('وگرنه اگر')) {
            jsCode += `} else if (${translateValue(lines[i].trim().match(/^وگرنه اگر (.*)$/)[1])}) {\n`;
            i++;
            const elseIfBlock = processIndentedBlock(lines, i);
            jsCode += elseIfBlock.code;
            i = elseIfBlock.nextIndex;
        } else { // 'گرنه'
            jsCode += `} else {\n`;
            i++; // رد کردن خط "گرنه"
            const elseBlock = processIndentedBlock(lines, i);
            jsCode += elseBlock.code;
            i = elseBlock.nextIndex;
        }
    }
    jsCode += `}\n`;
    return { code: jsCode, nextIndex: i };
}


// --- بخش ۳: تابع اصلی ترجمه (معماری جدید و کامل) ---
function translate(afghanScriptCode) {
    const lines = afghanScriptCode.split('\n');
    let functionDefinitions = '';
    let mainCode = '';
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmedLine = line.trim();
        if (!trimmedLine) { i++; continue; }

        const functionDefinitionPattern = /^کار (.*) با (.*)$/;
        if (trimmedLine.match(functionDefinitionPattern)) {
            const matches = trimmedLine.match(functionDefinitionPattern);
            const functionName = sanitizeName(matches[1]);
            const params = sanitizeName(matches[2]);
            
            functionDefinitions += `function ${functionName}(${params}) {\n`;
            
            const functionBlock = processIndentedBlock(lines, i + 1);
            functionDefinitions += functionBlock.code;
            functionDefinitions += `}\n\n`;
            
            i = functionBlock.nextIndex;
            continue;
        }

        // استفاده از موتور جدید برای if/else
        if (trimmedLine.startsWith('اگر')) {
            const ifBlockResult = translateIfBlock(lines, i);
            mainCode += ifBlockResult.code;
            i = ifBlockResult.nextIndex;
            continue;
        }

        // ... (منطق‌های دیگر مثل قبل) ...
        const forLoopPattern = /^تکرار کن روی هر (.*) از (.*) تا (.*)$/;
        const whileLoopPattern = /^تکرار کن تا زمانی که (.*) کوچکتر از (.*)$/;
        const variablePattern = /^ذخیره کن (.*) مساوی (.*)$/;
        const printStringPattern = /^چاپ کن به "(.*)"$/;
        const printPattern = /^چاپ کن به (.*)$/;
        const functionCallPattern = /^(.*) با (.*)$/;
        
        if (trimmedLine.match(forLoopPattern)) {
            const matches = trimmedLine.match(forLoopPattern);
            const loopVar = sanitizeName(matches[1]);
            const startVal = translateValue(matches[2]);
            const endVal = translateValue(matches[3]);
            mainCode += `for (let ${loopVar} = ${startVal}; ${loopVar} <= ${endVal}; ${loopVar}++) {\n`;
            const loopBlock = processIndentedBlock(lines, i + 1);
            mainCode += loopBlock.code;
            i = loopBlock.nextIndex;
            mainCode += `}\n`;
        } else if (trimmedLine.match(whileLoopPattern)) {
            const matches = trimmedLine.match(whileLoopPattern);
            const conditionLeft = translateValue(matches[1]);
            const conditionRight = translateValue(matches[2]);
            mainCode += `while (${conditionLeft} < ${conditionRight}) {\n`;
            const loopBlock = processIndentedBlock(lines, i + 1);
            mainCode += loopBlock.code;
            i = loopBlock.nextIndex;
            mainCode += `}\n`;
        } else if (trimmedLine.match(variablePattern)) {
            const matches = trimmedLine.match(variablePattern);
            const varName = sanitizeName(matches[1]);
            const varValue = translateValue(matches[2]);
            mainCode += `let ${varName} = ${varValue};\n`;
            i++;
        } else if (trimmedLine.match(printStringPattern)) {
            const content = trimmedLine.match(printStringPattern)[1];
            mainCode += `console.log("${content}");\n`;
            i++;
        } else if (trimmedLine.match(printPattern)) {
            const itemToPrint = trimmedLine.match(printPattern)[1];
            const translatedItem = translateValue(itemToPrint);
            mainCode += `console.log(${translatedItem});\n`;
            i++;
        } else if (trimmedLine.match(functionCallPattern) && !trimmedLine.startsWith('کار ')) {
            const matches = trimmedLine.match(functionCallPattern);
            const functionName = sanitizeName(matches[1]);
            // تقسیم آرگومان‌ها با "و"
            const args = matches[2].split(' و ').map(arg => translateValue(arg.trim())).join(', ');
            mainCode += `${functionName}(${args});\n`;
            i++;
        } else {
            mainCode += `// خط قابل درک نبود: ${trimmedLine}\n`;
            i++;
        }
    }
    return functionDefinitions + mainCode;
}


// =================== منطق صفحه وب ===================
document.addEventListener('DOMContentLoaded', () => {
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const translateBtn = document.getElementById('translate-btn');
    const copyBtn = document.getElementById('copy-btn');

    translateBtn.addEventListener('click', () => {
        const afghanScriptCode = inputCode.value;
        const generatedJavaScript = translate(afghanScriptCode);
        outputCode.value = generatedJavaScript;
    });

    copyBtn.addEventListener('click', () => {
        if (outputCode.value) {
            navigator.clipboard.writeText(outputCode.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'کپی شد!';
                copyBtn.style.backgroundColor = '#238636';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            });
        }
    });
});