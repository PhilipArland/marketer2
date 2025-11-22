// Reusable function for copying text and displaying alert
function copyText(elementId, friendlyName) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        document.execCommand('copy');
        alert(`${friendlyName} copied to clipboard!`);
    } else {
        console.error(`Copy target element not found: ${elementId}`);
    }
}

// Utility function to load and parse data from localStorage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

function initWebmailsPage() {
    console.log('Webmail.js loaded and fully initialized!');

    // --- 1. Template Elements ---
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');
    const companyInput = document.getElementById('companyInput');

    // --- 2. Report Elements (New) ---
    const country1 = document.getElementById('country1');
    const country2 = document.getElementById('country2');
    const marketInput = document.getElementById('marketInput');
    const reportOutput = document.getElementById('reportOutput');
    const copyReportButton = document.getElementById('copyReport');

    // --- 3. Display Elements (Personal Details) ---
    const displayFullName = document.getElementById('displayFullName');
    const displayMyCompanyName = document.getElementById('displayMyCompanyName');
    const displayEmail = document.getElementById('displayEmail');
    const displayContact = document.getElementById('displayContact');
    const displayAddress = document.getElementById('displayAddress');
    const displayWebsite = document.getElementById('displayWebsite');
    
    // --- 4. Collapse Elements (New Selection) ---
    const toggleButton = document.getElementById('togglePersonalDetails');
    const collapseElement = document.getElementById('personalDetailsCollapse');

    // --- 5. Load Templates & Core Data ---
    const subjectTemplate = localStorage.getItem('subjectTemplate') || '';
    const bodyTemplate = localStorage.getItem('bodyTemplate') || '';
    const savedTargetCompanyName = localStorage.getItem('companyName');
    const savedUsername = localStorage.getItem('username') || 'Team Member';
    const savedWebmailData = loadFromLocalStorage('webmailData');

    // --- 6. Helper Functions for Update and Save ---

    function saveToLocalStorage() {
        // Saves report input values
        localStorage.setItem("webmailData", JSON.stringify({
            country1: country1 ? country1.value : '',
            country2: country2 ? country2.value : '',
            market: marketInput ? marketInput.value : ''
        }));
    }

    function updateReport() {
        const c1 = country1 ? country1.value.trim() : "Country 1";
        const c2 = country2 ? country2.value.trim() : "Country 2";
        const market = marketInput ? marketInput.value.trim() : "your market segment";

        if (reportOutput) {
            reportOutput.value =
                `Hi team, I have finished sending webmails in ${c1} for ${market}. I will start sending webmails in ${c2} now.

- ${savedUsername}`;
        }
        saveToLocalStorage();
    }

    function updateEmailContent() {
        const targetCompanyName = companyInput ? companyInput.value.trim() : '';
        let updatedSubject = subjectTemplate;
        let updatedBody = bodyTemplate;

        if (targetCompanyName) {
            updatedSubject = subjectTemplate.replace(/{company}/g, targetCompanyName);
            updatedBody = bodyTemplate.replace(/{company}/g, targetCompanyName);
        }

        if (emailSubject) emailSubject.value = updatedSubject;
        if (emailBody) emailBody.value = updatedBody;

        localStorage.setItem('companyName', targetCompanyName);
    }

    // --- 7. Initialize Input Fields and Display ---

    // Target Company Input
    if (savedTargetCompanyName) {
        companyInput.value = savedTargetCompanyName;
    }

    // Report Inputs
    if (country1) country1.value = savedWebmailData.country1 || '';
    if (country2) country2.value = savedWebmailData.country2 || '';
    if (marketInput) marketInput.value = savedWebmailData.market || '';

    // Personal Details Display
    const placeholder = 'N/A (Set in Settings)';
    if (displayFullName) displayFullName.value = localStorage.getItem('fullName') || placeholder;
    if (displayMyCompanyName) displayMyCompanyName.value = localStorage.getItem('myCompanyName') || placeholder;
    if (displayEmail) displayEmail.value = localStorage.getItem('email') || placeholder;
    if (displayContact) displayContact.value = localStorage.getItem('contact') || placeholder;
    if (displayAddress) displayAddress.value = localStorage.getItem('address') || placeholder;
    if (displayWebsite) displayWebsite.value = localStorage.getItem('website') || placeholder;


    // --- 8. Event Listeners ---

    // ** PERSONAL DETAILS COLLAPSE LISTENER (MOVED HERE) **
    if (collapseElement && toggleButton) {
        collapseElement.addEventListener('shown.bs.collapse', function () {
            toggleButton.querySelector('i').classList.remove('bi-plus-lg');
            toggleButton.querySelector('i').classList.add('bi-dash-lg');
        });

        collapseElement.addEventListener('hidden.bs.collapse', function () {
            toggleButton.querySelector('i').classList.remove('bi-dash-lg');
            toggleButton.querySelector('i').classList.add('bi-plus-lg');
        });
    }

    // Report Inputs
    const reportInputs = [country1, country2, marketInput];
    reportInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateReport);
        }
    });

    // Template Input
    if (companyInput) {
        companyInput.addEventListener('input', updateEmailContent);
    }

    // Copy Buttons
    if (copyReportButton) {
        copyReportButton.addEventListener('click', () => copyText('reportOutput', 'Progress Report'));
    }
    document.getElementById('copySubject').addEventListener('click', () => copyText('emailSubject', 'Subject'));
    document.getElementById('copyBody').addEventListener('click', () => copyText('emailBody', 'Body'));
    document.getElementById('copyFullName').addEventListener('click', () => copyText('displayFullName', 'Full Name'));
    document.getElementById('copyMyCompanyName').addEventListener('click', () => copyText('displayMyCompanyName', 'Company Name'));
    document.getElementById('copyEmail').addEventListener('click', () => copyText('displayEmail', 'Email'));
    document.getElementById('copyContact').addEventListener('click', () => copyText('displayContact', 'Contact'));
    document.getElementById('copyAddress').addEventListener('click', () => copyText('displayAddress', 'Address'));
    document.getElementById('copyWebsite').addEventListener('click', () => copyText('displayWebsite', 'Website URL'));

    // --- 9. Initial Population ---
    updateEmailContent();
    updateReport();
}