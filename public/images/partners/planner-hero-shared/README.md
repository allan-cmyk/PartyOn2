# Shared Planner Hero Images

Drop hero photos in this folder. They appear in the hero carousel on **every PLANNER partner page** (e.g. `/partners/the-bach-plan`), starting from slide 2 onward.

Slide 1 is the partner's own hero image: `public/images/partners/{slug}-hero.{jpg|jpeg|png|webp}`. If a partner has no per-partner hero, the carousel just shows these shared images.

## Naming

Files are sorted alphabetically -- prefix with a number to control order:

```
1-cocktail-kits.jpg
2-fridge-stocked.jpg
3-fresh-victor.jpg
4-bachelorette-setup.jpg
```

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.

## Sizing

Images render in a 4:3 box at ~600x450px on desktop. For best results upload at 1200x900 or larger; they'll be served via Next.js Image optimization.

## Updating

Drop a new file -> save -> the next page render picks it up. No code change needed.
