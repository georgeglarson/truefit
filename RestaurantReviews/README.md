# RestaurantReviews

The RestaurantReviews exercise is implemented as part of the project-wide dashboard. The source code, server, and tests live at the **repository root**:

- **Review models**: [`src/server/models/`](../src/server/models/)
- **Review routes**: [`src/server/routes/`](../src/server/routes/)
- **Review UI**: [`src/client/components/reviews/`](../src/client/components/reviews/)
- **Tests**: [`src/server/__tests__/`](../src/server/__tests__/) and [`src/client/__tests__/`](../src/client/__tests__/)

## Quick Start

From the **repository root**:

```sh
make test    # 371 tests (server + client)
make run     # builds and starts Express on http://localhost:3000
make dev     # dev mode: Express on :3000, Vite HMR on :5173
```

## RestaurantReviews API

| # | Requirement | Method | Endpoint |
|---|-------------|--------|----------|
| 1 | Create a user | POST | `/api/users` |
| 2 | Create a restaurant | POST | `/api/restaurants` |
| 3 | Create a review | POST | `/api/reviews` |
| 4 | Reviews by user | GET | `/api/reviews?userId=:id` |
| 5 | Reviews by restaurant | GET | `/api/reviews?restaurantId=:id` |
| 6 | Restaurants by city | GET | `/api/restaurants?city=:city` |
| 7 | Delete a review | DELETE | `/api/reviews/:id` |
| 8 | Block a user | PATCH | `/api/users/:id/block` |

Blocked users receive `403` when attempting to create reviews.

## Things To Consider

- **SRP**: Models handle data access only. Routes handle HTTP concerns. Shared validation helpers (`routes/validate.ts`) eliminate duplication across entity routes. The subprocess runner is a generic utility shared by all exercise endpoints.
- **Testability**: The Express app is a factory function accepting a database instance -- tests use in-memory SQLite with zero file I/O. Exercise endpoints mock the subprocess runner.
- **Extensibility**: Adding a new exercise means one route file and one line in `app.ts`. Adding a new review entity means one model and one route.
- **The "larger system" claim**: Every exercise says to approach it as part of a larger system. The dashboard *is* that system -- all 6 exercises are live, callable panels in a real application.
