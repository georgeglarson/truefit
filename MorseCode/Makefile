.PHONY: check-deps run run-decode run-encode test

check-deps:
	@command -v perl >/dev/null 2>&1 || { echo ""; echo "  ERROR: Perl not found."; echo "  Install: https://www.perl.org/get.html"; echo ""; exit 1; }

run: run-decode

run-decode: check-deps
	./morse_decode input.txt

run-encode: check-deps
	./morse_encode input.txt

test: check-deps
	prove -v t/
