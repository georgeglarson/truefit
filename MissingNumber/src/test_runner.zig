const std = @import("std");
const builtin = @import("builtin");
const testing = std.testing;

pub fn main() void {
    const test_fn_list = builtin.test_functions;
    var ok_count: usize = 0;
    var skip_count: usize = 0;
    var fail_count: usize = 0;
    var leaks: usize = 0;

    for (test_fn_list, 0..) |test_fn, i| {
        testing.allocator_instance = .{};
        defer {
            if (testing.allocator_instance.deinit() == .leak) {
                leaks += 1;
            }
        }
        testing.log_level = .warn;

        std.debug.print("  {d}/{d} {s}...", .{ i + 1, test_fn_list.len, test_fn.name });

        if (test_fn.func()) |_| {
            ok_count += 1;
            std.debug.print("OK\n", .{});
        } else |err| switch (err) {
            error.SkipZigTest => {
                skip_count += 1;
                std.debug.print("SKIP\n", .{});
            },
            else => {
                fail_count += 1;
                std.debug.print("FAIL ({s})\n", .{@errorName(err)});
            },
        }
    }

    const total = ok_count + skip_count + fail_count;
    if (total > 0) {
        std.debug.print("\n{d} passed", .{ok_count});
        if (skip_count > 0) std.debug.print(", {d} skipped", .{skip_count});
        if (fail_count > 0) std.debug.print(", {d} failed", .{fail_count});
        if (leaks > 0) std.debug.print(", {d} leaked", .{leaks});
        std.debug.print(" (out of {d})\n", .{total});
    }

    if (fail_count > 0 or leaks > 0) {
        std.process.exit(1);
    }
}
