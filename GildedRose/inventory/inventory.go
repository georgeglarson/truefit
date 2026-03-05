// Package inventory manages the collection of items and day progression.
package inventory

import (
	"gildedrose/item"
	"gildedrose/updater"
)

// Inventory holds the current state of the Gilded Rose's stock.
type Inventory struct {
	items    []item.Item
	registry *updater.Registry
	day      int
}

// New creates an inventory from a slice of items.
func New(items []item.Item) *Inventory {
	return &Inventory{
		items:    items,
		registry: updater.NewRegistry(),
		day:      0,
	}
}

// Day returns the current day number.
func (inv *Inventory) Day() int {
	return inv.day
}

// Items returns a copy of all items.
func (inv *Inventory) Items() []item.Item {
	out := make([]item.Item, len(inv.items))
	copy(out, inv.items)
	return out
}

// FindByName returns the item with the given name, or nil if not found.
func (inv *Inventory) FindByName(name string) *item.Item {
	for i := range inv.items {
		if inv.items[i].Name == name {
			cpy := inv.items[i]
			return &cpy
		}
	}
	return nil
}

// Trash returns all items with Quality <= 0.
func (inv *Inventory) Trash() []item.Item {
	var trash []item.Item
	for _, itm := range inv.items {
		if itm.IsTrash() {
			trash = append(trash, itm)
		}
	}
	return trash
}

// NextDay advances the simulation by one day, applying all degradation rules.
func (inv *Inventory) NextDay() {
	inv.day++
	for i := range inv.items {
		u := inv.registry.Get(inv.items[i].Name, inv.items[i].Category)
		u.Update(&inv.items[i])
	}
}
