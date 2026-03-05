package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"gildedrose/inventory"
	"gildedrose/parser"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <inventory_file>\n", os.Args[0])
		os.Exit(1)
	}

	f, err := os.Open(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()

	items, err := parser.Parse(f)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	inv := inventory.New(items)
	repl(inv)
}

func repl(inv *inventory.Inventory) {
	scanner := bufio.NewScanner(os.Stdin)

	printHelp()
	for {
		fmt.Printf("\n[Day %d] > ", inv.Day())
		if !scanner.Scan() {
			break
		}

		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			continue
		}

		switch {
		case input == "list":
			for _, itm := range inv.Items() {
				fmt.Println(" ", itm)
			}
		case strings.HasPrefix(input, "item "):
			name := strings.TrimSpace(input[5:])
			itm := inv.FindByName(name)
			if itm == nil {
				fmt.Printf("  Item not found: %q\n", name)
			} else {
				fmt.Println(" ", itm)
			}
		case input == "next":
			inv.NextDay()
			fmt.Printf("  Advanced to day %d.\n", inv.Day())
		case input == "trash":
			trash := inv.Trash()
			if len(trash) == 0 {
				fmt.Println("  No trash items.")
			} else {
				for _, itm := range trash {
					fmt.Println(" ", itm)
				}
			}
		case input == "help":
			printHelp()
		case input == "quit" || input == "exit":
			return
		default:
			fmt.Printf("  Unknown command: %q. Type 'help' for options.\n", input)
		}
	}
}

func printHelp() {
	fmt.Println("Commands:")
	fmt.Println("  list          — Show all inventory")
	fmt.Println("  item <name>   — Show details for a single item")
	fmt.Println("  next          — Advance to the next day")
	fmt.Println("  trash         — List items with Quality = 0")
	fmt.Println("  help          — Show this help")
	fmt.Println("  quit          — Exit")
}
