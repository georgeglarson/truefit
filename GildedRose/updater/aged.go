package updater

import "gildedrose/item"

// Aged handles items that increase in quality over time (e.g., Aged Brie).
type Aged struct{}

func (Aged) Update(i *item.Item) {
	i.SellIn--

	increase := 1
	if i.SellIn < 0 {
		increase = 2
	}

	i.Quality = clampQuality(i.Quality + increase)
}
