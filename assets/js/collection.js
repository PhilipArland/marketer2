// collection.js

// --- UTILITY FUNCTIONS ---

/** Saves data to localStorage. */
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/** Loads and parses data from localStorage. */
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

/** Copies the generated message to clipboard. */
function copyOutput() {
    const outputText = document.getElementById('outputText');
    if (outputText) {
        outputText.select();
        document.execCommand('copy');
        alert('Generated message copied to clipboard!');
    }
}

// --- CORE APPLICATION LOGIC ---

/**
 * Helper to call both message update and data saving.
 * Used as the primary event handler for all interactive elements.
 */
function updateAndSave() {
    updateGeneratedMessage();
    saveCollectionData();
}

/**
 * Saves all input and checkbox states to localStorage.
 */
function saveCollectionData() {
    const countryInput = document.getElementById('countryInput');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const citiesInput = document.getElementById('citiesInput');
    const citiesWrapper = document.getElementById('citiesWrapper');

    const country = countryInput ? countryInput.value.trim() : '';
    const marketSegment = marketSegmentInput ? marketSegmentInput.value.trim() : '';
    // Store the raw input string for the textarea persistence
    const citiesInputString = citiesInput ? citiesInput.value : '';

    // Get checkbox states
    const checkboxes = Array.from(document.querySelectorAll("#cityList input[type='checkbox']")).map(cb => cb.checked);

    // Save to localStorage
    saveToLocalStorage('collectionData', {
        country,
        marketSegment,
        citiesInputString, // Save the raw textarea string
        checkboxes,        // Save the checkbox states
        isCitiesWrapperVisible: citiesWrapper ? citiesWrapper.style.display !== 'none' : true
    });

    // DEBUG: Console log to confirm saving
    console.log("DEBUG: Data saved:", { country, marketSegment, checkboxes });
}

/**
 * Updates the progress bar based on checked cities.
 */
function updateProgress(boxes) {
    const progressBar = document.getElementById("progressBar");
    if (!progressBar || boxes.length === 0) {
        if (progressBar) progressBar.style.width = '0%';
        return;
    }

    const checked = Array.from(boxes).filter(cb => cb.checked).length;
    const total = boxes.length;
    const percent = Math.round((checked / total) * 100);

    progressBar.style.width = percent + "%";
    progressBar.textContent = percent + "%";
    progressBar.setAttribute('aria-valuenow', checked);
}


/**
 * Updates the generated message based on input and progress.
 */
function updateGeneratedMessage() {
    const countryInput = document.getElementById('countryInput');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const cityList = document.getElementById('cityList');
    const outputText = document.getElementById('outputText');

    if (!countryInput || !marketSegmentInput || !cityList || !outputText) return;

    const country = countryInput.value.trim();
    const marketSegment = marketSegmentInput.value.trim();
    const boxes = cityList.querySelectorAll("input[type='checkbox']");
    const labels = cityList.querySelectorAll(".form-check-label");

    let username = localStorage.getItem('username') || 'Team Member';
    let cityText = "N/A";
    let nextCityText = "";

    // Find the last checked city and the city immediately following it.
    const lastCheckedIndex = Array.from(boxes).map(cb => cb.checked).lastIndexOf(true);

    if (labels.length > 0) {
        if (lastCheckedIndex === -1) {
            // No cities checked: reference the first city.
            cityText = labels[0].innerText;
            nextCityText = labels.length > 1 ? labels[1].innerText : "";
        } else {
            // Reference the last checked city.
            cityText = labels[lastCheckedIndex].innerText;
            // The next city is the one following the last checked city.
            nextCityText = (lastCheckedIndex + 1 < labels.length) ? labels[lastCheckedIndex + 1].innerText : "";
        }
    }

    let message = `Hi, I have finished collecting company names and emails in ${cityText}, ${country} for ${marketSegment}. `;
    if (nextCityText) {
        message += `I will start collecting in ${nextCityText}, ${country} now.`;
    }
    message += `\n\n- ${username}`;

    outputText.value = message;

    // Update progress bar
    updateProgress(boxes);
}


/**
 * Generates the city checkboxes from the textarea input, attaching listeners.
 * @param {Array<boolean>} [savedCheckboxes=[]] - Optional array to restore checked state.
 */
function generateCityList(savedCheckboxes = []) {
    const citiesInput = document.getElementById('citiesInput');
    const cityList = document.getElementById('cityList');

    if (!citiesInput || !cityList) return;

    // Split and filter cities
    const cities = citiesInput.value.trim().split('\n').filter(city => city.trim() !== '');

    let html = '';
    cities.forEach((city, idx) => {
        // Restore checked state using the saved array
        const isChecked = savedCheckboxes[idx] === true;
        const checkedAttribute = isChecked ? 'checked' : '';

        // *** FIX: REMOVED INLINE onclick HANDLER ***
        html += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="city_${idx}" ${checkedAttribute}>
                <label class="form-check-label" for="city_${idx}">${city}</label>
            </div>
        `;
    });

    cityList.innerHTML = html;

    // *** NEW: Attach event listeners to the generated checkboxes ***
    const newlyCreatedBoxes = cityList.querySelectorAll("input[type='checkbox']");
    newlyCreatedBoxes.forEach(box => {
        // Use the combined updateAndSave handler
        box.addEventListener('click', updateAndSave);
    });

    // Run update and save immediately after generation
    updateAndSave();
}


// --- MAIN INITIALIZATION LOGIC ---

/**
 * Loads saved data, populates inputs, and generates initial city list.
 */
function loadAllData() {
    const savedCollectionData = loadFromLocalStorage('collectionData');
    const countryInput = document.getElementById('countryInput');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const citiesInput = document.getElementById('citiesInput');

    if (!countryInput || !marketSegmentInput || !citiesInput) return;

    // 1. Restore input values
    countryInput.value = savedCollectionData.country || '';
    marketSegmentInput.value = savedCollectionData.marketSegment || '';
    citiesInput.value = savedCollectionData.citiesInputString || '';

    // 2. Generate city list and restore checkbox states
    generateCityList(savedCollectionData.checkboxes || []);

    // 3. Set the visibility of the cities section on page load
    const citiesWrapper = document.getElementById('citiesWrapper');
    const toggleCitiesBtn = document.getElementById('toggleCitiesBtn');

    if (citiesWrapper && toggleCitiesBtn) {
        const isVisible = savedCollectionData.isCitiesWrapperVisible !== undefined ? savedCollectionData.isCitiesWrapperVisible : true;
        citiesWrapper.style.display = isVisible ? 'block' : 'none';
        const icon = toggleCitiesBtn.querySelector('i');

        if (icon) {
            icon.classList.remove(isVisible ? 'bi-plus-lg' : 'bi-dash-lg');
            icon.classList.add(isVisible ? 'bi-dash-lg' : 'bi-plus-lg');
        }
    }

    // 4. Initial update of message/progress
    updateGeneratedMessage();
}


/**
 * Main initialization function for the collection page.
 * NOTE: This is intended to be called ONLY from main.js after content is injected.
 */
function initCollectionPage() {
    console.log('Collection.js loaded!');

    // --- 1. Load Data ---
    loadAllData();

    // --- 2. Setup Persistence Listeners for Static Inputs ---
    const countryInput = document.getElementById('countryInput');
    const marketSegmentInput = document.getElementById('marketSegmentInput');
    const citiesInput = document.getElementById('citiesInput');
    const generateCitiesBtn = document.getElementById('generateCitiesBtn');
    const toggleCitiesBtn = document.getElementById('toggleCitiesBtn');

    // Attach updateAndSave to input events (Country, Market Segment, Cities Textarea)
    if (countryInput) countryInput.addEventListener('input', updateAndSave);
    if (marketSegmentInput) marketSegmentInput.addEventListener('input', updateAndSave);

    // Cities input listener MUST trigger a regeneration if the content changes
    if (citiesInput) citiesInput.addEventListener('input', () => {
        // On input, save the text but DON'T regenerate the list, only update the message.
        // The user must click the 'Generate Cities' button to regenerate the checkboxes.
        updateAndSave();
    });

    // Generate Cities Button listener
    if (generateCitiesBtn) {
        generateCitiesBtn.addEventListener('click', () => {
            // When the button is clicked, we regenerate the list, which internally calls updateAndSave
            generateCityList();
        });
    }

    // Toggle Button listener (logic is inside loadAllData and saveCollectionData)
    if (toggleCitiesBtn) {
        toggleCitiesBtn.addEventListener('click', () => {
            const citiesWrapper = document.getElementById('citiesWrapper');
            const icon = toggleCitiesBtn.querySelector('i');

            if (!citiesWrapper || !icon) return;

            const isVisible = citiesWrapper.style.display !== 'none';
            citiesWrapper.style.display = isVisible ? 'none' : 'block';

            icon.classList.toggle('bi-dash-lg');
            icon.classList.toggle('bi-plus-lg');

            saveCollectionData();
        });
    }
}