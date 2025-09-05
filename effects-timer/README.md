# Timer Effect Plugin for Alfons

A timer effect plugin that counts down a time interval and triggers a selected action when the interval completes. Supports both single-shot and repeating intervals.

## Installation

```bash
npm install @michal-psencik/effects-timer
```

## Properties

| Property     | Type            | Default | Description                                 |
| ------------ | --------------- | ------- | ------------------------------------------- |
| **interval** | number          | 1000    | Timer duration (1-300000)                   |
| **unit**     | "ms" \| "s"     | "ms"    | Time unit (milliseconds or seconds)         |
| **action**   | ActionReference | -       | Action to execute when timer completes      |
| **repeat**   | boolean         | false   | Whether to repeat the timer (interval mode) |

## Features

- Single-shot timer (fires once)
- Repeating interval timer
- Millisecond and second units
- Action integration with Alfons ActionContext
- Automatic cleanup on unmount
- Timer restart on property changes

The timer starts automatically when the effect is mounted and cleans up when unmounted or when properties change.
