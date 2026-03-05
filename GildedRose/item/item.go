// Package item defines the core inventory item type.
package item

import "fmt"

// Item represents a single inventory entry at the Gilded Rose.
type Item struct {
	Name     string
	Category string
	SellIn   int
	Quality  int
}

func (i Item) String() string {
	return fmt.Sprintf("%s (%s) — SellIn: %d, Quality: %d", i.Name, i.Category, i.SellIn, i.Quality)
}

// IsTrash returns true if the item's quality has reached zero.
func (i Item) IsTrash() bool {
	return i.Quality <= 0
}
