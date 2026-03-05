"""Keyboard layout definition and coordinate mapping."""

DEFAULT_LAYOUT = [
    "ABCDEF",
    "GHIJKL",
    "MNOPQR",
    "STUVWX",
    "YZ1234",
    "567890",
]


def build_index(layout: list[str]) -> dict[str, tuple[int, int]]:
    """Build a character -> (row, col) index from a keyboard layout."""
    index = {}
    for row, line in enumerate(layout):
        for col, char in enumerate(line):
            if char in index:
                raise ValueError(
                    f"duplicate character {char!r} at ({row}, {col}) "
                    f"and {index[char]}"
                )
            index[char] = (row, col)
    return index
