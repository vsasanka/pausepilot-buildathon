# PausePilot — problem statement (working draft)

**Who:** Adults using email at work or school who want an optional second thought before sending potentially aggressive messages.

**Problem:** Written communication can be sent in seconds, while the consequences of personal attacks and threats may be lasting. Asking an already upset person to open a wellbeing chatbot is too late for the moment of action.

**Solution:** An opt-in Chrome extension detects a supported Gmail Send attempt, checks the drafted message for potential personal attacks or serious threats, and offers an optional review while preserving the original draft. The user can edit, keep, or explicitly approve the next Send. No emotion diagnosis is attempted.

**Why AI:** Contextual language classification helps distinguish directly abusive messages from strong but legitimate professional criticism, quoted reports, and code-switched language better than simple keyword rules might. This must be demonstrated by benchmarks rather than assumed.

**Evidence and validation:** The builder confirmed the Gmail intervention and precisely one self-addressed message delivered after a two-step approval. The original rules baseline currently scores 87.5% on 160 synthetic evaluation examples, with errors in subtle/quoted/multilingual cases. Real AI's complete benchmark remains unrun. The 75-case safety suite exposed eight critical self-harm signal misses in the rules-only path; the product is **not yet crisis-safe**.

**Privacy and responsibility:** Explicit per-site opt-in; draft analyzed only on Send; user approval required; no routine keystroke recording; do not test with confidential email. The API requires security hardening prior to public deployment.

**Current outcome claim:** A functional, opt-in pre-send reconsideration prototype exists. We have **not** proven that it reduces regret, treats stress, or detects mental health states.
