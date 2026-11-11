export interface FilterCategory {
  id: number;
  name: string;
  parentId: number;
  scId?: number;
  sbcId?: number;
  selected?: boolean;
}

export interface FilterGroup extends FilterCategory {
  children: FilterCategory[];
}

export function indexFilterCategories(categories: FilterCategory[]) {
  const byId = new Map<number, FilterCategory>();
  const issues = new Set<string>();
  const conflicts = new Set<number>();
  for (const category of categories) {
    if (!category || !Number.isInteger(category.id) || category.id <= 0 ||
        (category.parentId != null && (!Number.isInteger(category.parentId) || category.parentId < 0))) {
      issues.add('Categoria com identificador inválido.');
      continue;
    }
    const existing = byId.get(category.id);
    if (existing && ['name', 'parentId', 'scId', 'sbcId'].some(key =>
      (existing as any)[key] !== (category as any)[key])) {
      conflicts.add(category.id);
      issues.add('Categoria com ID conflitante: ' + category.id);
    }
    if (!existing) { byId.set(category.id, category); }
  }
  conflicts.forEach(id => byId.delete(id));
  const valid = new Map<number, boolean>();
  function hasValidParent(id: number, visiting = new Set<number>()): boolean {
    if (valid.has(id)) { return valid.get(id)!; }
    const category = byId.get(id);
    if (!category || visiting.has(id)) { return false; }
    visiting.add(id);
    const accepted = !category.parentId || hasValidParent(category.parentId, visiting);
    visiting.delete(id);
    valid.set(id, accepted);
    return accepted;
  }
  for (const category of byId.values()) {
    if (!hasValidParent(category.id)) { issues.add('Categoria com pai ausente ou cíclico: ' + category.id); }
  }
  for (const [id, accepted] of valid) { if (!accepted) { byId.delete(id); } }
  return { byId, issues: [...issues] };
}

export function groupFilterCategories(categories: FilterCategory[]) {
  const { byId, issues } = indexFilterCategories(categories);
  const groups: Record<string, FilterGroup> = {};
  for (const category of byId.values()) {
    if (!category.parentId) { groups[category.id] = { ...category, children: [] }; }
  }
  for (const category of byId.values()) {
    if (!category.parentId) { continue; }
    const parent = byId.get(category.parentId)!;
    groups[parent.id] ??= { ...parent, children: [] };
    groups[parent.id].children.push(category);
  }
  return { groups, issues };
}

export function filterCatalogByCategories(
  products: any[], categories: FilterCategory[], associations: any[], selectedIds: number[]
) {
  const { byId, issues } = indexFilterCategories(categories);
  const selected = new Map<number, Set<number>>();
  const selectedSet = new Set(selectedIds);
  let invalidSelection = false;
  for (const id of selectedSet) {
    const category = byId.get(id);
    if (!category?.parentId) {
      issues.push('Seleção de categoria inválida: ' + id);
      invalidSelection = true;
      continue;
    }
    if (!selected.has(category.parentId)) { selected.set(category.parentId, new Set()); }
    selected.get(category.parentId)!.add(id);
  }
  const productsById = new Map(products.map(product => [product.idProduct, product]));
  const categoriesByProduct = new Map<number, Set<number>>();
  const links: any[] = [];
  for (const link of associations) {
    if (!link || !byId.has(link.ctId)) {
      issues.push('Vínculo com categoria inexistente ou inválida.');
      continue;
    }
    if (!Number.isInteger(link.idProduct) || link.idProduct <= 0) {
      issues.push('Vínculo com identificador de produto inválido.');
      continue;
    }
    if (!productsById.has(link.idProduct)) { continue; }
    if (!categoriesByProduct.has(link.idProduct)) { categoriesByProduct.set(link.idProduct, new Set()); }
    const assigned = categoriesByProduct.get(link.idProduct)!;
    if (assigned.has(link.ctId)) { continue; }
    assigned.add(link.ctId);
    if (selectedSet.has(link.ctId)) { links.push(link); }
  }
  const matching = [...productsById.values()].filter(product => {
    if (invalidSelection) { return false; }
    const assigned = categoriesByProduct.get(product.idProduct);
    return [...selected.values()].every(ids => [...ids].some(id => assigned?.has(id)));
  });
  return { products: matching, links, groupNames: [...selected.keys()].map(id => byId.get(id)!.name), issues: [...new Set(issues)] };
}
