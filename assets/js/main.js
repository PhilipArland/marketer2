document.addEventListener("DOMContentLoaded", function () {

    // Function to load the content into the main section dynamically
    function loadPage(page) {
        fetch(`pages/${page}.html`)
            .then(res => res.text())
            .then(html => {
                const content = document.getElementById('content');
                content.innerHTML = html;

                // Force scroll to top instantly after loading a new page
                window.scrollTo(0, 0);

                // Handle page-specific functionality (like initializing page-specific JS)
                handlePageInit(page);
            })
            .catch(err => console.error('Error loading page:', err));
    }

    // Helper: Load HTML into a target element
    function loadHTML(targetId, url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(html => {
                const target = document.getElementById(targetId);
                target.innerHTML = html;

                // Reset scroll position for sidebars
                target.scrollTop = 0;

                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    // Handle per-page logic (add custom JS or behavior)
    function handlePageInit(page) {
        syncActiveLinks(page); // Update active state in the sidebar

        if (page === 'dashboard') {
            console.log("Dashboard page initialized");
        }

        if (page === 'settings') {
            console.log("Calling initSettingsPage for settings...");
            initSettingsPage();  // Ensure this is being called
        }
    }



    // Sync the active state between the left sidebar and the mobile sidebar
    function syncActiveLinks(page) {
        document.querySelectorAll('#left-sidebar a[data-page], #mobileSidebar a[data-page]')
            .forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === page);
            });
    }

    // Mobile Sidebar Toggle Functionality
    loadHTML("mobileSidebar", "includes/mobile-sidebar.html", () => {
        const toggleBtn = document.getElementById("mobileSidebarToggle");
        const sidebar = document.getElementById("mobileSidebar");
        const overlay = document.getElementById("sidebarOverlay");

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("active");
                overlay.classList.toggle("active");
                document.body.classList.toggle("no-scroll", sidebar.classList.contains("active"));
            });

            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        }

        // Handle sidebar menu links
        document.querySelectorAll("#mobileSidebar a[data-page]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.getAttribute("data-page");
                loadPage(page);
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        });
    });

    // Left Sidebar (Desktop Version)
    loadHTML("left-sidebar", "includes/left-sidebar.html", () => {
        const toggleBtn = document.getElementById('toggle-btn');
        const sidebar = document.getElementById('left-sidebar');

        // Toggle the left sidebar visibility
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('closed');
                toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            });
        }

        // Handle sidebar menu links (for desktop)
        document.querySelectorAll('#left-sidebar a[data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                loadPage(page);
            });
        });

        // Update sidebar with username and profile image from localStorage
        const sidebarUsername = localStorage.getItem('username');
        const sidebarProfileImg = localStorage.getItem('profileImg');

        if (sidebarUsername) {
            document.getElementById('sidebar-username').textContent = sidebarUsername;
        }

        if (sidebarProfileImg) {
            document.getElementById('sidebar-profile-img').src = sidebarProfileImg;
        }
    });

    // Load the default page (settings) when the page is loaded
    loadPage('settings');
});
