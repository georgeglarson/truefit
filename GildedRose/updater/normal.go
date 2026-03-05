package updater

import "gildedrose/item"

// Normal handles standard items: quality degrades by 1 per day,
// or by 2 after the sell-by date.
type Normal struct{}

func (Normal) Update(i *item.Item) {
	i.SellIn--

	degradation := 1
	if i.SellIn < 0 {
		degradation = 2
	}

	i.Quality = clampQuality(i.Quality - degradation)
}
