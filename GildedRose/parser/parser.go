// Package parser reads inventory data from flat files.
package parser

import (
	"bufio"
	"fmt"
	"io"
	"strconv"
	"strings"

	"gildedrose/item"
)

// Parse reads inventory lines from r. Each line has the format:
// Name,Category,SellIn,Quality
func Parse(r io.Reader) ([]item.Item, error) {
	var items []item.Item
	scanner := bufio.NewScanner(r)
	lineNum := 0

	for scanner.Scan() {
		lineNum++
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		itm, err := parseLine(line)
		if err != nil {
			return nil, fmt.Errorf("line %d: %w", lineNum, err)
		}
		items = append(items, itm)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("reading input: %w", err)
	}

	return items, nil
}

func parseLine(line string) (item.Item, error) {
	parts := strings.Split(line, ",")
	if len(parts) != 4 {
		return item.Item{}, fmt.Errorf("expected 4 fields, got %d: %q", len(parts), line)
	}

	sellIn, err := strconv.Atoi(strings.TrimSpace(parts[2]))
	if err != nil {
		return item.Item{}, fmt.Errorf("invalid SellIn %q: %w", parts[2], err)
	}

	quality, err := strconv.Atoi(strings.TrimSpace(parts[3]))
	if err != nil {
		return item.Item{}, fmt.Errorf("invalid Quality %q: %w", parts[3], err)
	}

	return item.Item{
		Name:     strings.TrimSpace(parts[0]),
		Category: strings.TrimSpace(parts[1]),
		SellIn:   sellIn,
		Quality:  quality,
	}, nil
}
