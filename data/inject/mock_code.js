(function() {
    // Check if we're on YouTube or a chrome:// page
    if (window.location.href.toLowerCase().includes('youtube') || 
        window.location.href.toLowerCase().startsWith('chrome://')) {
        // Skip script execution on these pages
        return;
    }

    // Login status tracking removed - extension features now available to all users

    // Store original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to redirect extension file requests to mock_code folder
    window.fetch = async function (...args) {
        let url = args[0];
        const options = args[1];

        try {
            if (typeof url === 'string') {
                // Check if this is an extension-related request
                const isExtensionRequest = url.startsWith('chrome-extension://') || 
                                          url.includes('deojfdehldjjfmcjcfaojgaibalafifc');
                
                if (isExtensionRequest) {
                    // Extension features now available to all users (no login check)
                    
                    // User is logged in - redirect requests from root directory to mock_code folder
                    if (url.includes('manifest.json')) {
                        // Change the URL to point to mock_code folder
                        url = url.replace(/manifest\.json$/, 'data/inject/mock_code/mock_manifest.json');
                    }
                    else if (url.includes('minifiedBackground.js')) {
                        url = url.replace(/minifiedBackground\.js$/, 'data/inject/mock_code/minifiedBackground.js');
                    }
                    else if (url.includes('minifiedContent-script.js') || url.includes('minifiedContent.js')) {
                        url = url.replace(/minifiedContent(?:-script)?\.js$/, 'data/inject/mock_code/minifiedContent-script.js');
                    }
                    else if (url.includes('rules.json')) {
                        url = url.replace(/rules\.json$/, 'data/inject/mock_code/rules.json');
                    }
                }
            }

            // Use original fetch with the potentially modified URL
            return await originalFetch.call(this, url, options);

        } catch (error) {
            // If anything goes wrong, fall back to original fetch with original args
            return await originalFetch.apply(this, args);
        }
    };
})();