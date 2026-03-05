const std = @import("std");
const testing = std.testing;

/// Finds the missing number in a sequential series.
/// Uses the arithmetic sum formula: expected_sum - actual_sum = missing_number.
///
/// Assumes the missing value lies strictly *within* the observed [min, max] range.
/// If the missing value is at the boundary (before min or after max), it cannot
/// be detected from the data alone — the range would appear complete. This matches
/// the problem specification where all sample inputs have interior gaps.
pub fn findMissing(numbers: []const i64) i64 {
    if (numbers.len == 0) return 0;

    var min: i64 = numbers[0];
    var max: i64 = numbers[0];
    var actual_sum: i64 = 0;

    for (numbers) |n| {
        if (n < min) min = n;
        if (n > max) max = n;
        actual_sum += n;
    }

    const expected_sum = @divExact((max + min) * (max - min + 1), 2);
    return expected_sum - actual_sum;
}

// --- Sample input tests (from problem statement) ---

test "findMissing: sample 1 — missing 11 from 1..12" {
    const nums = [_]i64{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12 };
    try testing.expectEqual(@as(i64, 11), findMissing(&nums));
}

test "findMissing: sample 2 — missing 25 from 24..29 (unordered)" {
    const nums = [_]i64{ 24, 26, 27, 29, 28 };
    try testing.expectEqual(@as(i64, 25), findMissing(&nums));
}

test "findMissing: sample 3 — missing 3 from 1..5" {
    const nums = [_]i64{ 1, 2, 4, 5 };
    try testing.expectEqual(@as(i64, 3), findMissing(&nums));
}

test "findMissing: sample 4 — missing 106 from 99..107" {
    const nums = [_]i64{ 99, 100, 101, 102, 103, 104, 105, 107 };
    try testing.expectEqual(@as(i64, 106), findMissing(&nums));
}

test "findMissing: sample 5 — missing 113 from 105..118 (unordered)" {
    const nums = [_]i64{ 109, 105, 107, 108, 106, 110, 112, 111, 118, 116, 115, 114, 117 };
    try testing.expectEqual(@as(i64, 113), findMissing(&nums));
}

// --- Boundary: gap near edges of range ---

test "findMissing: gap at second position" {
    const nums = [_]i64{ 1, 3, 4, 5, 6 };
    try testing.expectEqual(@as(i64, 2), findMissing(&nums));
}

test "findMissing: gap at penultimate position" {
    const nums = [_]i64{ 1, 2, 3, 4, 6 };
    try testing.expectEqual(@as(i64, 5), findMissing(&nums));
}

// --- Edge cases: ambiguous boundary (missing at min-1 or max+1) ---
// The algorithm returns 0 because the observed range appears complete.
// This is by design — the problem guarantees interior gaps.

test "findMissing: contiguous range returns 0 (no interior gap)" {
    const nums = [_]i64{ 2, 3, 4, 5 };
    try testing.expectEqual(@as(i64, 0), findMissing(&nums));
}

// --- Minimal series ---

test "findMissing: two-element series with interior gap" {
    const nums = [_]i64{ 1, 3 };
    try testing.expectEqual(@as(i64, 2), findMissing(&nums));
}

test "findMissing: single element — no gap detectable" {
    const nums = [_]i64{5};
    try testing.expectEqual(@as(i64, 0), findMissing(&nums));
}

test "findMissing: empty slice" {
    const nums = [_]i64{};
    try testing.expectEqual(@as(i64, 0), findMissing(&nums));
}

// --- Negative numbers ---

test "findMissing: negative range, missing middle" {
    const nums = [_]i64{ -5, -4, -3, -1 };
    try testing.expectEqual(@as(i64, -2), findMissing(&nums));
}

test "findMissing: range spanning zero, missing zero" {
    const nums = [_]i64{ -2, -1, 1, 2 };
    try testing.expectEqual(@as(i64, 0), findMissing(&nums));
}

test "findMissing: range spanning zero, missing negative" {
    const nums = [_]i64{ -3, -2, 0, 1 };
    try testing.expectEqual(@as(i64, -1), findMissing(&nums));
}

test "findMissing: range spanning zero, missing positive" {
    const nums = [_]i64{ -1, 0, 2, 3 };
    try testing.expectEqual(@as(i64, 1), findMissing(&nums));
}

test "findMissing: all-negative range, gap near start" {
    const nums = [_]i64{ -10, -8, -7, -6, -5 };
    try testing.expectEqual(@as(i64, -9), findMissing(&nums));
}

test "findMissing: all-negative range, gap near end" {
    const nums = [_]i64{ -10, -9, -8, -7, -5 };
    try testing.expectEqual(@as(i64, -6), findMissing(&nums));
}

// --- Large ranges ---

test "findMissing: 1000-element range, missing 500" {
    var nums: [999]i64 = undefined;
    var idx: usize = 0;
    var i: i64 = 1;
    while (i <= 1000) : (i += 1) {
        if (i == 500) continue;
        nums[idx] = i;
        idx += 1;
    }
    try testing.expectEqual(@as(i64, 500), findMissing(&nums));
}

test "findMissing: 1000-element range, missing 2 (near start)" {
    var nums: [999]i64 = undefined;
    var idx: usize = 0;
    var i: i64 = 1;
    while (i <= 1000) : (i += 1) {
        if (i == 2) continue;
        nums[idx] = i;
        idx += 1;
    }
    try testing.expectEqual(@as(i64, 2), findMissing(&nums));
}

test "findMissing: 1000-element range, missing 999 (near end)" {
    var nums: [999]i64 = undefined;
    var idx: usize = 0;
    var i: i64 = 1;
    while (i <= 1000) : (i += 1) {
        if (i == 999) continue;
        nums[idx] = i;
        idx += 1;
    }
    try testing.expectEqual(@as(i64, 999), findMissing(&nums));
}

// --- Ordering shouldn't matter ---

test "findMissing: reverse-ordered input" {
    const nums = [_]i64{ 10, 9, 8, 7, 6, 4, 3, 2, 1 };
    try testing.expectEqual(@as(i64, 5), findMissing(&nums));
}

test "findMissing: already sorted input" {
    const nums = [_]i64{ 1, 2, 3, 4, 6, 7, 8, 9, 10 };
    try testing.expectEqual(@as(i64, 5), findMissing(&nums));
}

test "findMissing: scrambled input" {
    const nums = [_]i64{ 7, 2, 9, 4, 1, 8, 3, 10, 6 };
    try testing.expectEqual(@as(i64, 5), findMissing(&nums));
}
