const translations = {
    ar: {
        placeholder: "أدخل رابط الويب",
        analyzeButton: "تحليل",
        changeLangButton: "تغيير اللغة",
        header: "تحليل الروابط",
        errorMessage: "يرجى إدخال رابط.",
        analyzingMessage: "جاري التحليل...",
        safeMessage: "الرابط يبدو آمنًا! جاري تحليل الصفحة...",
        issuesFoundMessage: "تم العثور على المشاكل التالية في الرابط:",
        noIssuesMessage: "لم يتم العثور على أي مشاكل في الصفحة!",
        suggestionLabel: "اقتراح:",
        csrfProtection: "نموذج بدون حماية CSRF.",
        csrfSuggestion: "قم بإضافة حقل csrf_token لحماية النماذج من CSRF.",
        xssProtection: "نموذج بدون عنوان صحيح قد يكون عرضة لثغرات XSS.",
        xssSuggestion: "أضف عناوين صحيحة للنماذج لتجنب ثغرات XSS.",
        evalDetection: "تم العثور على استخدام غير آمن لدالة eval.",
        evalSuggestion: "قم بإزالة استخدام eval واستخدم طرق أخرى آمنة لتنفيذ الأكواد.",
        sqlInjectionIssue: "قد يكون الحقل عرضة لهجمات.",
    },
    en: {
        placeholder: "Enter URL",
        analyzeButton: "Analyze",
        changeLangButton: "Change Language",
        header: "URL Analysis",
        errorMessage: "Please enter a URL.",
        analyzingMessage: "Analyzing...",
        safeMessage: "The URL seems safe! Analyzing the page...",
        issuesFoundMessage: "The following issues were found in the URL:",
        noIssuesMessage: "No issues were found on the page!",
        suggestionLabel: "Suggestion:",
        csrfProtection: "Form without CSRF protection.",
        csrfSuggestion: "Add a csrf_token field to protect forms from CSRF.",
        xssProtection: "Form with incorrect action may be vulnerable to XSS attacks.",
        xssSuggestion: "Add correct action to forms to prevent XSS vulnerabilities.",
        evalDetection: "Unsafe use of eval function detected.",
        evalSuggestion: "Remove eval usage and use safer methods to execute code.",
        sqlInjectionIssue: "The field may be vulnerable to SQL injection.",
    }
};

document.getElementById("changeLang").addEventListener("click", function() {
    const currentLang = document.documentElement.lang;

    if (currentLang === "ar") {
        document.documentElement.lang = "en";
        setLanguage("en");
    } else {
        document.documentElement.lang = "ar";
        setLanguage("ar");
    }
});

// دالة لتحديث النصوص بناءً على اللغة المختارة
function setLanguage(lang) {
    document.getElementById("changeLang").innerHTML = `<i class="fas fa-language"></i> ${translations[lang].changeLangButton}`;
    document.getElementById("urlField").placeholder = translations[lang].placeholder;
    document.querySelector("h1").textContent = translations[lang].header;
    document.querySelector("button[type='submit']").textContent = translations[lang].analyzeButton;

    // تحديث النصوص في نتائج الفحص
    const resultDiv = document.getElementById("result");
    const copyButton = document.getElementById("copyButton");
    copyButton.textContent = `<i class="fas fa-copy"></i> نسخ النتائج`;

    resultDiv.innerHTML = `<p>${translations[lang].analyzingMessage}</p>`;
}

document.getElementById("urlForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const url = document.getElementById("urlField").value.trim();
    const resultDiv = document.getElementById("result");

    const currentLang = document.documentElement.lang;

    if (!url) {
        resultDiv.innerHTML = translations[currentLang].errorMessage;
        return;
    }

    // فحص الرابط
    resultDiv.innerHTML = translations[currentLang].analyzingMessage;
    let issues = [];

    // التحقق من HTTPS
    if (!url.startsWith("https://")) {
        issues.push({
            issue: "الرابط لا يستخدم HTTPS.",
            suggestion: "يُوصى باستخدام بروتوكول HTTPS لتأمين البيانات المرسلة بين المتصفح والخادم."
        });
    }

    // التحقق من كلمات مشبوهة
    if (url.includes("eval") || url.includes("<script>")) {
        issues.push({
            issue: "الرابط قد يحتوي على كود مشبوه.",
            suggestion: "تحقق من الكود للتأكد من عدم وجود أكواد غير آمنة مثل eval أو سكريبتات غير موثوقة."
        });
    }

    // عرض المشاكل الأولية
    if (issues.length > 0) {
        resultDiv.innerHTML = ` 
            <p style="color: red;">${translations[currentLang].issuesFoundMessage}</p>
            <ul>
                ${issues.map(issue => `
                    <li>${issue.issue}</li>
                    <p style="color: blue;">${translations[currentLang].suggestionLabel} ${issue.suggestion}</p>
                `).join("")}
            </ul>
            <p style="color: green;">${translations[currentLang].safeMessage}</p>
        `;
    } else {
        resultDiv.innerHTML = `<p style="color: green;">${translations[currentLang].safeMessage}</p>`;
    }

    // تحميل الصفحة وتحليلها
    try {
        const response = await fetch(url); // تحميل HTML الصفحة
        if (!response.ok) {
            throw new Error("فشل في تحميل الصفحة.");
        }
        const html = await response.text(); // قراءة المحتوى كـنص
        analyzePage(html, url, resultDiv);
    } catch (error) {
        resultDiv.innerHTML += `<p style="color: red;">حدث خطأ أثناء تحميل الصفحة: ${error.message}</p>`;
    }
});

// تحليل محتوى الصفحة
function analyzePage(html, url, resultDiv) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let issues = [];

    // فحص وجود أكواد JavaScript مشبوهة
    const scripts = doc.querySelectorAll("script");
    scripts.forEach(script => {
        if (script.textContent.includes("eval")) {
            issues.push({
                issue: translations[document.documentElement.lang].evalDetection,
                suggestion: translations[document.documentElement.lang].evalSuggestion
            });
        }
    });

    // فحص الحماية من XSS
    const forms = doc.querySelectorAll("form");
    forms.forEach(form => {
        if (!form.getAttribute("action") || form.getAttribute("action").startsWith("javascript:")) {
            issues.push({
                issue: translations[document.documentElement.lang].xssProtection,
                suggestion: translations[document.documentElement.lang].xssSuggestion
            });
        }
    });

    // فحص الحماية من CSRF
    forms.forEach(form => {
        if (!form.querySelector("input[name='csrf_token']")) {
            issues.push({
                issue: translations[document.documentElement.lang].csrfProtection,
                suggestion: translations[document.documentElement.lang].csrfSuggestion
            });
        }
    });

    // عرض النتائج
    if (issues.length > 0) {
        resultDiv.innerHTML += `
            <p style="color: red;">${translations[document.documentElement.lang].issuesFoundMessage}</p>
            <ul>
                ${issues.map(issue => `
                    <li><strong>${issue.issue}</strong></li>
                    <p style="color: blue;">${translations[document.documentElement.lang].suggestionLabel} ${issue.suggestion}</p>
                `).join("")}
            </ul>
        `;
    } else {
        resultDiv.innerHTML += `<p style="color: green;">${translations[document.documentElement.lang].noIssuesMessage}</p>`;
    }
}
