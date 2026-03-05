.PHONY: test run dev build clean deps typecheck

deps:
	@command -v node >/dev/null 2>&1 || { echo "Node.js not found — install from https://nodejs.org/"; exit 1; }
	@[ -d node_modules ] || npm install

typecheck: deps
	npx tsc --noEmit

test: deps
	npx vitest run --reporter=verbose

# Production: build server + client, then serve from Express
run: deps build
	node dist/server/index.js

# Development: Express API + Vite dev server (HMR on :5173, API proxy to :3000)
dev: deps
	npx tsx src/server/index.ts & VITE_PID=$$!; npx vite --config vite.config.ts; kill $$VITE_PID 2>/dev/null || true

build: deps
	npm run build

clean:
	rm -rf dist
