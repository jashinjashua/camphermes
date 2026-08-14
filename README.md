# Camp Hermes

Website of [camphermes.com](https://camphermes.com), a training camp where men are forged.

Built with [Astro](https://astro.build). The level requirements live in
`src/data/levels.json`; both the level cards and the Hero Rank Test
(`/rank`) read from that one file.

## Develop

```sh
npm install
npm run dev      # dev server
npm test         # scoring engine unit tests
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run og       # regenerate Open Graph images (commit the output)
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## License

All rights reserved.
