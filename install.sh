#!/bin/bash
set -e

INSTALL_DIR="$HOME/.crackniet"
REPO="https://github.com/yash113gadia/crackniet.git"

echo ""
echo "  ⚡ CrackNIET Installer"
echo "  ─────────────────────"
echo ""

# Check for git
if ! command -v git &> /dev/null; then
    echo "  ✗ Git is not installed. Install it from https://git-scm.com"
    exit 1
fi

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
    echo "  → Updating existing installation..."
    cd "$INSTALL_DIR" && git pull --quiet
else
    [ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
    echo "  → Downloading CrackNIET..."
    git clone --quiet --depth 1 "$REPO" "$INSTALL_DIR"
fi

echo "  ✓ Installed to $INSTALL_DIR"
echo ""

# Try to open Chrome extensions page
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a "Google Chrome" "chrome://extensions" 2>/dev/null && echo "  → Opened Chrome extensions page" || true
elif [[ "$OSTYPE" == "linux"* ]]; then
    xdg-open "chrome://extensions" 2>/dev/null && echo "  → Opened Chrome extensions page" || true
fi

echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │  Almost done! In Chrome:                    │"
echo "  │                                             │"
echo "  │  1. Go to chrome://extensions               │"
echo "  │  2. Enable 'Developer mode' (top-right)     │"
echo "  │  3. Click 'Load unpacked'                   │"
echo "  │  4. Select: ~/.crackniet                    │"
echo "  │                                             │"
echo "  │  Then click the extension icon,             │"
echo "  │  paste your OpenRouter key, and Activate!   │"
echo "  └─────────────────────────────────────────────┘"
echo ""
