.PHONY: check-deps run test

check-deps:
	@command -v perl >/dev/null 2>&1 || { echo ""; echo "  ERROR: Perl not found."; echo "  Install: https://www.perl.org/get.html"; echo ""; exit 1; }

run: check-deps
	./morse_decode input.txt

test: check-deps
	prove -v t/
