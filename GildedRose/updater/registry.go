package updater

// Registry maps item categories (or names) to their Updater strategy.
// New special-case items are added here — one line, no other code changes.
type Registry struct {
	byCategory map[string]Updater
	byName     map[string]Updater
	fallback   Updater
}

// NewRegistry creates the default registry with all known item rules.
func NewRegistry() *Registry {
	return &Registry{
		byCategory: map[string]Updater{
			"Sulfuras":         Sulfuras{},
			"Backstage Passes": Backstage{},
			"Conjured":         Conjured{},
		},
		byName: map[string]Updater{
			"Aged Brie": Aged{},
			"Aged Milk": Aged{},
		},
		fallback: Normal{},
	}
}

// Get returns the appropriate Updater for an item.
// Name-based rules take priority over category-based rules.
func (r *Registry) Get(name, category string) Updater {
	if u, ok := r.byName[name]; ok {
		return u
	}
	if u, ok := r.byCategory[category]; ok {
		return u
	}
	return r.fallback
}
