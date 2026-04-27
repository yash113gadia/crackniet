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

    // ---- Helpers ----

    function showResult(msg, success) {
        if (!quickSetupResult) return;
        quickSetupResult.style.display = 'block';
        quickSetupResult.textContent = msg;
        quickSetupResult.style.background = success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        quickSetupResult.style.color = success ? '#4ade80' : '#fca5a5';
        quickSetupResult.style.border = success ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)';
        setTimeout(function() { quickSetupResult.style.display = 'none'; }, 4000);
    }

    function updateStatus(configured) {
        if (!setupStatus) return;
        setupStatus.textContent = configured ? 'ACTIVE' : 'NOT CONFIGURED';
        setupStatus.style.background = configured ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        setupStatus.style.color = configured ? '#4ade80' : '#fca5a5';
        setupStatus.style.border = configured ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)';
    }

    function showError(message, duration) {
        if (!errorElement) return;
        duration = duration || 5000;
        errorElement.innerText = message;
        errorElement.classList.remove('hidden');
        setTimeout(function() {
            errorElement.innerText = '';
            errorElement.classList.add('hidden');
        }, duration);
    }

    function clearChatHistoryOnProviderChange() {
        try {
            chrome.tabs.query({}, function(tabs) {
                tabs.forEach(function(tab) {
                    try {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'clearChatHistory',
                            reason: 'providerChange'
                        }).catch(function() {});
                    } catch (e) {}
                });
            });
        } catch (e) {}
    }

    // ---- Quick Setup: Activate ----

    if (quickActivateBtn) {
        quickActivateBtn.addEventListener('click', function() {
            var key = apiKeyInput ? apiKeyInput.value.trim() : '';
            if (!key) {
                showResult('Please enter your OpenRouter API key', false);
                return;
            }

            var model = quickModelSelect ? quickModelSelect.value : 'openai/gpt-oss-120b:free';

            chrome.storage.local.set({
                useCustomAPI: true,
                aiProvider: 'openrouter',
                customAPIKey: key,
                customModelName: model,
                customEndpoint: ''
            }, function() {
                if (chrome.runtime.lastError) {
                    showResult('Failed to save: ' + chrome.runtime.lastError.message, false);
                    return;
                }
                updateStatus(true);
                var modelShort = model.split('/').pop().replace(':free', '');
                showResult('✓ Activated! Using ' + modelShort, true);
                clearChatHistoryOnProviderChange();
            });
        });
    }

    // ---- Quick Setup: Model change auto-save ----

    if (quickModelSelect) {
        quickModelSelect.addEventListener('change', function() {
            var key = apiKeyInput ? apiKeyInput.value.trim() : '';
            if (!key) return;

            chrome.storage.local.set({
                useCustomAPI: true,
                aiProvider: 'openrouter',
                customAPIKey: key,
                customModelName: quickModelSelect.value,
                customEndpoint: ''
            }, function() {
                if (chrome.runtime.lastError) return;
                showResult('✓ Model updated', true);
                clearChatHistoryOnProviderChange();
            });
        });
    }

    // ---- Quick Setup: Test ----

    if (testAPIConfigButton) {
        testAPIConfigButton.addEventListener('click', function() {
            var key = apiKeyInput ? apiKeyInput.value.trim() : '';
            if (!key) {
                showResult('Enter your API key first', false);
                return;
            }

            var model = quickModelSelect ? quickModelSelect.value : 'openai/gpt-oss-120b:free';
            testAPIConfigButton.textContent = '...';
            testAPIConfigButton.disabled = true;

            chrome.runtime.sendMessage({
                action: 'testCustomAPI',
                config: {
                    aiProvider: 'openrouter',
                    customEndpoint: '',
                    apiKey: key,
                    modelName: model
                }
            }, function(response) {
                testAPIConfigButton.textContent = 'Test';
                testAPIConfigButton.disabled = false;

                if (chrome.runtime.lastError) {
                    showResult('✗ ' + chrome.runtime.lastError.message, false);
                    return;
                }

                if (response && response.success) {
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
                    showResult('✗ ' + (response ? response.error : 'No response from worker'), false);
                }
            });
        });
    }

    // ---- Advanced Config Toggle ----

    if (advancedToggle) {
        advancedToggle.addEventListener('click', function() {
            var visible = advancedConfig.style.display !== 'none';
            advancedConfig.style.display = visible ? 'none' : 'block';
            advancedToggle.textContent = visible 
                ? '▶ Advanced: Use other providers (OpenAI, Anthropic, etc.)'
                : '▼ Advanced: Use other providers (OpenAI, Anthropic, etc.)';
            advancedToggle.style.color = visible ? '#666' : '#f87171';
        });
    }

    if (aiProviderSelect) {
        aiProviderSelect.addEventListener('change', function() {
            if (customEndpointDiv) {
                customEndpointDiv.style.display = this.value === 'custom' ? 'block' : 'none';
            }
        });
    }

    // ---- Advanced Config: Save & Test ----

    if (advancedSaveBtn) {
        advancedSaveBtn.addEventListener('click', function() {
            var provider = aiProviderSelect ? aiProviderSelect.value : 'openai';
            var key = advancedApiKeyInput ? advancedApiKeyInput.value.trim() : '';
            var endpoint = customEndpointInput ? customEndpointInput.value.trim() : '';
            var model = modelNameInput ? modelNameInput.value.trim() : '';

            if (!key) {
                showError('Please enter an API key', 3000);
                return;
            }

            advancedSaveBtn.textContent = 'Saving...';
            advancedSaveBtn.disabled = true;

            chrome.storage.local.set({
                useCustomAPI: true,
                aiProvider: provider,
                customAPIKey: key,
                customEndpoint: endpoint,
                customModelName: model
            }, function() {
                if (chrome.runtime.lastError) {
                    advancedSaveBtn.textContent = 'Save & Test';
                    advancedSaveBtn.disabled = false;
                    showError('Failed to save: ' + chrome.runtime.lastError.message, 5000);
                    return;
                }

                // Test the connection
                chrome.runtime.sendMessage({
                    action: 'testCustomAPI',
                    config: {
                        aiProvider: provider,
                        customEndpoint: endpoint,
                        apiKey: key,
                        modelName: model
                    }
                }, function(response) {
                    advancedSaveBtn.textContent = 'Save & Test';
                    advancedSaveBtn.disabled = false;

                    if (response && response.success) {
                        showError('✓ Saved & connected!', 3000);
                        updateStatus(true);
                    } else {
                        showError('Saved, but test failed: ' + (response ? response.error : 'Unknown'), 5000);
                    }
                });

                clearChatHistoryOnProviderChange();
            });
        });
    }

    // ---- Load Saved Config ----

    function loadConfig() {
        chrome.storage.local.get([
            'aiProvider', 'customAPIKey', 'customModelName', 'customEndpoint'
        ], function(result) {
            var hasKey = !!(result.customAPIKey);
            updateStatus(hasKey);

            // Populate quick setup
            if (result.customAPIKey && apiKeyInput) {
                apiKeyInput.value = result.customAPIKey;
            }
            if (result.customModelName && quickModelSelect) {
                var options = [];
                for (var i = 0; i < quickModelSelect.options.length; i++) {
                    options.push(quickModelSelect.options[i].value);
                }
                if (options.indexOf(result.customModelName) !== -1) {
                    quickModelSelect.value = result.customModelName;
                }
            }

            // Populate advanced form
            if (result.aiProvider && aiProviderSelect) {
                aiProviderSelect.value = result.aiProvider;
                if (result.aiProvider === 'custom' && customEndpointDiv) {
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

    // ---- Shortcuts ----

    function updateShortcutsForPlatform() {
        var mappings = {
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

        document.querySelectorAll('.shortcut-key').forEach(function(el) {
            var text = el.textContent.trim();
            if (mappings[text]) el.textContent = mappings[text];
        });

        var opacityInfo = document.querySelector('#settings-tab .toggle-info');
        if (opacityInfo && opacityInfo.textContent.indexOf('Shortcut:') !== -1) {
            opacityInfo.textContent = 'Shortcut: ' + (isMac ? 'Option + O' : 'Alt + O');
        }
    }

    var chatShortcutElement = document.getElementById('chatShortcut');
    if (chatShortcutElement) {
        chatShortcutElement.textContent = isMac ? 'Option+C' : 'Alt+C';
    }

    // ---- Tabs ----

    var tabButtons = document.querySelectorAll('.tab-button');
    var tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var tabId = button.getAttribute('data-tab');
            tabButtons.forEach(function(btn) { btn.classList.remove('active'); });
            button.classList.add('active');
            tabContents.forEach(function(content) {
                content.classList.remove('active');
                if (content.id === tabId) content.classList.add('active');
            });
        });
    });

    // ---- Toast Opacity ----

    function initializeOpacityLevel() {
        chrome.storage.local.get(['toastOpacityLevel'], function(result) {
            if (!opacityLevelDisplay) return;
            if (result.toastOpacityLevel) {
                opacityLevelDisplay.textContent = result.toastOpacityLevel.charAt(0).toUpperCase() + result.toastOpacityLevel.slice(1);
            } else {
                opacityLevelDisplay.textContent = 'High';
            }
        });
    }

    if (toastOpacityToggle) {
        toastOpacityToggle.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: 'toggleToastOpacity' }, function(response) {
                if (response && response.success && opacityLevelDisplay) {
                    var level = response.level.charAt(0).toUpperCase() + response.level.slice(1);
                    opacityLevelDisplay.textContent = level;
                    showError('Toast opacity: ' + level, 2000);
                }
            });
        });
    }

    // ---- Uninstall ----

    if (uninstallButton) {
        uninstallButton.addEventListener('click', function() {
            chrome.storage.local.clear(function() {
                chrome.management.uninstallSelf();
            });
        });
    }

    // ---- Network ----

    window.addEventListener('offline', function() {
        showError('No internet connection.');
    });

    // ---- Init ----

    loadConfig();
    initializeOpacityLevel();
    updateShortcutsForPlatform();
    chrome.storage.local.set({ useCustomAPI: true });
});
