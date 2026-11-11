import { Injectable } from '@angular/core';

export interface FilterRouteContext {
  filterName: string;
  subsectionName: string;
  parentName: string;
}

export interface ProductFilterSnapshot {
  context: FilterRouteContext;
  categoryIds: number[];
  minimumPrice: number;
  maximumPrice: number;
}

export function filterContextKey(context: FilterRouteContext): string {
  return JSON.stringify(['Filter', context.filterName, context.subsectionName, context.parentName]);
}

@Injectable({ providedIn: 'root' })
export class ProductFilterStateService {
  private readonly snapshots = new Map<string, ProductFilterSnapshot>();

  get(context: FilterRouteContext): ProductFilterSnapshot | undefined {
    const snapshot = this.snapshots.get(filterContextKey(context));
    return snapshot ? this.copy(snapshot) : undefined;
  }

  set(snapshot: ProductFilterSnapshot): void {
    this.snapshots.set(filterContextKey(snapshot.context), this.copy(snapshot));
  }

  clear(context: FilterRouteContext): void {
    this.snapshots.delete(filterContextKey(context));
  }

  private copy(snapshot: ProductFilterSnapshot): ProductFilterSnapshot {
    return { ...snapshot, context: { ...snapshot.context }, categoryIds: [...snapshot.categoryIds] };
  }
}
