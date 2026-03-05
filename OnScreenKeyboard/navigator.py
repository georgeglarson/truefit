"""Cursor navigation logic for an on-screen keyboard."""


def navigate(
    start: tuple[int, int], target: tuple[int, int]
) -> list[str]:
    """Return the sequence of moves (U/D/L/R) from start to target."""
    sr, sc = start
    tr, tc = target
    moves = []

    # Vertical movement
    if tr > sr:
        moves.extend(["D"] * (tr - sr))
    elif tr < sr:
        moves.extend(["U"] * (sr - tr))

    # Horizontal movement
    if tc > sc:
        moves.extend(["R"] * (tc - sc))
    elif tc < sc:
        moves.extend(["L"] * (sc - tc))

    return moves


def script_path(text: str, index: dict[str, tuple[int, int]]) -> list[str]:
    """Script the full cursor path for an input string.

    Spaces become 'S'. Each character ends with '#' (select).
    """
    cursor = (0, 0)  # Always start at top-left
    path = []

    for char in text.upper():
        if char == " ":
            path.append("S")
            continue

        if char not in index:
            raise ValueError(f"Character not on keyboard: '{char}'")

        target = index[char]
        path.extend(navigate(cursor, target))
        path.append("#")
        cursor = target

    return path


def format_path(path: list[str]) -> str:
    """Comma-delimit a path sequence."""
    return ",".join(path)
