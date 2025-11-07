// =================== موتور ترجمه افغان‌اسکریپت ===================

// تابع کمکی برای ترجمه مقادیر
function translateValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) return value;
    if (!isNaN(value)) return value;
    const greaterOrEqualPattern = /(.*) بزرگتر مساوی (.*)/; const lessOrEqualPattern = /(.*) کوچکتر مساوی (.*)/; const greaterPattern = /(.*) بزرگتر از (.*)/; const lessPattern = /(.*) کوچکتر از (.*)/; const equalPattern = /(.*) مساوی با (.*)/; const notEqualPattern = /(.*) مساوی نیست با (.*)/; const divisionPattern = /(.*) تقسیم بر (.*)/; const multiplicationPattern = /(.*) ضربدر (.*)/; const subtractionPattern = /(.*) منفی (.*)/; const additionPattern = /(.*) جمع (.*)/;
    if (value.match(greaterOrEqualPattern)) { const parts = value.match(greaterOrEqualPattern); return `${translateValue(parts[1])} >= ${translateValue(parts[2])}`; } if (value.match(lessOrEqualPattern)) { const parts = value.match(lessOrEqualPattern); return `${translateValue(parts[1])} <= ${translateValue(parts[2])}`; } if (value.match(greaterPattern)) { const parts = value.match(greaterPattern); return `${translateValue(parts[1])} > ${translateValue(parts[2])}`; } if (value.match(lessPattern)) { const parts = value.match(lessPattern); return `${translateValue(parts[1])} < ${translateValue(parts[2])}`; } if (value.match(equalPattern)) { const parts = value.match(equalPattern); return `${translateValue(parts[1])} === ${translateValue(parts[2])}`; } if (value.match(notEqualPattern)) { const parts = value.match(notEqualPattern); return `${translateValue(parts[1])} !== ${translateValue(parts[2])}`; } if (value.match(divisionPattern)) { const parts = value.match(divisionPattern); return `${translateValue(parts[1])} / ${translateValue(parts[2])}`; } if (value.match(multiplicationPattern)) { const parts = value.match(multiplicationPattern); return `${translateValue(parts[1])} * ${translateValue(parts[2])}`; } if (value.match(subtractionPattern)) { const parts = value.match(subtractionPattern); return `${translateValue(parts[1])} - ${translateValue(parts[2])}`; } if (value.match(additionPattern)) { const parts = value.match(additionPattern); return `${translateValue(parts[1])} + ${translateValue(parts[2])}`; }
    return value;
}

// تابع کمکی برای پردازش بلوک‌های تورفته
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
            const varName = matches[1];
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

// تابع اصلی ترجمه
// تابع اصلی ترجمه (نسخه هوشمندتر و کامل‌تر)
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
            const functionName = matches[1].replace(/ /g, '_');
            const params = matches[2];
            
            functionDefinitions += `function ${functionName}(${params}) {\n`;
            
            const functionBlock = processIndentedBlock(lines, i + 1);
            functionDefinitions += functionBlock.code;
            functionDefinitions += `}\n\n`;
            
            i = functionBlock.nextIndex;
            continue;
        }

        // --- منطق جدید و هوشمندتر برای "اگر" ---
        const ifPattern = /^اگر (.*)$/; // الگوی کلی‌تر برای هر نوع شرطی
        
        if (trimmedLine.match(ifPattern)) {
            const condition = translateValue(trimmedLine.match(ifPattern)[1]);
            mainCode += `if (${condition}) {\n`;
            
            const ifBlock = processIndentedBlock(lines, i + 1);
            mainCode += ifBlock.code;
            i = ifBlock.nextIndex;

            // --- منطق جدید برای نادیده گرفتن خطوط خالی ---
            // تمام خطوط خالی بین بلوک if و گرنه را نادیده می‌گیریم
            while (i < lines.length && lines[i].trim() === '') {
                i++;
            }

            if (i < lines.length && lines[i].trim() === 'گرنه') {
                mainCode += `} else {\n`;
                i++; // رد کردن خط "گرنه"
                
                const elseBlock = processIndentedBlock(lines, i);
                mainCode += elseBlock.code;
                i = elseBlock.nextIndex;
                mainCode += `}\n`;
            } else {
                mainCode += `}\n`;
            }

        } else if (trimmedLine.match(/^تکرار کن روی هر (.*) از (.*) تا (.*)$/)) {
            const matches = trimmedLine.match(/^تکرار کن روی هر (.*) از (.*) تا (.*)$/);
            const loopVar = matches[1];
            const startVal = translateValue(matches[2]);
            const endVal = translateValue(matches[3]);
            mainCode += `for (let ${loopVar} = ${startVal}; ${loopVar} <= ${endVal}; ${loopVar}++) {\n`;
            const loopBlock = processIndentedBlock(lines, i + 1);
            mainCode += loopBlock.code;
            i = loopBlock.nextIndex;
            mainCode += `}\n`;

        } else if (trimmedLine.match(/^تکرار کن تا زمانی که (.*) کوچکتر از (.*)$/)) {
            const matches = trimmedLine.match(/^تکرار کن تا زمانی که (.*) کوچکتر از (.*)$/);
            const conditionLeft = translateValue(matches[1]);
            const conditionRight = translateValue(matches[2]);
            mainCode += `while (${conditionLeft} < ${conditionRight}) {\n`;
            const loopBlock = processIndentedBlock(lines, i + 1);
            mainCode += loopBlock.code;
            i = loopBlock.nextIndex;
            mainCode += `}\n`;

        } else if (trimmedLine.match(/^ذخیره کن (.*) مساوی (.*)$/)) {
            const matches = trimmedLine.match(/^ذخیره کن (.*) مساوی (.*)$/);
            const varName = matches[1];
            const varValue = matches[2];
            const translatedValue = translateValue(varValue);
            mainCode += `let ${varName} = ${translatedValue};\n`;
            i++;
        } else if (trimmedLine.match(/^چاپ کن به "(.*)"$/)) {
            const content = trimmedLine.match(/^چاپ کن به "(.*)"$/)[1];
            mainCode += `console.log("${content}");\n`;
            i++;
        } else if (trimmedLine.match(/^چاپ کن به (.*)$/)) {
            const itemToPrint = trimmedLine.match(/^چاپ کن به (.*)$/)[1];
            const translatedItem = translateValue(itemToPrint);
            mainCode += `console.log(${translatedItem});\n`;
            i++;
        } else if (trimmedLine.match(/^(.*) با (.*)$/) && !trimmedLine.startsWith('کار ')) {
            const matches = trimmedLine.match(/^(.*) با (.*)$/);
            const functionName = matches[1].replace(/ /g, '_');
            const args = matches[2];
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
                // می‌توانید یک پیام موفقیت آمیز هم به کاربر نشان دهید
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'کپی شد!';
                copyBtn.style.backgroundColor = '#238636'; // رنگ سبز
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = ''; // برگرداندن به حالت اول
                }, 2000);
            });
        }
    });
});