# iPhone SIMplifica trial — 2026-09-28

## Scope

The availability page now exports a versioned clipboard payload for a manually configured Safari share-sheet shortcut. Email stays in component memory and clipboard, not server storage or URLs. The setup page is noindex and includes the full audited helper code; it does not remotely load code inside SIMplifica.

Supported fields: Email, Visitante (> 12 anos), Visitante (<= 12 anos), Selecionar percurso. Exact labels were read from the live Portuguese form. Payloads expire after 30 minutes and only support the visitor category. Disabled/read-only inputs, conflicting resident/exemption values, checked disability declaration, existing reservation time and ambiguous route options fail closed. The script never checks declarations, clicks Next/Confirm, submits forms or pays. Date/time remains manual.

## Installation

On iPhone create a share-sheet shortcut accepting Safari webpages. Actions: Get Clipboard → Base64 Encode → Run JavaScript on Webpage (Shortcut Input) → Show Result. Paste the supplied code and replace the BASE64_VARIABLE text inside quotes with the actual Base64 action's magic variable. No signed .shortcut or iCloud install link is provided. Installation and real iOS execution require the user's phone.

## Verification

Baseline build/types and 14 trail tests passed before edits. Added payload validation and destination guard tests. A local React fixture reproducing observed field labels exposed batched controlled-input updates dropping earlier fields; sequential events with render waits fixed it. The fixture verifies 12 adults + 2 children, exact email, route selection, unchanged checkboxes, and conflict refusal. This is not an end-to-end Safari or production-form execution test. Browser automation in this environment cannot execute arbitrary injected code on the third-party page; no claim of live script execution is made.

The live official form was inspected through a new blank application, without entering personal data or reserving a slot. The user's previous application was not modified. It showed a checked disability declaration; the user was informed because checking every box would be incorrect.

## Remaining validation

Run the configured shortcut on iPhone Safari with user-supplied email. Verify DOM event acceptance on the actual SIMplifica page and route option timing. The tool is visibly marked trial until that succeeds. Official Portuguese labels can change and should result in refusal rather than guessing. Date/time automation and signed shortcut distribution are not implemented.
