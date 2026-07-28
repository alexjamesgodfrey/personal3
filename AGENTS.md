# Repository Operations

## Development server

- The development server runs in the tmux session named `personal`.
- Attach with `tmux attach -t personal` when interactive access is useful.
- Inspect logs without attaching with `tmux capture-pane -p -t personal`.
- Agents may force-restart `bun dev` in that session when needed to reproduce errors, inspect logs, or verify fixes.
