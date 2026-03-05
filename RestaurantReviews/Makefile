.PHONY: test run dev build clean deps

deps:
	@command -v node >/dev/null 2>&1 || { echo "Node.js not found — install from https://nodejs.org/"; exit 1; }
	@[ -d node_modules ] || npm install

test: deps
	npx vitest run --reporter=verbose

# Production: build client, then serve everything from Express
run: deps build
	npx tsx src/server/index.ts

# Development: Express API + Vite dev server (HMR on :5173, API proxy to :3000)
dev: deps
	npx tsx src/server/index.ts & npx vite --config vite.config.ts; kill %1

build: deps
	npx vite build --config vite.config.ts

clean:
	rm -rf dist node_modules
