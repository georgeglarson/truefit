package updater

import "gildedrose/item"

// Backstage handles backstage passes: quality increases as the concert
// approaches, with accelerating gains at 10 and 5 days, then drops to
// zero after the concert.
type Backstage struct{}

func (Backstage) Update(i *item.Item) {
	i.SellIn--

	if i.SellIn < 0 {
		i.Quality = 0
		return
	}

	increase := 1
	if i.SellIn < 5 {
		increase = 3
	} else if i.SellIn < 10 {
		increase = 2
	}

	i.Quality = clampQuality(i.Quality + increase)
}
