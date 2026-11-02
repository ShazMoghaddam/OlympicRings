"""Draw the five interlocking Olympic rings with Matplotlib.

Run from the repository root:

    python main.py          # opens a window
    python main.py --save   # writes assets/rings.svg instead

Plain circles can only be stacked, one fully on top of another. Linked rings have to pass over a neighbour at
one crossing and under it at the other, so each ring is drawn first and the "over" parts are painted back on top.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Wedge

RADIUS = 1.0  # to the middle of the band
BAND = 0.2
SPACING = 2.25 # between the centres of neighbouring rings in a row
DROP = 1.05  # how far the bottom row sits below the top row
PATCH = 40  # degrees of ring painted back over each crossing

# Widely published screen values for the five colours, in the order the rings are read
RINGS = [
    ("blue", "#0081C8", (0.0, 0.0)),
    ("yellow", "#FCB131", (SPACING / 2, -DROP)),
    ("black", "#000000", (SPACING, 0.0)),
    ("green", "#00A651", (SPACING * 1.5, -DROP)),
    ("red", "#EE334E", (SPACING * 2, 0.0)),
]
OUTPUT = Path(__file__).resolve().parent / "assets" / "rings.svg"


def band(centre: tuple[float, float], colour: str, start: float = 0, end: float = 360) -> Wedge:
    """All or part of one ring."""
    return Wedge(centre, RADIUS + BAND / 2, start, end, width=BAND, facecolor=colour, edgecolor="none")


def crossings(a: tuple[float, float], b: tuple[float, float]) -> list[tuple[float, float]]:
    """The two points where the middle lines of two rings meet, left one first."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    gap = math.hypot(dx, dy)
    height = math.sqrt(RADIUS**2 - (gap / 2) ** 2)
    mid = (a[0] + dx / 2, a[1] + dy / 2)
    points = [(mid[0] + sign * height * dy / gap, mid[1] - sign * height * dx / gap) for sign in (-1, 1)]
    return sorted(points)


def angle_on(centre: tuple[float, float], point: tuple[float, float]) -> float:
    return math.degrees(math.atan2(point[1] - centre[1], point[0] - centre[0]))


def draw(ax: plt.Axes) -> None:
    for _, colour, centre in RINGS:
        ax.add_patch(band(centre, colour))

    # Each ring in the chain meets the next one twice. It goes under at the left crossing and over at the right.
    for (_, colour_a, a), (_, colour_b, b) in zip(RINGS, RINGS[1:]):
        left, right = crossings(a, b)
        for colour, centre, point in ((colour_b, b, left), (colour_a, a, right)):
            mid = angle_on(centre, point)
            ax.add_patch(band(centre, colour, mid - PATCH / 2, mid + PATCH / 2))

    margin = RADIUS + BAND
    ax.set_xlim(-margin, SPACING * 2 + margin)
    ax.set_ylim(-DROP - margin, margin)
    ax.set_aspect("equal")
    ax.axis("off")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--save", action="store_true", help=f"write {OUTPUT.name} instead of opening a window")
    args = parser.parse_args()

    plt.rcParams["svg.hashsalt"] = "olympic-rings"  # the same drawing gives the same file every time
    fig, ax = plt.subplots(figsize=(8, 3.9))
    draw(ax)

    if args.save:
        OUTPUT.parent.mkdir(exist_ok=True)
        fig.savefig(OUTPUT, facecolor="white", bbox_inches="tight", pad_inches=0.2, metadata={"Date": None})
    else:
        plt.show()


if __name__ == "__main__":
    main()
