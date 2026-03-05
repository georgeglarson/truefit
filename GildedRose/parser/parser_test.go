package parser

import (
	"strings"
	"testing"
)

func TestParse_validInput(t *testing.T) {
	input := "Sword,Weapon,30,50\nAxe,Weapon,40,50\n"
	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
	if items[0].Name != "Sword" {
		t.Errorf("expected name 'Sword', got %q", items[0].Name)
	}
	if items[0].Category != "Weapon" {
		t.Errorf("expected category 'Weapon', got %q", items[0].Category)
	}
	if items[0].SellIn != 30 {
		t.Errorf("expected SellIn 30, got %d", items[0].SellIn)
	}
	if items[0].Quality != 50 {
		t.Errorf("expected Quality 50, got %d", items[0].Quality)
	}
}

func TestParse_skipsBlankLines(t *testing.T) {
	input := "Sword,Weapon,30,50\n\nAxe,Weapon,40,50\n"
	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
}

func TestParse_trimWhitespace(t *testing.T) {
	input := "  Sword , Weapon , 30 , 50  \n"
	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if items[0].Name != "Sword" {
		t.Errorf("expected trimmed name 'Sword', got %q", items[0].Name)
	}
}

func TestParse_emptyInput(t *testing.T) {
	items, err := Parse(strings.NewReader(""))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("expected 0 items, got %d", len(items))
	}
}

func TestParse_invalidFieldCount(t *testing.T) {
	input := "Sword,Weapon,30\n"
	_, err := Parse(strings.NewReader(input))
	if err == nil {
		t.Fatal("expected error for wrong field count")
	}
}

func TestParse_invalidSellIn(t *testing.T) {
	input := "Sword,Weapon,abc,50\n"
	_, err := Parse(strings.NewReader(input))
	if err == nil {
		t.Fatal("expected error for invalid SellIn")
	}
}

func TestParse_invalidQuality(t *testing.T) {
	input := "Sword,Weapon,30,abc\n"
	_, err := Parse(strings.NewReader(input))
	if err == nil {
		t.Fatal("expected error for invalid Quality")
	}
}

func TestParse_errorIncludesLineNumber(t *testing.T) {
	input := "Sword,Weapon,30,50\nBad Line\n"
	_, err := Parse(strings.NewReader(input))
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "line 2") {
		t.Errorf("expected error to mention line 2, got: %v", err)
	}
}

func TestParse_negativeValues(t *testing.T) {
	input := "Expired,Food,-5,10\n"
	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if items[0].SellIn != -5 {
		t.Errorf("expected SellIn -5, got %d", items[0].SellIn)
	}
}

func TestParse_nameWithSpecialChars(t *testing.T) {
	input := "+5 Dexterity Vest,Armor,10,20\n"
	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if items[0].Name != "+5 Dexterity Vest" {
		t.Errorf("expected name '+5 Dexterity Vest', got %q", items[0].Name)
	}
}

func TestParse_fullInventoryFile(t *testing.T) {
	input := `Sword,Weapon,30,50
Axe,Weapon,40,50
Halberd,Weapon,60,40
Aged Brie,Food,50,10
Aged Milk,Food,20,20
Mutton,Food,10,10
Hand of Ragnaros,Sulfuras,80,80
I am Murloc,Backstage Passes,20,10
Raging Ogre,Backstage Passes,10,10
Giant Slayer,Conjured,15,50
Storm Hammer,Conjured,20,50
Belt of Giant Strength,Conjured,20,40
Cheese,Food,5,5
Potion of Healing,Potion,10,10
Bag of Holding,Misc,10,50
TAFKAL80ETC Concert,Backstage Passes,15,20
Elixir of the Mongoose,Potion,5,7
+5 Dexterity Vest,Armor,10,20
Full Plate Mail,Armor,50,50
Wooden Shield,Armor,10,30`

	items, err := Parse(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(items) != 20 {
		t.Fatalf("expected 20 items, got %d", len(items))
	}
}
