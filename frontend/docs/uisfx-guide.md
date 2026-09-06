# UI SFX agent integration guide

> Use this guide when implementing UI SFX in an existing product. It is written for coding agents and humans and uses the `minimal` sound pack in examples.

Last updated: 2026-07-13

## Goal

Add semantic sound wherever it materially improves confirmation, state awareness, spatial understanding, progress, or delight. Do not sonify every click. A good integration feels coherent, restrained, optional, and synchronized with the visible interface.

## Install and initialize

```bash
npm install uisfx
```

For browser applications, create one long-lived client-side player:

```ts
import { createUISFX } from 'uisfx'

const ui = createUISFX({
  pack: 'minimal',
  volume: 0.7,
  preferences: { key: 'product:sound' },
})

await ui.unlock()
```

Do not instantiate or play audio during SSR. Call `await ui.unlock()` from a genuine pointer or keyboard handler before asynchronous playback begins. A caller-owned `AudioContext` can still be passed to `createUISFX`; close it separately after `await ui.destroy()`. Never autoplay on page load. Until audio is unlocked, suppress background and asynchronous cues rather than queueing stale feedback. For native mobile, game engines, or environments without Web Audio, use the packaged MP3 or Ogg assets and preserve the same semantic rules.

## Implementation contract

1. Audit the product's shared controls, async workflows, state management, accessibility patterns, preference system, and tests before editing.
2. Use cue names for what happened, not what a control looks like. Prefer committed outcomes over speculative click sounds.
3. Usually play one cue per interaction. Do not stack `press`, `select`, and `success` on an ordinary action.
4. Use hover sparingly on important fine-pointer targets. Never use hover sound on touch or dense repeated lists.
5. Keep the built-in high-frequency cooldowns unless the audited interaction requires an explicit override.
6. Keep visible, textual, motion, haptic, and ARIA feedback. Sound must never be the only signal.
7. Add or reuse a clearly labeled, persistent sound preference. Do not interpret reduced-motion as a mute preference.
8. Support pointer, touch, and keyboard activation without double playback.
9. Run the project's formatter, typecheck, tests, and production build. Report the final action-to-cue map.

## Async outcomes and loops

Play `success` only after an operation resolves and `error` only after it fails. Play `delete` after deletion is committed. Choose toggle and selection cues from the resulting state.

The six loop cues are `loading`, `processing`, `recording`, `connecting`, `scanning`, and `streaming`. Keep the returned handle, distinguish cancellation from failure, stop before playing an outcome, and guarantee cleanup with `finally`:

```ts
let processing = ui.play('processing')
let completed = false
let caught = false
let cancelled = false
let failure: unknown

try {
  await runTask({ signal })
  completed = true
} catch (error) {
  caught = true
  failure = error
  cancelled = signal.aborted || isAbortError(error)
} finally {
  processing?.stop()
  processing = null
}

if (completed) ui.play('complete')
if (caught) {
  if (!cancelled) ui.play('error')
  // Keep the product's existing cancellation propagation policy.
  throw failure
}
```

Loop starts are idempotent by default, and active loops migrate when the pack changes. Stop loops and clear retained handles on success, failure, cancellation, timeout, navigation, unmount, mute, disable, and `finally`. Use cancellation classification only to suppress an inappropriate error cue; preserve the product's existing cancellation propagation policy. Use `destroy()` only when the app-level player is disposed. A caller-owned `AudioContext` is not closed by `ui.destroy()`; close it separately after destroying the player.

## API summary

- `createUISFX({ pack, volume, enabled, maxVoices, cooldownMs, preferences, context })`
- `player.unlock()` resumes Web Audio from trusted intent
- `player.play(cue, { volume, loop, playbackRate, retrigger, cooldownMs })` returns `{ stop, ended }` or `null`
- `player.preload(cues?, { signal })` yields between cues and supports cancellation
- `player.setPack(pack)`, `player.getPack()`
- `player.setVolume(value)`, `player.getVolume()`, `player.setEnabled(value)`, `player.isEnabled()`
- `player.stopAll()`, `player.destroy()`
- `bindUISFX(root?, options?)` for simple declarative DOM interactions
- `CUES`, `PACKS`, `CATEGORIES`, `cueNames`, `packNames`, `getCue`, `getPack`, and `getPlaybackMode`

## Sound packs

| Pack | Character | Good fit |
| --- | --- | --- |
| `minimal` | Dry, precise, almost invisible. | Productivity, SaaS, system UI |
| `soft` | Rounded felt, warm and reassuring. | Mobile, wellness, friendly SaaS |
| `glass` | Bright, crystalline, and premium. | Media, finance, luxury products |
| `arcade` | Chunky pixels and cheerful voltage. | Games, streaks, gamified learning |
| `mechanical` | Switches, relays, and firm detents. | Devtools, hardware, industrial UI |
| `organic` | Wood, water, breath, and small stones. | Education, kids, calm games |
| `dreamy` | Airy blooms, soft light, and slow sparkle. | Creative tools, wellness, ambient apps |
| `scifi` | Clean holographic pings with a restrained digital shimmer. | AI tools, spatial UI, futuristic games |
| `rubber` | Tactile elastic taps with a quick, friendly rebound. | Kids, playful mobile, casual games |
| `cinematic` | Deep impacts, polished tails, and quiet scale. | Premium media, games, dramatic moments |
| `studio` | Tactile editing precision with warm cinematic restraint. | Film, audio, and AI creative tools |
| `zen` | Pure tones, dry wood, and brief washi detail. | Mindfulness, reading, writing, calm productivity |

## Semantic cue catalog

### Input

Pointer, key, and touch contact.

- `hover` (one-shot): Fine-pointer discovery without commitment.
- `press` (one-shot): A control is physically engaged.
- `release` (one-shot): A pressed control springs back.
- `double-click` (one-shot): A rapid secondary activation.
- `focus` (one-shot): A control becomes ready for keyboard or text input.
- `long-press` (one-shot): A sustained press reveals a secondary action.

### Selection

Choosing, switching, and changing state.

- `select` (one-shot): An item enters the active set.
- `deselect` (one-shot): An item leaves the active set.
- `toggle-on` (one-shot): A binary setting becomes active.
- `toggle-off` (one-shot): A binary setting becomes inactive.
- `check` (one-shot): A checkbox or task enters its completed state.
- `uncheck` (one-shot): A checkbox or task returns to its incomplete state.

### Navigation

Moving through views and layers.

- `open` (one-shot): A menu, sheet, panel, or detail view appears.
- `close` (one-shot): A menu, sheet, panel, or detail view recedes.
- `back` (one-shot): Navigation returns to the previous place.
- `forward` (one-shot): Navigation advances to the next place.
- `expand` (one-shot): A collapsed region reveals more detail.
- `collapse` (one-shot): An expanded region returns to its compact state.

### Editing

Changing work with reversible and destructive actions.

- `delete` (one-shot): A destructive removal is committed.
- `cancel` (one-shot): A pending action is abandoned without applying.
- `undo` (one-shot): The most recent change is reversed.
- `redo` (one-shot): A reversed change is applied again.
- `copy` (one-shot): Selected content is placed on the clipboard.
- `paste` (one-shot): Clipboard content is inserted into the current context.

### Movement

Dragging, snapping, and spatial gestures.

- `drag-start` (one-shot): An object lifts from its resting place.
- `drop` (one-shot): A dragged object lands in a valid target.
- `snap` (one-shot): An object locks into a precise position.
- `swipe` (one-shot): A touch gesture moves content spatially.
- `reorder` (one-shot): An item settles into a new position in a sequence.
- `invalid-drop` (one-shot): A dragged object cannot land in the current target.

### Communication

Messages and attention.

- `send` (one-shot): A message or object leaves the user.
- `receive` (one-shot): A response or object arrives.
- `notification` (one-shot): New information is available, without urgency.
- `mention` (one-shot): The user is directly addressed.
- `typing` (one-shot): A brief key contact during text entry.
- `reaction` (one-shot): A lightweight social response is added.

### Feedback

Clear outcomes and system status.

- `success` (one-shot): An action finished with the expected result.
- `error` (one-shot): An action failed and needs attention.
- `warning` (one-shot): A risky or consequential state needs review.
- `info` (one-shot): A neutral system fact is surfaced.
- `blocked` (one-shot): An action cannot continue in the current state.
- `retry` (one-shot): A failed action is attempted again.

### Progress

Processes from start to finish.

- `start` (one-shot): A process, recording, or session begins.
- `stop` (one-shot): A process, recording, or session ends.
- `progress-step` (one-shot): A discrete step advances inside a longer process.
- `complete` (one-shot): A multi-step process reaches its final state.
- `queued` (one-shot): Work is accepted and waiting to begin.
- `checkpoint` (one-shot): A meaningful stage in a longer process is saved.

### Loops

Continuous state while work, capture, or connection is active.

- `loading` (loop): A quiet repeating pulse while an interface fetches or waits.
- `processing` (loop): A restrained repeating bed while sustained work is running.
- `recording` (loop): A calm periodic pulse while audio or video capture is live.
- `connecting` (loop): A repeating search pattern while a device or live session connects.
- `scanning` (loop): A spatial sweep repeats while content or devices are discovered.
- `streaming` (loop): A quiet repeating flow while live data or media continues.

### Media

Playback, seeking, and listening controls.

- `play` (one-shot): Media playback begins or resumes.
- `pause` (one-shot): Media playback pauses at the current position.
- `seek` (one-shot): The playback position moves to a new point.
- `volume-change` (one-shot): Playback loudness moves to a new level.
- `skip-next` (one-shot): Playback advances to the next item.
- `skip-previous` (one-shot): Playback returns to the previous item.

### System

Connections, access, and device state.

- `connect` (one-shot): A device, service, or live session becomes available.
- `disconnect` (one-shot): A device, service, or live session goes offline.
- `lock` (one-shot): Access closes or a protected state engages.
- `unlock` (one-shot): Access opens or a protected state disengages.
- `wake` (one-shot): A device or dormant interface becomes active.
- `sleep` (one-shot): A device or interface enters a dormant state.

### Reward

Milestones, value, and celebration.

- `reward` (one-shot): The user receives a small unit of value.
- `level-up` (one-shot): Capability, rank, or progression increases.
- `achievement` (one-shot): A rare milestone deserves a fuller celebration.
- `streak` (one-shot): Repeated participation extends an active streak.
- `badge` (one-shot): A collectible distinction is awarded.
- `bonus` (one-shot): An unexpected extra reward is revealed.

### Commerce

Cart, checkout, and value exchange.

- `add-to-cart` (one-shot): An item enters a cart or pending order.
- `remove-from-cart` (one-shot): An item leaves a cart or pending order.
- `checkout` (one-shot): A cart advances into the payment flow.
- `purchase` (one-shot): A paid transaction or value exchange completes.
- `coupon` (one-shot): A discount or promotional code is accepted.
- `refund` (one-shot): Value returns after a completed transaction.

## Copy-ready coding-agent prompt

The same canonical prompt is available as plain text at [https://uisfx.com/agent-prompt.txt?pack=minimal](https://uisfx.com/agent-prompt.txt?pack=minimal).

```text
Implement UI SFX throughout this product using the `uisfx` npm package. Use the "minimal" sound pack.

Do the implementation, not just an example. First inspect the framework, shared UI primitives, state management, async workflows, accessibility patterns, existing settings, and tests. Then add sound only where it gives meaningful feedback. Do not sonify every click.

1. Install and centralize the player

Run `npm install uisfx`. For a browser app, create one shared, client-only player with `createUISFX({ pack: 'minimal', volume: 0.7, enabled: savedSoundPreference })`. Do not instantiate or play audio during SSR. Avoid duplicate players during remounts or React Strict Mode. Unlock Web Audio from a genuine user gesture: either call the first `ui.play()` synchronously inside a pointer or keyboard handler, before any `await`, or create, retain, and resume an `AudioContext` in that handler and pass it to `createUISFX`. If the app creates that context, close it with `await context.close()` after `await ui.destroy()` during final app teardown. Never autoplay on page load. Until audio is unlocked, suppress background and asynchronous cues instead of queueing stale feedback. Handle `ui.play()` returning `null`.

For native mobile, React Native, game engines, or environments without Web Audio, use the packaged assets at `uisfx/sounds/minimal/{cue}.mp3` or `.ogg` while preserving the same semantic and lifecycle rules.

2. Map real product events to semantic cues

Choose the cue that describes what happened, not what the control looks like. Play outcomes only when the state change succeeds or fails. Usually use one cue per interaction; do not stack press, select, and success for one ordinary action.

Prioritize meaningful state transitions: confirmed saves, validation outcomes, toggles, tabs, dialogs, completed destructive actions, undo/redo, drag and drop results, uploads, generation, recording, messages, media controls, purchases, milestones, and connection state. Avoid sound for scrolling, passive layout changes, disabled controls, dense-list repetition, background refreshes, and routine hover. When keyboard sonification is enabled, play the brief `typing` cue once for every local text-entry `input` event at low volume; do not replace it with a long typing loop. Use hover only on sparse important controls with a fine pointer, never touch. Throttle rapid seek, volume, hover, progress, and notification events, but do not throttle `typing`.

Use only valid cue names from https://uisfx.com/uisfx-catalog.json. The catalog groups cues into input, selection, navigation, editing, movement, communication, feedback, progress, loops, media, system, reward, and commerce.

3. Manage loops correctly

The loop cues are loading, processing, recording, connecting, scanning, and streaming. Keep the `PlayingSFX` handle for each active visible process. Make loop starts idempotent. Stop every loop on success, failure, cancellation, timeout, route change, component cleanup, mute or disable, and all `finally` paths. Clear each retained handle after stopping it. After stopping, play the real outcome when appropriate. Never leave an invisible loop running.

Use `ui.stopAll()` for global transitions such as logout. Call `await ui.destroy()` only when the app-level service is disposed. A caller-owned `AudioContext` is not closed by `ui.destroy()`; close it separately after destroying the player. If using `bindUISFX`, call both `unbind()` and `player.destroy()` on final teardown. Do not combine declarative binding and manual playback on the same element.

4. Add an accessible sound preference

Add or reuse a clearly labeled sound toggle. Persist enabled state and volume in the product's preference system, falling back to local storage only if necessary. Before `ui.setEnabled(false)`, stop active loops, clear their retained handles, and call `ui.stopAll()` so mute is immediate. Apply changes with `ui.setEnabled()`, `ui.setVolume()`, and `ui.setPack('minimal')`. Keep visual, textual, motion, haptic, and ARIA feedback intact: sound reinforces meaning and is never the only signal. Do not treat `prefers-reduced-motion` as an audio preference.

5. Preserve interaction quality

Support mouse, touch, and keyboard activation without duplicate playback. For async actions, play success only after resolution and error only after failure. Play delete only after deletion is committed. Choose toggle and selection cues from the resulting state. Use `bindUISFX` data attributes only for simple one-shot DOM interactions; use the imperative player for async outcomes, application state, loops, and lifecycle-sensitive behavior.

6. Test and report

Add or update tests for semantic cue mapping, real success/error timing, loop cleanup on every exit, mute persistence, keyboard/pointer deduplication, SSR safety, and remount cleanup. Run the formatter, typecheck, tests, and production build. Finish with a concise action-to-cue map, files changed, selected pack, sound-preference behavior, loop cleanup, and verification performed.

Canonical documentation:
- https://uisfx.com/docs/agent-guide.md?pack=minimal
- https://uisfx.com/llms.txt
- https://uisfx.com/uisfx-catalog.json
- https://www.npmjs.com/package/uisfx
- https://github.com/romainsimon/uisfx
```

## Machine-readable references

- Compact semantic catalog: https://uisfx.com/uisfx-catalog.json
- Complete asset manifest: https://uisfx.com/uisfx-manifest.json
- LLM index: https://uisfx.com/llms.txt
- Full LLM context: https://uisfx.com/llms-full.txt

## Licenses

The TypeScript runtime is MIT licensed. The generated audio files are dedicated to the public domain under CC0 1.0. Attribution is appreciated but not required. Sound should reinforce visible feedback, never replace it.
