# CrackNIET

AI-powered exam assistant Chrome extension for Iamneo/Examly, HackerRank, and NPTEL portals.

**Bring your own API key** — works with free OpenRouter models (zero cost).

## ⚡ One-Line Install

```bash
bash <(curl -sL https://raw.githubusercontent.com/yash113gadia/crackniet/main/install.sh)
```

This clones the extension and opens Chrome so you can load it.

## Manual Install

```bash
git clone https://github.com/yash113gadia/crackniet.git ~/.crackniet
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select `~/.crackniet`

## Setup

1. Get a free API key from [OpenRouter](https://openrouter.ai/keys)
2. Click the extension icon → paste your key → click **🚀 Activate**
3. Default model: `GPT-OSS 120B` (free, 96% accuracy on DBMS/DSA)

## Keyboard Shortcuts

| Shortcut | Action | Portal |
|----------|--------|--------|
| `Ctrl+Shift+T` | Type coding answers | Iamneo |
| `⌥+Shift+A` | AI search answers | Iamneo |
| `⌥+Shift+S` | AI search (select text first) | Universal |
| `⌥+Shift+M` | Solve MCQs (select text first) | Universal |
| `⌥+C` | Toggle chatbot | Universal |
| `⌥+Shift+V` | Drag & drop paste | Universal |
| `⌥+O` | Toast opacity toggle | Universal |
| `Ctrl+Shift+H` | Solve questions | HackerRank |
| `⌥+Shift+N` | Solve MCQs (select text first) | NPTEL |

> `⌥` = Option (Mac) / Alt (Windows)

## Free Models (Tested)

| Model | Accuracy | Speed | Rate Limits |
|-------|----------|-------|-------------|
| 🏆 `openai/gpt-oss-120b:free` | 96% | ~5s | Best |
| ⚡ `nvidia/nemotron-3-nano-30b-a3b:free` | 100%* | ~1.6s | Moderate |
| 🔄 `openrouter/free` | Auto | ~2.4s | Good |

\* Small sample size

## License

MIT
