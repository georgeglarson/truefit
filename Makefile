.PHONY: check-deps test-all

check-deps:
	@echo "Checking dependencies..."
	@echo ""
	@printf "  Rust/Cargo ... " && (command -v cargo >/dev/null 2>&1 && cargo --version 2>/dev/null || echo "NOT FOUND — install from https://rustup.rs")
	@printf "  Zig .......... " && (command -v zig   >/dev/null 2>&1 && zig version     2>/dev/null || echo "NOT FOUND — install from https://ziglang.org/download/")
	@printf "  Perl ......... " && (command -v perl  >/dev/null 2>&1 && perl -v 2>/dev/null | grep 'version' | head -1 || echo "NOT FOUND — install from https://www.perl.org/get.html")
	@printf "  Python 3 .... " && (command -v python3 >/dev/null 2>&1 && python3 --version 2>/dev/null || echo "NOT FOUND — install from https://www.python.org/downloads/")
	@printf "  pytest ....... " && (python3 -c "import pytest; print(pytest.__version__)" 2>/dev/null || echo "NOT FOUND — install with: pip3 install pytest")
	@printf "  Go ........... " && (command -v go >/dev/null 2>&1 && go version 2>/dev/null || /usr/local/go/bin/go version 2>/dev/null || echo "NOT FOUND — install from https://go.dev/dl/")
	@printf "  Node.js ...... " && (command -v node >/dev/null 2>&1 && node --version 2>/dev/null || echo "NOT FOUND — install from https://nodejs.org/")
	@echo ""

test-all:
	@echo "=== CashRegister (Rust) ===" && $(MAKE) -C CashRegister test && echo ""
	@echo "=== MissingNumber (Zig) ===" && $(MAKE) -C MissingNumber test && echo ""
	@echo "=== MorseCode (Perl) ===" && $(MAKE) -C MorseCode test && echo ""
	@echo "=== OnScreenKeyboard (Python) ===" && $(MAKE) -C OnScreenKeyboard test && echo ""
	@echo "=== GildedRose (Go) ===" && $(MAKE) -C GildedRose test && echo ""
	@echo "=== RestaurantReviews (TypeScript/React) ===" && $(MAKE) -C RestaurantReviews test && echo ""
