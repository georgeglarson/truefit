// Package updater defines the quality/sellIn update strategies for each item category.
package updater

import "gildedrose/item"

const (
	MaxQuality       = 50
	SulfurasQuality  = 80
)

// Updater applies end-of-day changes to an item.
type Updater interface {
	Update(i *item.Item)
}

// clampQuality enforces the 0–50 quality bounds.
func clampQuality(q int) int {
	if q < 0 {
		return 0
	}
	if q > MaxQuality {
		return MaxQuality
	}
	return q
}
