# Changelog

All notable changes to this project are listed here. Versions are dated by month, like `v2026.11`.

## Unreleased

- Notes on the charts now use plain years, now that bezel-charts 1.0.1 reads them as labels

## v2026.11 · November 2026

The rebuild, from a small script into a full history of the Summer Games.

- **The rings now interlock.** `main.py` is rewritten so rings pass over and under each other, in the official colour
  order, and can be saved as an SVG
- **The story of the Games**, from Olympia in 776 BC to Paris 2024, with every fact traced to the IOC
- **Every Games** from 1896 to 2032 in `data/games.csv`: host, continent, dates, nations, athletes, sports and events
- **All-time medal table** for the top 30 teams, with gold, silver and bronze
- **Sports timeline** of 48 sports across 30 Games, and medal events per sport
- 17 charts: 16 using all ten [bezel-charts](https://pypi.org/project/bezel-charts/) chart types, plus a hand-drawn timeline
- Data sources listed in the README and `data/sources.json`, with tests that check the data against the IOC's totals
- Checks on every pull request, Dependabot, a security policy and a social preview image

## 2024

- First version: a Matplotlib script that drew five overlapping rings
