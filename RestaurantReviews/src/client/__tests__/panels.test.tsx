// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

function noContentResponse() {
  return Promise.resolve({
    ok: true,
    status: 204,
    json: () => Promise.reject(new Error("no content")),
  });
}

function mockInitialLoads(
  users: unknown[] = [],
  restaurants: unknown[] = [],
  reviews: unknown[] = []
) {
  mockFetch.mockImplementation((url: string) => {
    if (url === "/api/users") return jsonResponse(users);
    if (url === "/api/restaurants") return jsonResponse(restaurants);
    if (url === "/api/reviews") return jsonResponse(reviews);
    return jsonResponse({ error: "not found" }, 404);
  });
}

// ── TabNav ARIA ─────────────────────────────────────────────────────

describe("TabNav accessibility", () => {
  it("has role=tablist on nav", () => {
    mockInitialLoads();
    render(<App />);
    const nav = screen.getByRole("tablist");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("aria-label", "Exercise panels");
  });

  it("has role=tab on each tab button", () => {
    mockInitialLoads();
    render(<App />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);
  });

  it("marks active tab with aria-selected=true", () => {
    mockInitialLoads();
    render(<App />);
    const tabs = screen.getAllByRole("tab");
    const activeTab = tabs.find((t) => t.textContent === "Restaurant Reviews");
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("marks inactive tabs with aria-selected=false", () => {
    mockInitialLoads();
    render(<App />);
    const tabs = screen.getAllByRole("tab");
    const inactiveTabs = tabs.filter(
      (t) => t.textContent !== "Restaurant Reviews"
    );
    for (const tab of inactiveTabs) {
      expect(tab).toHaveAttribute("aria-selected", "false");
    }
  });

  it("updates aria-selected on tab switch", () => {
    mockInitialLoads();
    render(<App />);
    const cashTab = screen.getByRole("tab", { name: "Cash Register" });
    expect(cashTab).toHaveAttribute("aria-selected", "false");

    fireEvent.click(cashTab);
    expect(cashTab).toHaveAttribute("aria-selected", "true");

    const reviewsTab = screen.getByRole("tab", { name: "Restaurant Reviews" });
    expect(reviewsTab).toHaveAttribute("aria-selected", "false");
  });
});

// ── Morse Code mode switching ───────────────────────────────────────

describe("MorseCodePanel mode switching", () => {
  function goToMorse() {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Morse Code", { selector: "button[role='tab']" }));
  }

  it("pre-fills encode default text on load", () => {
    goToMorse();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("HELLO WORLD");
  });

  it("switches to decode with empty input when no output exists", () => {
    goToMorse();
    const decodeButtons = screen.getAllByText("Decode");
    fireEvent.click(decodeButtons[0]);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  it("feeds encode output into decode input on mode switch", async () => {
    goToMorse();
    const morseOutput = "....|.|.-..|.-..|---||||.--|---|-.|.-..|-..|";
    mockFetch.mockReturnValueOnce(jsonResponse({ output: morseOutput }));

    // Encode first
    const encodeButtons = screen.getAllByText("Encode");
    fireEvent.click(encodeButtons[encodeButtons.length - 1]);
    await waitFor(() => {
      expect(screen.getByText(morseOutput)).toBeInTheDocument();
    });

    // Switch to decode — should prefill with encode output
    const decodeButtons = screen.getAllByText("Decode");
    fireEvent.click(decodeButtons[0]);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(morseOutput);
  });

  it("restores encode default text on Encode click when no output", () => {
    goToMorse();
    const decodeButtons = screen.getAllByText("Decode");
    fireEvent.click(decodeButtons[0]);
    const encodeButtons = screen.getAllByText("Encode");
    fireEvent.click(encodeButtons[0]);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    // When switching back with no prior output, feeds output if available, else keeps default
    expect(textarea.value).toBe("HELLO WORLD");
  });

  it("sends to correct endpoint based on mode", async () => {
    goToMorse();

    // Type some morse manually so input is non-empty for decode
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const decodeButtons = screen.getAllByText("Decode");
    fireEvent.click(decodeButtons[0]);
    fireEvent.change(textarea, { target: { value: "....|.-.." } });

    mockFetch.mockReturnValueOnce(
      jsonResponse({ output: "decoded text" })
    );

    const allDecodeButtons = screen.getAllByText("Decode");
    fireEvent.click(allDecodeButtons[allDecodeButtons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/exercises/morse-code/decode",
        expect.any(Object)
      );
    });
  });
});

// ── ReviewsPanel — user table ───────────────────────────────────────

describe("ReviewsPanel — user table", () => {
  it("renders users in a data table on load", async () => {
    mockInitialLoads([
      { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" },
      { id: 2, name: "Bob", email: "bob@example.com", blocked: 1, created_at: "2024-01-01" },
    ]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("blocked")).toBeInTheDocument();
    });
  });

  it("shows empty state when no users", async () => {
    mockInitialLoads();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No users yet/)).toBeInTheDocument();
    });
  });

  it("inline edit flow — click Edit, modify, Save", async () => {
    const alice = { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" };
    mockInitialLoads([alice]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Click Edit button
    fireEvent.click(screen.getAllByText("Edit")[0]);

    // Should show edit inputs
    const nameInput = screen.getByLabelText("Edit name") as HTMLInputElement;
    expect(nameInput.value).toBe("Alice");

    // Modify name
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alicia");

    // Mock the PUT call and refresh
    const updatedAlice = { ...alice, name: "Alicia" };
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PUT") return jsonResponse(updatedAlice);
      if (url === "/api/users") return jsonResponse([updatedAlice]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Alicia")).toBeInTheDocument();
    });
  });

  it("inline edit — Cancel reverts without saving", async () => {
    mockInitialLoads([
      { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" },
    ]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Edit")[0]);
    fireEvent.click(screen.getByText("Cancel"));

    // Should show Alice again, not edit inputs
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByLabelText("Edit name")).not.toBeInTheDocument();
  });

  it("block/unblock toggle", async () => {
    const alice = { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" };
    mockInitialLoads([alice]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Block")).toBeInTheDocument();
    });

    // Mock block call + refresh
    const blockedAlice = { ...alice, blocked: 1 };
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PATCH") return jsonResponse(blockedAlice);
      if (url === "/api/users") return jsonResponse([blockedAlice]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    fireEvent.click(screen.getByText("Block"));

    await waitFor(() => {
      expect(screen.getByText("blocked")).toBeInTheDocument();
      expect(screen.getByText("Unblock")).toBeInTheDocument();
    });
  });

  it("delete user with FK error shows inline message", async () => {
    const alice = { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" };
    mockInitialLoads([alice]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Mock DELETE returning 409
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "DELETE")
        return jsonResponse(
          { error: "cannot delete user with existing reviews" },
          409
        );
      if (url === "/api/users") return jsonResponse([alice]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    fireEvent.click(screen.getByText("Delete"));

    // Confirm the delete
    await waitFor(() => {
      expect(screen.getByText("Confirm?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Confirm?"));

    await waitFor(() => {
      expect(
        screen.getByText("cannot delete user with existing reviews")
      ).toBeInTheDocument();
    });
  });
});

// ── ReviewsPanel — restaurant table ─────────────────────────────────

describe("ReviewsPanel — restaurant table", () => {
  it("renders restaurants in a data table", async () => {
    mockInitialLoads([], [
      { id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" },
    ]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Pizza Palace")).toBeInTheDocument();
      expect(screen.getByText("Pittsburgh")).toBeInTheDocument();
    });
  });

  it("shows empty state when no restaurants", async () => {
    mockInitialLoads();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No restaurants/)).toBeInTheDocument();
    });
  });

  it("client-side city filter works", async () => {
    mockInitialLoads([], [
      { id: 1, name: "Place A", city: "Pittsburgh", cuisine: "", created_at: "2024-01-01" },
      { id: 2, name: "Place B", city: "Philadelphia", cuisine: "", created_at: "2024-01-01" },
    ]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Place A")).toBeInTheDocument();
      expect(screen.getByText("Place B")).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByPlaceholderText("Filter by city..."),
      "pitt"
    );

    expect(screen.getByText("Place A")).toBeInTheDocument();
    expect(screen.queryByText("Place B")).not.toBeInTheDocument();
  });

  it("delete restaurant with FK error shows inline message", async () => {
    const restaurant = { id: 1, name: "Pizza", city: "NYC", cuisine: "", created_at: "2024-01-01" };
    mockInitialLoads([], [restaurant]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Pizza")).toBeInTheDocument();
    });

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "DELETE")
        return jsonResponse(
          { error: "cannot delete restaurant with existing reviews" },
          409
        );
      if (url === "/api/users") return jsonResponse([]);
      if (url === "/api/restaurants") return jsonResponse([restaurant]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    // First click shows confirmation
    const deleteBtns = screen.getAllByText("Delete");
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);

    // Second click confirms
    await waitFor(() => {
      expect(screen.getByText("Confirm?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Confirm?"));

    await waitFor(() => {
      expect(
        screen.getByText("cannot delete restaurant with existing reviews")
      ).toBeInTheDocument();
    });
  });
});

// ── ReviewsPanel — review table ─────────────────────────────────────

describe("ReviewsPanel — review table", () => {
  it("renders reviews with user/restaurant names", async () => {
    mockInitialLoads(
      [{ id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" }],
      [{ id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" }],
      [
        {
          id: 1,
          user_id: 1,
          restaurant_id: 1,
          rating: 5,
          body: "Amazing!",
          user_name: "Alice",
          restaurant_name: "Pizza Palace",
          created_at: "2024-01-01",
        },
      ]
    );
    render(<App />);

    await waitFor(() => {
      // Verify names appear (not just IDs)
      const cells = screen.getAllByText("Alice");
      expect(cells.length).toBeGreaterThanOrEqual(1);
      const palaceCells = screen.getAllByText("Pizza Palace");
      expect(palaceCells.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Amazing!")).toBeInTheDocument();
    });
  });

  it("shows empty state when no reviews", async () => {
    mockInitialLoads();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    });
  });

  it("entity picker dropdowns are populated", async () => {
    mockInitialLoads(
      [
        { id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" },
        { id: 2, name: "Bob", email: "bob@example.com", blocked: 1, created_at: "2024-01-01" },
      ],
      [
        { id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" },
      ]
    );
    render(<App />);

    await waitFor(() => {
      // User picker
      const userSelect = screen.getByLabelText("Select user") as HTMLSelectElement;
      expect(userSelect.options.length).toBe(3); // "Select user..." + 2 users
      expect(userSelect.options[1].text).toContain("Alice");
      expect(userSelect.options[2].text).toContain("[blocked]");

      // Restaurant picker
      const restaurantSelect = screen.getByLabelText("Select restaurant") as HTMLSelectElement;
      expect(restaurantSelect.options.length).toBe(2); // "Select restaurant..." + 1 restaurant
      expect(restaurantSelect.options[1].text).toContain("Pizza Palace");
    });
  });

  it("creates review via dropdowns", async () => {
    const users = [{ id: 1, name: "Alice", email: "alice@example.com", blocked: 0, created_at: "2024-01-01" }];
    const restaurants = [{ id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" }];
    mockInitialLoads(users, restaurants);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText("Select user")).toBeInTheDocument();
    });

    // Select user, restaurant, rating
    await userEvent.selectOptions(screen.getByLabelText("Select user"), "1");
    await userEvent.selectOptions(screen.getByLabelText("Select restaurant"), "1");
    await userEvent.selectOptions(screen.getByLabelText("Select rating"), "5");
    await userEvent.type(screen.getByPlaceholderText("Review text (optional)"), "Wonderful!");

    // Mock create + refresh
    const newReview = {
      id: 1, user_id: 1, restaurant_id: 1, rating: 5, body: "Wonderful!",
      user_name: "Alice", restaurant_name: "Pizza Palace", created_at: "2024-01-01",
    };
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") return jsonResponse(newReview, 201);
      if (url === "/api/users") return jsonResponse(users);
      if (url === "/api/restaurants") return jsonResponse(restaurants);
      if (url === "/api/reviews") return jsonResponse([newReview]);
      return jsonResponse({}, 200);
    });

    const createBtns = screen.getAllByText("Create");
    fireEvent.click(createBtns[createBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Wonderful!")).toBeInTheDocument();
    });
  });

  it("shows error when blocked user tries to create review", async () => {
    mockInitialLoads(
      [{ id: 1, name: "Alice", email: "alice@example.com", blocked: 1, created_at: "2024-01-01" }],
      [{ id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" }]
    );
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText("Select user")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText("Select user"), "1");
    await userEvent.selectOptions(screen.getByLabelText("Select restaurant"), "1");
    await userEvent.selectOptions(screen.getByLabelText("Select rating"), "5");

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") return jsonResponse({ error: "user is blocked" }, 403);
      if (url === "/api/users")
        return jsonResponse([
          { id: 1, name: "Alice", email: "alice@example.com", blocked: 1, created_at: "2024-01-01" },
        ]);
      if (url === "/api/restaurants")
        return jsonResponse([
          { id: 1, name: "Pizza Palace", city: "Pittsburgh", cuisine: "Italian", created_at: "2024-01-01" },
        ]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    const createBtns = screen.getAllByText("Create");
    fireEvent.click(createBtns[createBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("user is blocked")).toBeInTheDocument();
    });
  });

  it("inline edit review — change rating", async () => {
    const review = {
      id: 1, user_id: 1, restaurant_id: 1, rating: 3, body: "OK",
      user_name: "Alice", restaurant_name: "Pizza", created_at: "2024-01-01",
    };
    mockInitialLoads([], [], [review]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    // Find the Edit button in the review section (last one)
    const editBtns = screen.getAllByText("Edit");
    fireEvent.click(editBtns[editBtns.length - 1]);

    // Change rating
    const ratingSelect = screen.getByLabelText("Edit rating");
    await userEvent.selectOptions(ratingSelect, "5");

    // Mock save + refresh
    const updated = { ...review, rating: 5 };
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PUT") return jsonResponse(updated);
      if (url === "/api/users") return jsonResponse([]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([updated]);
      return jsonResponse({}, 200);
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      // The updated rating "5" should be in the table
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/reviews/1",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("deletes a review", async () => {
    const review = {
      id: 1, user_id: 1, restaurant_id: 1, rating: 5, body: "Great!",
      user_name: "Alice", restaurant_name: "Pizza", created_at: "2024-01-01",
    };
    mockInitialLoads([], [], [review]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Great!")).toBeInTheDocument();
    });

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "DELETE") return noContentResponse();
      if (url === "/api/users") return jsonResponse([]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    const deleteBtns = screen.getAllByText("Delete");
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);

    // Confirm the delete
    await waitFor(() => {
      expect(screen.getByText("Confirm?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Confirm?"));

    await waitFor(() => {
      expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    });
  });
});

// ── Cross-section refresh ───────────────────────────────────────────

describe("ReviewsPanel — cross-section refresh", () => {
  it("creating a user updates review section dropdown", async () => {
    mockInitialLoads();
    render(<App />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const newUser = { id: 1, name: "Charlie", email: "charlie@example.com", blocked: 0, created_at: "2024-01-01" };

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") return jsonResponse(newUser, 201);
      if (url === "/api/users") return jsonResponse([newUser]);
      if (url === "/api/restaurants") return jsonResponse([]);
      if (url === "/api/reviews") return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    await userEvent.type(screen.getAllByPlaceholderText("Name")[0], "Charlie");
    await userEvent.type(screen.getByPlaceholderText("Email"), "charlie@example.com");
    fireEvent.click(screen.getByText("Create User"));

    await waitFor(() => {
      const userSelect = screen.getByLabelText("Select user") as HTMLSelectElement;
      const options = Array.from(userSelect.options).map((o) => o.text);
      expect(options.some((t) => t.includes("Charlie"))).toBe(true);
    });
  });
});

// ── GildedRose session interaction ──────────────────────────────────

describe("GildedRosePanel — session interaction", () => {
  it("sends command and displays output", async () => {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Gilded Rose", { selector: "button[role='tab']" }));

    mockFetch.mockReturnValueOnce(
      jsonResponse({ sessionId: "abc-123", day: 0 })
    );
    fireEvent.click(screen.getByText("Start Session"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/list, next/)).toBeInTheDocument();
    });

    mockFetch.mockReturnValueOnce(
      jsonResponse({ output: "Item1 - SellIn: 5, Quality: 10", day: 1 })
    );
    const input = screen.getByPlaceholderText(/list, next/);
    await userEvent.type(input, "list");
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(screen.getByText(/Item1 - SellIn: 5/)).toBeInTheDocument();
    });
  });

  it("end session calls DELETE and resets to start form", async () => {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Gilded Rose", { selector: "button[role='tab']" }));

    mockFetch.mockReturnValueOnce(
      jsonResponse({ sessionId: "abc-123", day: 0 })
    );
    fireEvent.click(screen.getByText("Start Session"));

    await waitFor(() => {
      expect(screen.getByText("End Session")).toBeInTheDocument();
    });

    mockFetch.mockReturnValueOnce(noContentResponse());
    fireEvent.click(screen.getByText("End Session"));

    await waitFor(() => {
      expect(screen.getByText("Start Session")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/exercises/gilded-rose/abc-123",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

// ── Exercise panels — error and network failure ─────────────────────

describe("Exercise panels — edge cases", () => {
  it("handles network failure gracefully", async () => {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Cash Register", { selector: "button[role='tab']" }));
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("disables Run button while loading", async () => {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Cash Register", { selector: "button[role='tab']" }));

    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => {
      expect(screen.getByText("Running...")).toBeInTheDocument();
      expect(screen.getByText("Running...")).toBeDisabled();
    });
  });

  it("does not submit empty input", () => {
    mockInitialLoads();
    render(<App />);
    fireEvent.click(screen.getByText("Missing Number", { selector: "button[role='tab']" }));

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "" } });

    // Reset mock to track only new calls
    mockFetch.mockClear();
    fireEvent.click(screen.getByText("Run"));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
