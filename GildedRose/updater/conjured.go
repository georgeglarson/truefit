package updater

import "gildedrose/item"

// Conjured handles conjured items: they degrade at twice the normal rate.
type Conjured struct{}

func (Conjured) Update(i *item.Item) {
	i.SellIn--

	degradation := 2
	if i.SellIn < 0 {
		degradation = 4
	}

	i.Quality = clampQuality(i.Quality - degradation)
}
