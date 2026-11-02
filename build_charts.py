"""Draw every chart in the README from the files in data/.

Run from the repository root:

    python build_charts.py

Charts go into charts/ as SVG files. All but the sports timeline are drawn with bezel-charts
(https://pypi.org/project/bezel-charts/), and between them they use all of its chart types.
"""

from __future__ import annotations

import datetime as dt
import random
import re
from html import escape
from pathlib import Path

import pandas as pd

import bezel_charts as bc

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
CHARTS = ROOT / "charts"

LIGHT = {"theme": "light"}
WIDE = 760
BLUE, YELLOW, BLACK, GREEN, RED = "#0081C8", "#FCB131", "#1F2328", "#00A651", "#EE334E"
MEDALS = ["#D4A017", "#A8A9AD", "#B0703C"]
INK, MUTED = "#17161F", "#6B6980"
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"
SANS = "ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def load_games() -> pd.DataFrame:
    games = pd.read_csv(DATA / "games.csv")
    return games[games["status"] == "held"].assign(year=lambda df: df["year"].astype(int).astype(str))


def tiles(games: pd.DataFrame) -> None:
    for column, name, heading, colour in (
        ("nations", "tile-nations", "Nations", BLUE),
        ("athletes", "tile-athletes", "Athletes", RED),
        ("events", "tile-events", "Medal events", GREEN),
    ):
        bc.spark(games, x="year", y=column, heading=heading, color=colour, width=270, compact=column == "athletes",
                 **LIGHT).save(
            CHARTS / f"{name}.svg"
        )


def athletes(games: pd.DataFrame) -> None:
    table = games.rename(columns={"men": "Men", "women": "Women"})
    bc.line(table, x="year", y=["Men", "Women"], heading="Athletes at each Summer Games", compact=True,
            color=[BLUE, RED], width=WIDE, straight=True, notes={"2024": "Almost level"}, **LIGHT).save(CHARTS / "athletes-over-time.svg")


def nations(games: pd.DataFrame) -> None:
    bc.line(games, x="year", y="nations", heading="Nations at each Summer Games", color=BLUE, width=WIDE,
            straight=True, notes={"1980": "Boycotts", "1996": "Every nation"}, **LIGHT).save(CHARTS / "nations-over-time.svg")


def nations_vs_athletes(games: pd.DataFrame) -> None:
    table = games.assign(Nations=games["nations"], Athletes=games["athletes"])
    bc.scatter(table, x="Nations", y="Athletes", label="year", trend=True, heading="More nations, more athletes",
               color=RED, width=WIDE, notes={"1980": "1980"},
               **LIGHT).save(CHARTS / "nations-vs-athletes.svg")


def hosts(games: pd.DataFrame) -> None:
    continents = games["continent"].value_counts()
    rings = {name: int(continents.get(name, 0)) for name in ("Europe", "Americas", "Asia", "Oceania", "Africa")}
    bc.ring(rings, max=len(games), heading=f"Where {len(games)} Summer Games were held", suffix=" Games",
            color=[BLUE, RED, YELLOW, GREEN, BLACK], **LIGHT).save(CHARTS / "hosts-by-continent.svg")
    bc.donut(games["host_country"].value_counts(), heading="Summer Games by host country", center_label="Games",
             **LIGHT).save(CHARTS / "hosts-by-country.svg")


def calendar(games: pd.DataFrame) -> None:
    """One year, with each day showing how many Games have been running on that date. 2024 has a 29 February."""
    days = pd.date_range("2024-01-01", "2024-12-31")
    counts = pd.Series(0, index=days)
    spans = [(row["start"], row["end"]) for _, row in games.iterrows()] + [("1956-06-10", "1956-06-17")]
    for start, end in spans:
        for day in pd.date_range(start, end):
            counts[dt.datetime(2024, day.month, day.day)] += 1
    chart = bc.heatmap(counts.tolist(), start="2024-01-01", heading="Days of the year the Games have run", stat="max",
                       suffix=" Games", color=RED, width=WIDE, **LIGHT)
    # The squares stand for dates across many years, so weekday labels and a total of Games-days would mislead.
    svg = re.sub(r"<text[^>]*>(Mon|Wed|Fri|[\d,]+ Games in 366 days)</text>", "", str(chart))
    (CHARTS / "games-calendar.svg").write_text(svg, encoding="utf-8")


def schedule(games: pd.DataFrame) -> None:
    all_games = pd.read_csv(DATA / "games.csv")
    bc.progress({"Held": int((all_games["status"] == "held").sum()),
                 "Cancelled by war": int((all_games["status"] == "cancelled").sum()),
                 "Awarded": int((all_games["status"] == "awarded").sum())},
                heading="The 35 Olympiads from 1896 to 2032", color=[BLUE, BLACK, YELLOW], width=WIDE,
                **LIGHT).save(CHARTS / "olympiads.svg")


def women(games: pd.DataFrame) -> None:
    latest = games.iloc[-1]
    share = round(100 * latest["women"] / latest["athletes"], 1)
    bc.gauge(share, label="Women", heading=f"Women at {latest['city']} {latest['year']}", suffix="%", decimals=1,
             goal=50, color=RED, **LIGHT).save(CHARTS / "women-paris.svg")


def medals() -> None:
    table = pd.read_csv(DATA / "medals_all_time.csv")
    top = table.nlargest(15, "total")
    bc.bars(top, x="team", y="total", horizontal=True, heading="Most Summer medals of all time", show_values=True,
            color=BLUE, width=WIDE, **LIGHT).save(CHARTS / "medals-all-time.svg")
    podium = table.nlargest(8, "total").rename(columns={"gold": "Gold", "silver": "Silver", "bronze": "Bronze"})
    bc.bars(podium, x="noc", y=["Gold", "Silver", "Bronze"], heading="Gold, silver and bronze, top eight nations",
            color=MEDALS, width=WIDE, compact=True, show_values=True, **LIGHT).save(CHARTS / "medals-by-colour.svg")
    golds = table.nlargest(10, "gold")
    bc.bars(golds, x="team", y="gold", horizontal=True, heading="Most Summer golds of all time", show_values=True,
            color=MEDALS[0], width=WIDE, **LIGHT).save(CHARTS / "golds-all-time.svg")


def sports(games: pd.DataFrame) -> None:
    bc.bars(games, x="year", y="sports", heading="Sports at each Summer Games", color=GREEN, width=WIDE,
            **LIGHT).save(CHARTS / "sports-per-games.svg")
    events = pd.read_csv(DATA / "sport_events.csv").nlargest(12, "medal_events")
    bc.bars(events, x="sport", y="medal_events", horizontal=True, heading="Medal events held per sport, 1896 to 2020",
            show_values=True, color=GREEN, width=WIDE, **LIGHT).save(CHARTS / "events-per-sport.svg")


def timeline(games: pd.DataFrame) -> None:
    """A grid of every sport against every Games. A calendar heatmap can't show this, so it's drawn by hand."""
    programme = pd.read_csv(DATA / "sports_programme.csv")
    years = [int(y) for y in games["year"]]
    first = programme.groupby("sport")["year"].min()
    order = sorted(first.index, key=lambda sport: (first[sport], sport))
    present = set(zip(programme["sport"], programme["year"]))
    current = {sport for sport in order if (sport, 2024) in present}

    left, top, cell, pad = 138, 78, 20, 24
    width = left + cell * len(years) + pad
    height = top + cell * len(order) + 48
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
        f'font-family="{SANS}" role="img" aria-label="Which sports were at each Summer Games from 1896 to 2024">',
        f'<rect width="{width}" height="{height}" rx="22" fill="#000000"/>',
        f'<rect x="4" y="4" width="{width - 8}" height="{height - 8}" rx="18" fill="#FFFFFF"/>',
        f'<text x="{pad + 4}" y="34" fill="{MUTED}" font-family="{MONO}" font-size="11" font-weight="600" '
        'letter-spacing="1.3">EVERY SPORT AT EVERY SUMMER GAMES</text>',
    ]
    for i, year in enumerate(years):
        x = left + cell * i + cell / 2
        parts.append(f'<text x="{x}" y="{top - 6}" font-size="9" fill="{MUTED}" text-anchor="start" '
                     f'transform="rotate(-50 {x} {top - 6})">{year}</text>')
    for row, sport in enumerate(order):
        y = top + cell * row
        colour = INK if sport in current else MUTED
        parts.append(f'<text x="{left - 8}" y="{y + 14}" font-size="11" fill="{colour}" '
                     f'text-anchor="end">{escape(sport)}</text>')
        for i, year in enumerate(years):
            x = left + cell * i
            if (sport, year) in present:
                fill = GREEN if sport in current else MUTED
                parts.append(f'<rect x="{x + 2}" y="{y + 2}" width="{cell - 4}" height="{cell - 4}" rx="3" fill="{fill}"/>')
            else:
                parts.append(f'<rect x="{x + 2}" y="{y + 2}" width="{cell - 4}" height="{cell - 4}" rx="3" fill="#F3F4F6"/>')
    legend_y = height - 24
    parts.append(f'<rect x="{left + 2}" y="{legend_y - 10}" width="12" height="12" rx="3" fill="{GREEN}"/>')
    parts.append(f'<text x="{left + 20}" y="{legend_y}" font-size="11" fill="{MUTED}">On the programme at Paris 2024</text>')
    parts.append(f'<rect x="{left + 214}" y="{legend_y - 10}" width="12" height="12" rx="3" fill="{MUTED}"/>')
    parts.append(f'<text x="{left + 232}" y="{legend_y}" font-size="11" fill="{MUTED}">Not at Paris 2024</text>')
    parts.append("</svg>")
    (CHARTS / "sports-timeline.svg").write_text("\n".join(parts), encoding="utf-8")


def games_table() -> str:
    games = pd.read_csv(DATA / "games.csv", dtype=str, keep_default_na=False)
    lines = ["| Year | City | Host | Continent | Nations | Athletes | Women | Sports | Events |",
             "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |"]
    for _, row in games.iterrows():
        if row["status"] == "cancelled":
            lines.append(f"| {row['year']} | *{row['note']}* | | | | | | | |")
            continue
        athletes = f"{int(row['athletes']):,}" if row["athletes"] else ""
        women = f"{100 * int(row['women']) / int(row['athletes']):.1f}%" if row["athletes"] else ""
        year = row["year"] if row["status"] == "held" else f"{row['year']} *(awarded)*"
        lines.append(f"| {year} | {row['city']} | {row['host_country']} | {row['continent']} | {row['nations']} | "
                     f"{athletes} | {women} | {row['sports']} | {row['events']} |")
    return "\n".join(lines)


def leaders_table() -> str:
    """Only sports where the leader is at least a fifth clear, since medal counts vary a little by source."""
    names = pd.read_csv(DATA / "medals_all_time.csv").set_index("noc")["team"]
    table = pd.read_csv(DATA / "sport_events.csv")
    clear = table[(table["leader_medals"] >= 1.2 * table["runner_up_medals"]) & (table["medal_events"] >= 35)]
    lines = ["| Sport | Medal events, 1896 to 2020 | Most medals |", "| --- | ---: | --- |"]
    for _, row in clear.iterrows():
        lines.append(f"| {row['sport']} | {row['medal_events']:,} | {names[row['leading_noc']]} |")
    return "\n".join(lines)


def update_readme() -> None:
    path = ROOT / "README.md"
    text = path.read_text(encoding="utf-8")
    for marker, table in (("games", games_table()), ("leaders", leaders_table())):
        text = re.sub(rf"(<!-- {marker}:start -->\n).*?(<!-- {marker}:end -->)",
                      lambda m: m.group(1) + table + "\n" + m.group(2), text, flags=re.S)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    random.seed(1896)  # bezel-charts gives each chart random ids, so this keeps the files the same on every run
    CHARTS.mkdir(exist_ok=True)
    games = load_games()
    tiles(games)
    athletes(games)
    nations(games)
    nations_vs_athletes(games)
    hosts(games)
    calendar(games)
    schedule(games)
    women(games)
    medals()
    sports(games)
    timeline(games)
    update_readme()


if __name__ == "__main__":
    main()
