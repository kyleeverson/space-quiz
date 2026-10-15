# Copilot instructions

## Project structure

`index.html` is the complete application: quiz content, semantic markup, styles, and browser-side quiz logic are kept together. It is a dependency-free static page; the question array is the source of truth for question text, choices, correct-answer indexes, categories, and feedback facts. The quiz state and DOM update functions later in the same file render questions, score/progress, feedback, and results.

## Build, test, and lint

There is no build step, package manager, test runner, or configured linter. Open `index.html` directly in a browser or the integrated browser to run the app. For a focused smoke check, verify one correct answer, one incorrect answer, score/progress changes, completion of all ten questions, and restarting from the results screen. There is no single-test command.

## Code conventions

- Keep the app self-contained and runnable as a local file. Do not introduce external libraries, fonts, assets, or server requirements without an explicit product decision.
- Add or edit quiz content in the `questions` array; `answer` is a zero-based index into that question's `options`.
- Keep visual styling in the inline `<style>` block and behavior in the inline `<script>` block. Use the existing CSS custom properties for theme-dependent colors and update both the default palette and `prefers-color-scheme: dark` overrides when adding a theme color.
- Preserve semantic buttons and live/progress announcements when changing quiz interactions. Keep decorative symbols hidden from assistive technology, retain visible keyboard focus, and honor `prefers-reduced-motion`.
- Use `textContent` for dynamic question, category, score, and feedback text. Answer labels are created from the local quiz data; avoid inserting untrusted content as HTML.
