document.addEventListener('DOMContentLoaded', function () {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                  navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    
    const errorElement = document.getElementById('error');
    const toastOpacityToggle = document.getElementById('toastOpacityToggle');
    const opacityLevelDisplay = document.getElementById('opacityLevel');
    const uninstallButton = document.getElementById('uninstallButton');
    
    // Quick setup elements
    const apiKeyInput = document.getElementById('apiKey');
    const quickActivateBtn = document.getElementById('quickActivate');
    const testAPIConfigButton = document.getElementById('testAPIConfig');
    const quickModelSelect = document.getElementById('quickModelSelect');
    const setupStatus = document.getElementById('setupStatus');
    const quickSetupResult = document.getElementById('quickSetupResult');
    
    // Advanced config elements
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedConfig = document.getElementById('advancedConfig');
    const aiProviderSelect = document.getElementById('aiProvider');
    const customEndpointDiv = document.getElementById('customEndpointDiv');
    const customEndpointInput = document.getElementById('customEndpoint');
    const advancedApiKeyInput = document.getElementById('advancedApiKey');
    const modelNameInput = document.getElementById('modelName');
    const advancedSaveBtn = document.getElementById('advancedSave');

    // ---- Quick Setup Flow ----

    function showResult(msg, success) {
        quickSetupResult.style.display = 'block';
        quickSetupResult.textContent = msg;
        if (success) {
            quickSetupResult.style.background = 'rgba(34, 197, 94, 0.15)';
            quickSetupResult.style.color = '#4ade80';
            quickSetupResult.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        } else {
            quickSetupResult.style.background = 'rgba(239, 68, 68, 0.15)';
            quickSetupResult.style.color = '#fca5a5';
            quickSetupResult.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        }
        setTimeout(() => { quickSetupResult.style.display = 'none'; }, 4000);
    }

    function updateStatus(configured) {
        if (configured) {
            setupStatus.textContent = 'ACTIVE';
            setupStatus.style.background = 'rgba(34, 197, 94, 0.15)';
            setupStatus.style.color = '#4ade80';
            setupStatus.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        } else {
            setupStatus.textContent = 'NOT CONFIGURED';
            setupStatus.style.background = 'rgba(239, 68, 68, 0.15)';
            setupStatus.style.color = '#fca5a5';
            setupStatus.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        }
    }

    // Quick Activate — one click save
    if (quickActivateBtn) {
        quickActivateBtn.addEventListener('click', async () => {
            const key = apiKeyInput?.value?.trim();
            if (!key) {
                showResult('Please enter your OpenRouter API key', false);
                return;
            }

            const model = quickModelSelect?.value || 'openai/gpt-oss-120b:free';

            try {
                await chrome.storage.local.set({
                    useCustomAPI: true,
                    aiProvider: 'openrouter',
                    customAPIKey: key,
                    customModelName: model,
                    customEndpoint: ''
                });
                updateStatus(true);
                showResult('✓ Activated! Using ' + model.split('/').pop().replace(':free', ''), true);
                clearChatHistoryOnProviderChange();
            } catch (e) {
                showResult('Failed to save configuration', false);
            }
        });
    }

    // Model change auto-saves if key exists
    if (quickModelSelect) {
        quickModelSelect.addEventListener('change', async () => {
            const key = apiKeyInput?.value?.trim();
            if (key) {
                try {
                    await chrome.storage.local.set({
                        useCustomAPI: true,
                        aiProvider: 'openrouter',
                        customAPIKey: key,
                        customModelName: quickModelSelect.value,
                        customEndpoint: ''
                    });
                    showResult('✓ Model updated', true);
                    clearChatHistoryOnProviderChange();
                } catch (e) {}
            }
        });
    }

    // Test button
    if (testAPIConfigButton) {
        testAPIConfigButton.addEventListener('click', async () => {
            const key = apiKeyInput?.value?.trim();
            if (!key) {
                showResult('Enter your API key first', false);
                return;
            }

            const model = quickModelSelect?.value || 'openai/gpt-oss-120b:free';
            testAPIConfigButton.textContent = '...';
            testAPIConfigButton.disabled = true;

            try {
                chrome.runtime.sendMessage({
                    action: 'testCustomAPI',
                    config: {
                        aiProvider: 'openrouter',
                        customEndpoint: '',
                        apiKey: key,
                        modelName: model
                    }
                }, (response) => {
                    testAPIConfigButton.textContent = 'Test';
                    testAPIConfigButton.disabled = false;

                    if (response?.success) {
                        showResult('✓ Connection successful!', true);
                        updateStatus(true);
                        // Auto-save on successful test
                        chrome.storage.local.set({
                            useCustomAPI: true,
                            aiProvider: 'openrouter',
                            customAPIKey: key,
                            customModelName: model,
                            customEndpoint: ''
                        });
                    } else {
                        showResult('✗ ' + (response?.error || 'Connection failed'), false);
                    }
                });
            } catch (e) {
                testAPIConfigButton.textContent = 'Test';
                testAPIConfigButton.disabled = false;
                showResult('Error: ' + e.message, false);
            }
        });
    }

    // ---- Advanced Config ----

    if (advancedToggle) {
        advancedToggle.addEventListener('click', () => {
            const visible = advancedConfig.style.display !== 'none';
            advancedConfig.style.display = visible ? 'none' : 'block';
            advancedToggle.textContent = visible 
                ? '▶ Advanced: Use other providers (OpenAI, Anthropic, etc.)'
                : '▼ Advanced: Use other providers (OpenAI, Anthropic, etc.)';
            advancedToggle.style.color = visible ? '#666' : '#f87171';
        });
    }

    if (aiProviderSelect) {
        aiProviderSelect.addEventListener('change', function() {
            customEndpointDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        });
    }

    if (advancedSaveBtn) {
        advancedSaveBtn.addEventListener('click', async () => {
            const provider = aiProviderSelect?.value;
            const key = advancedApiKeyInput?.value?.trim();
            const endpoint = customEndpointInput?.value?.trim();
            const model = modelNameInput?.value?.trim();

            if (!key) {
                showError('Please enter an API key', 3000);
                return;
            }

            advancedSaveBtn.textContent = 'Saving...';
            advancedSaveBtn.disabled = true;

            try {
                await chrome.storage.local.set({
                    useCustomAPI: true,
                    aiProvider: provider,
                    customAPIKey: key,
                    customEndpoint: endpoint,
                    customModelName: model
                });

                // Test the connection
                chrome.runtime.sendMessage({
                    action: 'testCustomAPI',
                    config: { aiProvider: provider, customEndpoint: endpoint, apiKey: key, modelName: model }
                }, (response) => {
                    advancedSaveBtn.textContent = 'Save & Test';
                    advancedSaveBtn.disabled = false;

                    if (response?.success) {
                        showError('✓ Saved & connected!', 3000);
                        updateStatus(true);
                    } else {
                        showError('Saved, but test failed: ' + (response?.error || 'Unknown error'), 5000);
                    }
                });

                clearChatHistoryOnProviderChange();
            } catch (e) {
                advancedSaveBtn.textContent = 'Save & Test';
                advancedSaveBtn.disabled = false;
                showError('Error saving: ' + e.message, 5000);
            }
        });
    }

    // ---- Load saved config ----

    function loadConfig() {
        chrome.storage.local.get([
            'aiProvider', 'customAPIKey', 'customModelName', 'customEndpoint'
        ], (result) => {
            const hasKey = !!(result.customAPIKey);

            // Update status badge
            updateStatus(hasKey);

            // Populate quick setup
            if (result.customAPIKey && apiKeyInput) {
                apiKeyInput.value = result.customAPIKey;
            }
            if (result.customModelName && quickModelSelect) {
                // Try to match saved model to dropdown
                const options = Array.from(quickModelSelect.options).map(o => o.value);
                if (options.includes(result.customModelName)) {
                    quickModelSelect.value = result.customModelName;
                }
            }

            // Populate advanced form
            if (result.aiProvider && aiProviderSelect) {
                aiProviderSelect.value = result.aiProvider;
                if (result.aiProvider === 'custom') {
                    customEndpointDiv.style.display = 'block';
                }
            }
            if (result.customEndpoint && customEndpointInput) {
                customEndpointInput.value = result.customEndpoint;
            }
            if (result.customAPIKey && advancedApiKeyInput) {
                advancedApiKeyInput.value = result.customAPIKey;
            }
            if (result.customModelName && modelNameInput) {
                modelNameInput.value = result.customModelName;
            }
        });
    }

    // ---- Shared Utilities ----

    function clearChatHistoryOnProviderChange() {
        try {
            chrome.tabs.query({}, function(tabs) {
                tabs.forEach(tab => {
                    try {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'clearChatHistory',
                            reason: 'providerChange'
                        }).catch(() => {});
                    } catch (e) {}
                });
            });
        } catch (e) {}
    }

    function showError(message, duration = 5000) {
        errorElement.innerText = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.innerText = '';
            errorElement.classList.add('hidden');
        }, duration);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // ---- Shortcuts Platform Update ----

    function updateShortcutsForPlatform() {
        const shortcutMappings = {
            'Control + Shift + T': isMac ? 'Control + Shift + T' : 'Alt + Shift + T',
            'Control + Shift + H': isMac ? 'Control + Shift + H' : 'Alt + Shift + H',
            'Option + Shift + A': isMac ? 'Option + Shift + A' : 'Alt + Shift + A',
            'Option + Shift + S': isMac ? 'Option + Shift + S' : 'Alt + Shift + S',
            'Option + Shift + M': isMac ? 'Option + Shift + M' : 'Alt + Shift + M',
            'Option + Shift + N': isMac ? 'Option + Shift + N' : 'Alt + Shift + N',
            'Option + Shift + V': isMac ? 'Option + Shift + V' : 'Alt + Shift + V',
            'Option + C': isMac ? 'Option + C' : 'Alt + C',
            'Option + O': isMac ? 'Option + O' : 'Alt + O'
        };

        document.querySelectorAll('.shortcut-key').forEach(element => {
            const currentText = element.textContent.trim();
            if (shortcutMappings[currentText]) {
                element.textContent = shortcutMappings[currentText];
            }
        });

        const opacityShortcutInfo = document.querySelector('.toggle-info');
        if (opacityShortcutInfo && opacityShortcutInfo.textContent.includes('Shortcut:')) {
            opacityShortcutInfo.textContent = `Shortcut: ${isMac ? 'Option + O' : 'Alt + O'}`;
        }
    }

    const chatShortcutElement = document.getElementById('chatShortcut');
    if (chatShortcutElement) {
        chatShortcutElement.textContent = isMac ? 'Option+C' : 'Alt+C';
    }

    // ---- Tabs ----

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) content.classList.add('active');
            });
        });
    });

    // ---- Toast Opacity ----

    function initializeOpacityLevel() {
        chrome.storage.local.get(['toastOpacityLevel'], (result) => {
            if (result.toastOpacityLevel) {
                opacityLevelDisplay.textContent = capitalizeFirstLetter(result.toastOpacityLevel);
            } else {
                opacityLevelDisplay.textContent = 'High';
            }
        });
    }

    if (toastOpacityToggle) {
        toastOpacityToggle.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: 'toggleToastOpacity' }, (response) => {
                if (response?.success) {
                    opacityLevelDisplay.textContent = capitalizeFirstLetter(response.level);
                    showError(`Toast opacity: ${capitalizeFirstLetter(response.level)}`, 2000);
                }
            });
        });
    }

    // ---- Uninstall ----

    if (uninstallButton) {
        uninstallButton.addEventListener('click', async () => {
            try {
                await chrome.storage.local.clear();
                chrome.management.uninstallSelf();
            } catch (e) {
                errorElement.textContent = 'Error uninstalling extension';
            }
        });
    }

    // ---- Network Error ----

    window.addEventListener('offline', () => {
        showError('No internet connection. Please check your network.');
    });

    // ---- Initialize ----

    loadConfig();
    initializeOpacityLevel();
    updateShortcutsForPlatform();
    chrome.storage.local.set({ useCustomAPI: true });
});
