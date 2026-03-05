.PHONY: check-deps run test

check-deps:
	@command -v cargo >/dev/null 2>&1 || { echo ""; echo "  ERROR: Rust/Cargo not found."; echo "  Install: https://rustup.rs"; echo "    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"; echo ""; exit 1; }

run: check-deps
	cargo run -- sample_input.txt

test: check-deps
	cargo test
