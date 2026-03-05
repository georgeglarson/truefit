package updater

import "gildedrose/item"

// Sulfuras handles legendary items: they never degrade and are never sold.
// Quality is always 80.
type Sulfuras struct{}

func (Sulfuras) Update(i *item.Item) {
	// Legendary items do not change.
	i.Quality = SulfurasQuality
}
