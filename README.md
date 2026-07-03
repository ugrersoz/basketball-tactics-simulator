# Basketball Tactics Simulator

HTW Berlin basketball tactics simulator. Draw plays, animate sets, and build custom formations on a half-court.

## Background

Built by a student and player on the HTW Berlin basketball team, out of a need for a lightweight way to sketch and present sets and plays to teammates without relying on paper diagrams or static slides.

## Features

- 5v5 / 4v4 formations
- Predefined plays (Pick & Roll, Drive & Kick, Give & Go, Horns Set, Backdoor Cut, 2-3 Zone, 1-3-1 Zone, Man-to-Man) with step-by-step or autoplay animation
- Drawing tools: move, pass, cut, dribble, screen, erase
- Zone and player-role overlays
- Offense / defense / both view filter
- EN / DE localization (react-i18next)

## Tech stack

- React 19
- Vite 8
- react-i18next
- ESLint (react-hooks / React Compiler rules)

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Production build           |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                 |

## Project structure

```
src/
  App.jsx      # court rendering, formations, plays, animation logic
  i18n/        # en.json, de.json, i18n setup
  main.jsx     # app entry point
  index.css
```

## Author

Ugur Ersoz
