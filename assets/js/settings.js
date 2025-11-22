function initSettingsPage() {
    // console.log('Settings.js loaded!'); 

    // Load user settings from localStorage if available
    function loadSettings() {
        const username = localStorage.getItem('username');
        const profileImg = localStorage.getItem('profileImg');
        const subjectTemplate = localStorage.getItem('subjectTemplate');
        const bodyTemplate = localStorage.getItem('bodyTemplate');
        const fullName = localStorage.getItem('fullName');
        const companyName = localStorage.getItem('companyName');
        const address = localStorage.getItem('address');
        const contact = localStorage.getItem('contact');
        const email = localStorage.getItem('email');
        const website = localStorage.getItem('website');

        // console.log('Loaded username:', username);
        // console.log('Loaded profileImg:', profileImg);
        // console.log('Loaded subjectTemplate:', subjectTemplate);
        // console.log('Loaded bodyTemplate:', bodyTemplate);
        // console.log('Loaded fullName:', fullName);
        // console.log('Loaded companyName:', companyName);
        // console.log('Loaded address:', address);
        // console.log('Loaded contact:', contact);
        // console.log('Loaded email:', email);
        // console.log('Loaded website:', website);

        // Set the username in the input field if available
        const usernameField = document.getElementById('username');
        if (username && usernameField) {
            usernameField.value = username;
        }

        // Display the profile image if set
        const previewContainer = document.getElementById('preview-container');
        if (profileImg && previewContainer) {
            previewContainer.innerHTML = `<img id="profile-preview" src="${profileImg}" alt="Profile Image" style="max-width: 100%; max-height: 250px; object-fit: contain;">`;
        }

        // Set the subject and body templates
        if (subjectTemplate) {
            document.getElementById('subjectTemplate').value = subjectTemplate;
        }
        if (bodyTemplate) {
            document.getElementById('bodyTemplate').value = bodyTemplate;
        }

        // Set the personal details fields
        if (fullName) {
            document.getElementById('fullName').value = fullName;
        }
        if (companyName) {
            document.getElementById('companyName').value = companyName;
        }
        if (address) {
            document.getElementById('address').value = address;
        }
        if (contact) {
            document.getElementById('contact').value = contact;
        }
        if (email) {
            document.getElementById('email').value = email;
        }
        if (website) {
            document.getElementById('website').value = website;
        }
    }

    loadSettings();  // Load settings immediately when the page loads

    // Add event listener to the "Save" button after the content is injected into the DOM
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            console.log('Save button clicked!');
            saveSettings();
        });
    } else {
        console.log("Save button not found!");
    }

    // Add event listener to the "Save Webmail Templates" button
    const saveWebmailButton = document.getElementById('saveWebmailBtn');
    if (saveWebmailButton) {
        saveWebmailButton.addEventListener('click', function () {
            console.log('Save Webmail button clicked!');
            saveWebmailTemplates();
        });
    }

    // Preview the uploaded profile image before saving
    const profileImgInput = document.getElementById('profile-img');
    if (profileImgInput) {
        profileImgInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const previewContainer = document.getElementById('preview-container');
                    previewContainer.innerHTML = `<img id="profile-preview" src="${reader.result}" alt="Profile Image" style="max-width: 100%; max-height: 250px; object-fit: contain;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Function to save settings to localStorage
    // Function to save settings to localStorage
    function saveSettings() {
        const username = document.getElementById('username').value;
        const profileImg = document.getElementById('profile-img').files[0];

        // Save the username to localStorage
        if (username) {
            localStorage.setItem('username', username);
        }

        // Validate profile image size
        if (profileImg) {
            const maxFileSize = 2 * 1024 * 1024; // Set max file size (e.g., 2MB)

            if (profileImg.size > maxFileSize) {
                alert('Image size exceeds the 2MB limit. Please choose a smaller image.');
                return; // Exit the function if the image is too large
            }

            const reader = new FileReader();
            reader.onloadend = function () {
                localStorage.setItem('profileImg', reader.result);
                alert('Profile Image saved!');
            };
            reader.readAsDataURL(profileImg);
        }

        alert('Settings saved!');
    }


    // Function to save the webmail templates and personal details to localStorage
    function saveWebmailTemplates() {
        const subjectTemplate = document.getElementById('subjectTemplate').value;
        const bodyTemplate = document.getElementById('bodyTemplate').value;
        const fullName = document.getElementById('fullName').value;
        const companyName = document.getElementById('companyName').value;
        const address = document.getElementById('address').value;
        const contact = document.getElementById('contact').value;
        const email = document.getElementById('email').value;
        const website = document.getElementById('website').value;

        // Save the webmail templates and personal details to localStorage
        if (subjectTemplate) {
            localStorage.setItem('subjectTemplate', subjectTemplate);
        }
        if (bodyTemplate) {
            localStorage.setItem('bodyTemplate', bodyTemplate);
        }
        if (fullName) {
            localStorage.setItem('fullName', fullName);
        }
        if (companyName) {
            localStorage.setItem('companyName', companyName);
        }
        if (address) {
            localStorage.setItem('address', address);
        }
        if (contact) {
            localStorage.setItem('contact', contact);
        }
        if (email) {
            localStorage.setItem('email', email);
        }
        if (website) {
            localStorage.setItem('website', website);
        }

        alert('Webmail Templates and Personal Details saved!');
    }
}
