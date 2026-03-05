GO ?= $(shell which go 2>/dev/null || echo /usr/local/go/bin/go)

.PHONY: check-deps build run test

check-deps:
	@$(GO) version >/dev/null 2>&1 || { echo ""; echo "  ERROR: Go not found."; echo "  Install: https://go.dev/dl/"; echo ""; exit 1; }

build: check-deps
	$(GO) build -o gildedrose .

run: build
	@echo "Starting interactive REPL. Commands: list, item <name>, next, trash, help, quit"
	@./gildedrose inventory.txt

test: check-deps
	$(GO) test ./... -v -count=1
