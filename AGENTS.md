# Vytal Bridge Developer & Agent Guidelines

This workspace implements a regional African prenatal health early-warning telemetry system, featuring state-of-the-art server-side Gemini intelligence and client-side offline telecom simulations.

## Project Architecture & Layout

- **`src/types.ts`**: Holds shared definitions for clinics, patients, and vitals. Mark optional values (e.g., `symptoms`, `consentGranted`, `updatedAt`) clearly. Timestamps are kept flexible to ensure backward compatibility.
- **`src/components/EducationalVideoHub.tsx`**: Manages video resources. Real-time media compiles through a 3-step proxy sequence (Start, Poll, Download) targeting the `@google/genai` Veo model.
- **`src/components/AiDiagnosticsLab.tsx`**: Integrates deep visual diagnosis, eclampsia scan analysis, and real-time 16kHz to 24kHz bidirectional audio WebSocket translations via the Live API.
- **`server.ts`**: Runs the custom multi-threaded full-stack Express server + WebSocket upgrades (`ws` upgraded on `/live` pathing).

## Core Integration Axioms

1. **Strict Client-Side API Key Safety**: Never pass any clinical or LLM credentials down to the browser context. Keep all client API interfaces routed via `/api/*` proxies.
2. **Duplex Voice Telemetry**: The client captures physical microphone streams at 16kHz PCM, sending base64 chunks through `/live`. The server returns responses via the Gemini Live API at 24kHz PCM, decoded cleanly using browser `AudioContext`.
3. **No Unsolicited Theme Clutter**: Keep layout styling aligned with the established minimalist rose/slate palette using standard inline Tailwind CSS classes.
