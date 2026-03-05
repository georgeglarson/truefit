// Package parser reads inventory data from flat files.
package parser

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"

	"gildedrose/item"
)

// Parse reads inventory lines from r. Each line has CSV format:
// Name,Category,SellIn,Quality
// Quoted fields are supported (e.g. "Sulfuras, Hand of Ragnaros").
func Parse(r io.Reader) ([]item.Item, error) {
	cr := csv.NewReader(r)
	cr.FieldsPerRecord = 4
	cr.TrimLeadingSpace = true

	var items []item.Item
	lineNum := 0

	for {
		record, err := cr.Read()
		if err == io.EOF {
			break
		}
		lineNum++
		if err != nil {
			return nil, fmt.Errorf("line %d: %w", lineNum, err)
		}

		// Skip blank rows (all empty fields)
		allEmpty := true
		for _, f := range record {
			if strings.TrimSpace(f) != "" {
				allEmpty = false
				break
			}
		}
		if allEmpty {
			continue
		}

		itm, err := parseRecord(record)
		if err != nil {
			return nil, fmt.Errorf("line %d: %w", lineNum, err)
		}
		items = append(items, itm)
	}

	return items, nil
}

func parseRecord(fields []string) (item.Item, error) {
	sellIn, err := strconv.Atoi(strings.TrimSpace(fields[2]))
	if err != nil {
		return item.Item{}, fmt.Errorf("invalid SellIn %q: %w", fields[2], err)
	}

	quality, err := strconv.Atoi(strings.TrimSpace(fields[3]))
	if err != nil {
		return item.Item{}, fmt.Errorf("invalid Quality %q: %w", fields[3], err)
	}

	name := strings.TrimSpace(fields[0])
	category := strings.TrimSpace(fields[1])

	if category != "Sulfuras" {
		if quality < 0 || quality > 50 {
			return item.Item{}, fmt.Errorf("quality %d out of range [0, 50] for %q", quality, name)
		}
	} else {
		if quality != 80 {
			return item.Item{}, fmt.Errorf("legendary item %q must have quality 80, got %d", name, quality)
		}
	}

	return item.Item{
		Name:     name,
		Category: category,
		SellIn:   sellIn,
		Quality:  quality,
	}, nil
}
