package updater

import (
	"testing"

	"gildedrose/item"
)

// helper: create an item, apply the updater, return the result.
func applyUpdate(u Updater, sellIn, quality int) item.Item {
	i := item.Item{Name: "Test", Category: "Test", SellIn: sellIn, Quality: quality}
	u.Update(&i)
	return i
}

// ============================================================
// Normal items
// ============================================================

func TestNormal_degradesByOne(t *testing.T) {
	i := applyUpdate(Normal{}, 10, 20)
	if i.Quality != 19 {
		t.Errorf("expected quality 19, got %d", i.Quality)
	}
	if i.SellIn != 9 {
		t.Errorf("expected sellIn 9, got %d", i.SellIn)
	}
}

func TestNormal_degradesTwiceAfterSellBy(t *testing.T) {
	i := applyUpdate(Normal{}, 0, 20)
	if i.Quality != 18 {
		t.Errorf("expected quality 18 (2x degradation), got %d", i.Quality)
	}
}

func TestNormal_qualityNeverNegative(t *testing.T) {
	i := applyUpdate(Normal{}, 10, 0)
	if i.Quality != 0 {
		t.Errorf("expected quality 0, got %d", i.Quality)
	}
}

func TestNormal_qualityNeverNegativeAfterSellBy(t *testing.T) {
	i := applyUpdate(Normal{}, 0, 1)
	if i.Quality != 0 {
		t.Errorf("expected quality 0 (clamped), got %d", i.Quality)
	}
}

func TestNormal_sellInDecreases(t *testing.T) {
	i := applyUpdate(Normal{}, 5, 10)
	if i.SellIn != 4 {
		t.Errorf("expected sellIn 4, got %d", i.SellIn)
	}
}

func TestNormal_sellInGoesNegative(t *testing.T) {
	i := applyUpdate(Normal{}, 0, 10)
	if i.SellIn != -1 {
		t.Errorf("expected sellIn -1, got %d", i.SellIn)
	}
}

func TestNormal_multipleUpdates(t *testing.T) {
	itm := item.Item{Name: "Test", Category: "Test", SellIn: 2, Quality: 10}
	u := Normal{}
	u.Update(&itm) // day 1: SellIn=1, Quality=9
	u.Update(&itm) // day 2: SellIn=0, Quality=8
	u.Update(&itm) // day 3: SellIn=-1, Quality=6 (2x)
	if itm.Quality != 6 {
		t.Errorf("expected quality 6 after 3 days, got %d", itm.Quality)
	}
}

// ============================================================
// Aged items (Aged Brie)
// ============================================================

func TestAged_qualityIncreases(t *testing.T) {
	i := applyUpdate(Aged{}, 20, 10)
	if i.Quality != 11 {
		t.Errorf("expected quality 11, got %d", i.Quality)
	}
}

func TestAged_qualityIncreasesTwiceAfterSellBy(t *testing.T) {
	i := applyUpdate(Aged{}, 0, 10)
	if i.Quality != 12 {
		t.Errorf("expected quality 12 (2x increase), got %d", i.Quality)
	}
}

func TestAged_qualityCapsAt50(t *testing.T) {
	i := applyUpdate(Aged{}, 20, 50)
	if i.Quality != 50 {
		t.Errorf("expected quality 50 (capped), got %d", i.Quality)
	}
}

func TestAged_qualityCapsAt50AfterSellBy(t *testing.T) {
	i := applyUpdate(Aged{}, 0, 49)
	if i.Quality != 50 {
		t.Errorf("expected quality 50 (capped at max), got %d", i.Quality)
	}
}

func TestAged_sellInDecreases(t *testing.T) {
	i := applyUpdate(Aged{}, 10, 10)
	if i.SellIn != 9 {
		t.Errorf("expected sellIn 9, got %d", i.SellIn)
	}
}

// ============================================================
// Sulfuras (legendary)
// ============================================================

func TestSulfuras_qualityAlways80(t *testing.T) {
	i := applyUpdate(Sulfuras{}, 80, 80)
	if i.Quality != 80 {
		t.Errorf("expected quality 80, got %d", i.Quality)
	}
}

func TestSulfuras_sellInNeverChanges(t *testing.T) {
	i := applyUpdate(Sulfuras{}, 80, 80)
	if i.SellIn != 80 {
		t.Errorf("expected sellIn unchanged at 80, got %d", i.SellIn)
	}
}

func TestSulfuras_resetsToEightyIfCorrupted(t *testing.T) {
	i := applyUpdate(Sulfuras{}, 80, 40)
	if i.Quality != 80 {
		t.Errorf("expected quality reset to 80, got %d", i.Quality)
	}
}

// ============================================================
// Backstage Passes
// ============================================================

func TestBackstage_qualityIncreasesBy1_moreThan10Days(t *testing.T) {
	i := applyUpdate(Backstage{}, 15, 10)
	if i.Quality != 11 {
		t.Errorf("expected quality 11, got %d", i.Quality)
	}
}

func TestBackstage_qualityIncreasesBy2_at10Days(t *testing.T) {
	i := applyUpdate(Backstage{}, 10, 10)
	// SellIn becomes 9 (< 10), so +2
	if i.Quality != 12 {
		t.Errorf("expected quality 12, got %d", i.Quality)
	}
}

func TestBackstage_qualityIncreasesBy2_at6Days(t *testing.T) {
	i := applyUpdate(Backstage{}, 6, 10)
	// SellIn becomes 5 (< 10 but not < 5), so +2
	if i.Quality != 12 {
		t.Errorf("expected quality 12, got %d", i.Quality)
	}
}

func TestBackstage_qualityIncreasesBy3_at5Days(t *testing.T) {
	i := applyUpdate(Backstage{}, 5, 10)
	// SellIn becomes 4 (< 5), so +3
	if i.Quality != 13 {
		t.Errorf("expected quality 13, got %d", i.Quality)
	}
}

func TestBackstage_qualityIncreasesBy3_at1Day(t *testing.T) {
	i := applyUpdate(Backstage{}, 1, 10)
	// SellIn becomes 0 (< 5), so +3
	if i.Quality != 13 {
		t.Errorf("expected quality 13, got %d", i.Quality)
	}
}

func TestBackstage_qualityDropsToZero_afterConcert(t *testing.T) {
	i := applyUpdate(Backstage{}, 0, 50)
	// SellIn becomes -1, concert passed
	if i.Quality != 0 {
		t.Errorf("expected quality 0 after concert, got %d", i.Quality)
	}
}

func TestBackstage_qualityStaysZero_wellAfterConcert(t *testing.T) {
	i := applyUpdate(Backstage{}, -5, 0)
	if i.Quality != 0 {
		t.Errorf("expected quality 0, got %d", i.Quality)
	}
}

func TestBackstage_qualityCapsAt50(t *testing.T) {
	i := applyUpdate(Backstage{}, 5, 49)
	if i.Quality != 50 {
		t.Errorf("expected quality 50 (capped), got %d", i.Quality)
	}
}

func TestBackstage_fullLifecycle(t *testing.T) {
	itm := item.Item{Name: "Concert", Category: "Backstage Passes", SellIn: 12, Quality: 10}
	u := Backstage{}

	// Day 1: SellIn=11, +1 -> 11
	u.Update(&itm)
	if itm.Quality != 11 {
		t.Errorf("day 1: expected 11, got %d", itm.Quality)
	}

	// Day 2: SellIn=10, +1 -> 12
	u.Update(&itm)
	if itm.Quality != 12 {
		t.Errorf("day 2: expected 12, got %d", itm.Quality)
	}

	// Day 3: SellIn=9, +2 -> 14
	u.Update(&itm)
	if itm.Quality != 14 {
		t.Errorf("day 3: expected 14, got %d", itm.Quality)
	}
}

// ============================================================
// Conjured items
// ============================================================

func TestConjured_degradesTwiceAsNormal(t *testing.T) {
	i := applyUpdate(Conjured{}, 10, 20)
	if i.Quality != 18 {
		t.Errorf("expected quality 18 (2x normal), got %d", i.Quality)
	}
}

func TestConjured_degradesFourTimesAfterSellBy(t *testing.T) {
	i := applyUpdate(Conjured{}, 0, 20)
	if i.Quality != 16 {
		t.Errorf("expected quality 16 (4x after sell-by), got %d", i.Quality)
	}
}

func TestConjured_qualityNeverNegative(t *testing.T) {
	i := applyUpdate(Conjured{}, 10, 1)
	if i.Quality != 0 {
		t.Errorf("expected quality 0 (clamped), got %d", i.Quality)
	}
}

func TestConjured_qualityNeverNegativeAfterSellBy(t *testing.T) {
	i := applyUpdate(Conjured{}, 0, 3)
	if i.Quality != 0 {
		t.Errorf("expected quality 0 (clamped), got %d", i.Quality)
	}
}

func TestConjured_sellInDecreases(t *testing.T) {
	i := applyUpdate(Conjured{}, 10, 20)
	if i.SellIn != 9 {
		t.Errorf("expected sellIn 9, got %d", i.SellIn)
	}
}

// ============================================================
// Registry
// ============================================================

func TestRegistry_returnsNormalForUnknownCategory(t *testing.T) {
	reg := NewRegistry()
	u := reg.Get("Random Sword", "Weapon")
	if _, ok := u.(Normal); !ok {
		t.Error("expected Normal updater for unknown category")
	}
}

func TestRegistry_returnsSulfurasForSulfurasCategory(t *testing.T) {
	reg := NewRegistry()
	u := reg.Get("Hand of Ragnaros", "Sulfuras")
	if _, ok := u.(Sulfuras); !ok {
		t.Error("expected Sulfuras updater")
	}
}

func TestRegistry_returnsBackstageForBackstageCategory(t *testing.T) {
	reg := NewRegistry()
	u := reg.Get("Raging Ogre", "Backstage Passes")
	if _, ok := u.(Backstage); !ok {
		t.Error("expected Backstage updater")
	}
}

func TestRegistry_returnsConjuredForConjuredCategory(t *testing.T) {
	reg := NewRegistry()
	u := reg.Get("Giant Slayer", "Conjured")
	if _, ok := u.(Conjured); !ok {
		t.Error("expected Conjured updater")
	}
}

func TestRegistry_returnsAgedForAgedBrieByName(t *testing.T) {
	reg := NewRegistry()
	u := reg.Get("Aged Brie", "Food")
	if _, ok := u.(Aged); !ok {
		t.Error("expected Aged updater for Aged Brie")
	}
}

func TestRegistry_nameTakesPriorityOverCategory(t *testing.T) {
	reg := NewRegistry()
	// Aged Brie is in category "Food" which would normally be Normal,
	// but the name override selects Aged.
	u := reg.Get("Aged Brie", "Food")
	if _, ok := u.(Aged); !ok {
		t.Error("expected name-based Aged updater to take priority over category")
	}
}

// ============================================================
// clampQuality
// ============================================================

func TestClampQuality_withinRange(t *testing.T) {
	if clampQuality(25) != 25 {
		t.Error("expected 25")
	}
}

func TestClampQuality_belowZero(t *testing.T) {
	if clampQuality(-5) != 0 {
		t.Error("expected 0")
	}
}

func TestClampQuality_aboveMax(t *testing.T) {
	if clampQuality(55) != 50 {
		t.Error("expected 50")
	}
}

func TestClampQuality_atBoundaries(t *testing.T) {
	if clampQuality(0) != 0 {
		t.Error("expected 0")
	}
	if clampQuality(50) != 50 {
		t.Error("expected 50")
	}
}
