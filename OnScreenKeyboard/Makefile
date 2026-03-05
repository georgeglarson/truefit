.PHONY: check-deps run test

check-deps:
	@command -v python3 >/dev/null 2>&1 || { echo ""; echo "  ERROR: Python 3 not found."; echo "  Install: https://www.python.org/downloads/"; echo ""; exit 1; }
	@python3 -c "import pytest" 2>/dev/null || { echo ""; echo "  ERROR: pytest not found."; echo "  Install: pip3 install pytest"; echo ""; exit 1; }

run: check-deps
	python3 main.py input.txt

test: check-deps
	python3 -m pytest tests/ -v
