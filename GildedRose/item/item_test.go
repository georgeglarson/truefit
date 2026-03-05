package item

import "testing"

func TestIsTrash_zeroQuality(t *testing.T) {
	i := Item{Name: "Junk", Quality: 0}
	if !i.IsTrash() {
		t.Error("expected item with quality 0 to be trash")
	}
}

func TestIsTrash_negativeQuality(t *testing.T) {
	i := Item{Name: "Junk", Quality: -1}
	if !i.IsTrash() {
		t.Error("expected item with negative quality to be trash")
	}
}

func TestIsTrash_positiveQuality(t *testing.T) {
	i := Item{Name: "Good", Quality: 10}
	if i.IsTrash() {
		t.Error("expected item with positive quality not to be trash")
	}
}

func TestString_format(t *testing.T) {
	i := Item{Name: "Sword", Category: "Weapon", SellIn: 10, Quality: 20}
	expected := "Sword (Weapon) — SellIn: 10, Quality: 20"
	if i.String() != expected {
		t.Errorf("expected %q, got %q", expected, i.String())
	}
}
