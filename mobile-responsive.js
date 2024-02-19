document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    document.getElementById('themeToggle').addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.setAttribute('data-bs-theme', 'light');
        }
    });

    const minWidthQuery = window.matchMedia('(min-width: 768px)');
    const maxWidthQuery = window.matchMedia('(max-width: 767px)');

    function handleMinWidthChange(e) {
        if (e.matches) {
            console.log('Viewport is 768px or wider');
            // Your JavaScript for larger screens
            // Select the toolbar by its ID or class
            const toolbar = document.querySelector('#toolbar'); // Replace '#toolbar' with your toolbar's selector

            // Find the first child div of the toolbar
            const firstChildDiv = toolbar.querySelector('div:first-child');

            // Check if the first child div has the class 'btn-group'
            if (firstChildDiv.classList.contains('btn-group')) {
                // Remove the 'btn-group' class
                firstChildDiv.classList.remove('btn-group');
                // Add the 'btn-group-vertical' class
                firstChildDiv.classList.add('btn-group-vertical');
            }
        }
    }

    function handleMaxWidthChange(e) {
        if (e.matches) {
            console.log('Viewport is 767px or narrower');
            // Your JavaScript for smaller screens
            // Select the toolbar by its ID or class
            const toolbar = document.querySelector('#toolbar'); // Replace '#toolbar' with your toolbar's selector

            const firstChildDiv = toolbar.querySelector('div:first-child');

            // Check if the first child div has the class 'btn-group'
            if (firstChildDiv.classList.contains('btn-group-vertical')) {
                // Remove the 'btn-group' class
                firstChildDiv.classList.add('btn-group');
                // Add the 'btn-group-vertical' class
                firstChildDiv.classList.remove('btn-group-vertical');
            }
        }
    }

    // Attach listeners to the MediaQueryList objects
    minWidthQuery.addListener(handleMinWidthChange);
    maxWidthQuery.addListener(handleMaxWidthChange);

    // Initial check
    handleMinWidthChange(minWidthQuery);
    handleMaxWidthChange(maxWidthQuery);
});
