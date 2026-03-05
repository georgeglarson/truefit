const std = @import("std");
const lib = @import("MissingNumber_lib");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const stdout = std.io.getStdOut().writer();
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    if (args.len < 2) {
        try std.io.getStdErr().writer().print("Usage: {s} <input_file>\n", .{args[0]});
        std.process.exit(1);
    }

    const input = try std.fs.cwd().readFileAlloc(allocator, args[1], 1024 * 1024);
    defer allocator.free(input);

    const results = try lib.processInput(allocator, input);
    defer allocator.free(results);

    for (results) |missing| {
        try stdout.print("{d}\n", .{missing});
    }
}
