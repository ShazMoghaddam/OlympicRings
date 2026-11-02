"""Checks that the data adds up and agrees with the IOC's own figures.

Run from the repository root with `pytest`.
"""

import json
from pathlib import Path

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"


@pytest.fixture(scope="module")
def all_games() -> pd.DataFrame:
    return pd.read_csv(DATA / "games.csv")


@pytest.fixture(scope="module")
def games(all_games) -> pd.DataFrame:
    return all_games[all_games["status"] == "held"]


@pytest.fixture(scope="module")
def medals() -> pd.DataFrame:
    return pd.read_csv(DATA / "medals_all_time.csv")


@pytest.fixture(scope="module")
def programme() -> pd.DataFrame:
    return pd.read_csv(DATA / "sports_programme.csv")


def test_every_olympiad_is_listed(all_games):
    assert all_games["year"].tolist() == list(range(1896, 2033, 4))
    assert all_games["status"].value_counts().to_dict() == {"held": 30, "cancelled": 3, "awarded": 2}
    assert all_games.loc[all_games["status"] == "cancelled", "year"].tolist() == [1916, 1940, 1944]


def test_women_and_men_add_up(games):
    assert (games["women"] + games["men"] == games["athletes"]).all()


def test_hosts_are_counted_correctly(games):
    assert games["continent"].value_counts().to_dict() == {"Europe": 17, "Americas": 7, "Asia": 4, "Oceania": 2}
    assert games["host_country"].value_counts().iloc[0] == 4


def test_dates_are_in_order(games):
    assert (pd.to_datetime(games["start"]) < pd.to_datetime(games["end"])).all()


def test_medals_add_up(medals):
    assert (medals["gold"] + medals["silver"] + medals["bronze"] == medals["total"]).all()
    assert medals["noc"].is_unique
    assert medals["total"].is_monotonic_decreasing


def test_sports_match_the_ioc_count(programme, games):
    """1900 has one extra because Olympedia counts ballooning. In 2020 the IOC counted baseball and softball as one."""
    found = programme.groupby("year").size()
    expected = games.set_index("year")["sports"].astype(int)
    differences = {int(y): int(found[y] - expected[y]) for y in expected.index if found[y] != expected[y]}
    assert differences == {1900: 1, 2020: 1}


def test_sports_at_every_games(programme):
    always = programme.groupby("sport").size()
    assert set(always[always == 30].index) == {"Aquatics", "Athletics", "Cycling", "Fencing", "Gymnastics"}


def test_events_are_close_to_the_ioc_total(games):
    events = pd.read_csv(DATA / "sport_events.csv")["medal_events"].sum()
    ioc = games.loc[games["year"] <= 2020, "events"].sum()
    assert abs(events - ioc) / ioc < 0.03


def test_every_data_file_has_a_source():
    sources = json.loads((DATA / "sources.json").read_text(encoding="utf-8"))
    for file in DATA.glob("*.csv"):
        assert file.name in sources, f"{file.name} has no entry in sources.json"
        assert all(source["url"].startswith("https://") for source in sources[file.name]["sources"])


@pytest.mark.parametrize("claim", ["2,765", "1,010", "303 golds", "49.0"])
def test_readme_quotes_the_data(claim):
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert claim in readme


def test_no_em_dashes_in_the_readme():
    assert "—" not in (ROOT / "README.md").read_text(encoding="utf-8")
