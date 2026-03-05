.PHONY: check-deps build run test clean

check-deps:
	@command -v zig >/dev/null 2>&1 || { echo ""; echo "  ERROR: Zig not found."; echo "  Install: https://ziglang.org/download/"; echo ""; exit 1; }

build: check-deps
	zig build

run: build
	zig build run -- input.txt

test: check-deps
	zig build test --summary all

clean:
	rm -rf .zig-cache zig-out
