function initWebmailsPage() {
    console.log('Webmail.js loaded!');

    // --- 1. Element Selection ---
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');
    const companyInput = document.getElementById('companyInput');

    if (!emailSubject || !emailBody || !companyInput) {
        console.error('Required elements are missing in the DOM!');
        return;
    }

    // --- 2. Load Templates & Check ---
    const subjectTemplate = localStorage.getItem('subjectTemplate');
    const bodyTemplate = localStorage.getItem('bodyTemplate');

    if (!subjectTemplate || !bodyTemplate) {
        alert('Webmail templates are not set. Please configure them in the settings.');
        return;
    }

    // --- 3. Load Persistent Company Name and set input value ---
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
        companyInput.value = savedCompanyName;
    }

    // Function to update the subject and body based on company name input
    function updateEmailContent() {
        const companyName = companyInput.value.trim();
        let updatedSubject = subjectTemplate;
        let updatedBody = bodyTemplate;

        if (companyName) {
            // Replace {company} placeholder
            updatedSubject = subjectTemplate.replace(/{company}/g, companyName);
            updatedBody = bodyTemplate.replace(/{company}/g, companyName);
        }

        // Update the values in the input fields
        emailSubject.value = updatedSubject;
        emailBody.value = updatedBody;

        // --- CORE FIX: Save the Company Name Input itself ---
        localStorage.setItem('companyName', companyName); 
        
        // Note: You no longer need to save the final emailSubject/emailBody, 
        // as they are regenerated based on the Company Name and the Template.
        // I've removed the redundant lines:
        // localStorage.setItem('emailSubject', updatedSubject);
        // localStorage.setItem('emailBody', updatedBody);
    }

    // --- 4. Initialization and Event Listeners ---
    
    // Event listener to update the subject and body on input change
    companyInput.addEventListener('input', updateEmailContent);

    // Call updateEmailContent initially to populate all fields 
    // (It will use the value loaded in step 3)
    updateEmailContent();

    // Copy Subject to Clipboard
    const copySubjectButton = document.getElementById('copySubject');
    copySubjectButton.addEventListener('click', function () {
        // Use the modern navigator.clipboard API for better practice, 
        // but keeping your original method commented for compatibility:
        // navigator.clipboard.writeText(emailSubject.value).then(() => {
        //     alert('Subject copied to clipboard!');
        // });
        emailSubject.select();
        document.execCommand('copy');
        alert('Subject copied to clipboard!');
    });

    // Copy Body to Clipboard
    const copyBodyButton = document.getElementById('copyBody');
    copyBodyButton.addEventListener('click', function () {
        // navigator.clipboard.writeText(emailBody.value).then(() => {
        //     alert('Body copied to clipboard!');
        // });
        emailBody.select();
        document.execCommand('copy');
        alert('Body copied to clipboard!');
    });
}

// NOTE: Since main.js already calls initWebmailsPage() inside handlePageInit(),
// this line is redundant for your SPA structure and should be removed 
// from webmails.js to prevent it from running twice:
// document.addEventListener("DOMContentLoaded", initWebmailsPage);