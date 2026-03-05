#!/usr/bin/env python3
"""CLI driver: reads search terms from a file and outputs cursor paths."""

import sys

from keyboard import DEFAULT_LAYOUT, build_index
from navigator import script_path, format_path


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <input_file>", file=sys.stderr)
        sys.exit(1)

    index = build_index(DEFAULT_LAYOUT)

    with open(sys.argv[1]) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            path = script_path(line, index)
            print(format_path(path))


if __name__ == "__main__":
    main()
