"""Work out which sports were at which Games, and how many medal events each sport has held.

Run from the repository root:

    python data/build_sports.py

It downloads Olympedia's results as collected by the Olympics-Dataset project (about 33 MB, not kept in this
repo) and writes two small files: data/sports_programme.csv and data/sport_events.csv. The Paris 2024 sports
aren't in that download, so they come from the IOC factsheet listed in data/sources.json.
"""

from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RESULTS = "https://raw.githubusercontent.com/KeithGalli/Olympics-Dataset/master/clean-data/results.csv"
SUMMER_YEARS = [y for y in range(1896, 2021, 4) if y not in (1916, 1940, 1944)]

RENAME = {
    "Roller Sports": "Skateboarding",
    "Skating": "Figure Skating",
    "Racquets": "Rackets",
    "Jeu De Paume": "Jeu de Paume",
    "Tug-Of-War": "Tug of War",
}
PARIS_2024 = [
    "Aquatics", "Archery", "Athletics", "Badminton", "Basketball", "Boxing", "Breaking", "Canoeing", "Cycling",
    "Equestrian", "Fencing", "Football", "Golf", "Gymnastics", "Handball", "Hockey", "Judo", "Modern Pentathlon",
    "Rowing", "Rugby", "Sailing", "Shooting", "Skateboarding", "Sport Climbing", "Surfing", "Table Tennis",
    "Taekwondo", "Tennis", "Triathlon", "Volleyball", "Weightlifting", "Wrestling",
]


def sport_of(discipline: str) -> str:
    """'Diving (Aquatics)' belongs to Aquatics. Baseball and softball stay apart, as the IOC counted them until 2008."""
    if discipline.startswith("Baseball"):
        return "Baseball"
    if discipline.startswith("Softball"):
        return "Softball"
    found = re.search(r"\((.*)\)$", discipline)
    name = found.group(1) if found else discipline
    return RENAME.get(name, name)


def load() -> pd.DataFrame:
    rows = pd.read_csv(RESULTS)
    rows = rows[(rows["type"] == "Summer") & rows["year"].isin(SUMMER_YEARS)]
    rows = rows[rows["event"].str.contains(r"\(Olympic\)", na=False)]
    rows = rows[~rows["discipline"].str.contains("Art Competitions", na=False)]
    rows = rows.assign(sport=rows["discipline"].map(sport_of), year=rows["year"].astype(int))
    return rows


def medals_won(medallists: pd.DataFrame) -> int:
    """How many medals these rows are worth. Teammates and doubles partners share one medal between them."""
    names = medallists["as"].fillna("").tolist()
    teams = medallists["team"].fillna("").tolist()
    parent = list(range(len(names)))

    def find(i: int) -> int:
        while parent[i] != i:
            i = parent[i]
        return i

    for i, team in enumerate(teams):
        if not team:
            continue
        for j in range(len(names)):
            if i != j and (team == teams[j] or (names[j] and names[j] in team)):
                parent[find(i)] = find(j)
    return len({find(i) for i in range(len(names))})


def main() -> None:
    rows = load()

    programme = rows[["sport", "year"]].drop_duplicates()
    extra = [("Equestrian", 1956)] + [(sport, 2024) for sport in PARIS_2024]
    programme = pd.concat([programme, pd.DataFrame(extra, columns=["sport", "year"])]).drop_duplicates()
    programme.sort_values(["sport", "year"]).to_csv(ROOT / "data" / "sports_programme.csv", index=False)

    won = rows[rows["medal"].notna()]
    events = won.drop_duplicates(["year", "discipline", "event"]).groupby("sport").size().rename("medal_events")

    keys = ["year", "discipline", "event", "noc", "medal"]
    medals = won.groupby(keys).apply(medals_won, include_groups=False).rename("medals").reset_index()
    per_nation = medals.groupby([medals["discipline"].map(sport_of).rename("sport"), "noc"])["medals"].sum()
    leaders = per_nation.groupby(level=0).agg(["idxmax", "max"])
    table = pd.DataFrame(events)
    table["leading_noc"] = [leaders.loc[s, "idxmax"][1] for s in table.index]
    table["leader_medals"] = [int(leaders.loc[s, "max"]) for s in table.index]
    table["runner_up_medals"] = [
        int(per_nation.loc[s].sort_values(ascending=False).iloc[1]) if len(per_nation.loc[s]) > 1 else 0
        for s in table.index
    ]
    table.sort_values("medal_events", ascending=False).to_csv(ROOT / "data" / "sport_events.csv", index_label="sport")


if __name__ == "__main__":
    main()
