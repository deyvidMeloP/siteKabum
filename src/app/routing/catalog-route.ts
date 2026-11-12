import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { FilterRouteContext } from '../services/product-filter-state.service';

export function resolveCatalogName(value: string, names: readonly string[]): string {
  if (names.includes(value)) { return value; }
  try {
    const legacy = decodeURIComponent(value);
    return names.includes(legacy) ? legacy : value;
  } catch {
    return value;
  }
}

export function resolveFilterRouteContext(context: FilterRouteContext, sections: any[], subsections: any[]): FilterRouteContext {
  const filterName = resolveCatalogName(context.filterName, sections.map(item => item.name));
  const section = sections.find(item => item.name === filterName);
  if (!section) {
    const key = context.parentName ? 'parentName' : context.subsectionName ? 'subsectionName' : 'filterName';
    const name = resolveCatalogName(context[key], [...sections, ...subsections].map(item => item.name));
    const matches = subsections.filter(item => item.name === name);
    if (matches.length === 1) {
      const leaf = matches[0];
      const parent = leaf.parentId ? subsections.find(item => item.id === leaf.parentId && !item.parentId) : undefined;
      const ancestor = sections.find(item => item.id === (parent ?? leaf).scId);
      if (ancestor && (!leaf.parentId || parent)) {
        return { filterName: ancestor.name, subsectionName: (parent ?? leaf).name, parentName: parent ? leaf.name : '' };
      }
    }
    return { ...context, [key]: name };
  }
  const children = subsections.filter(item => item.scId === section.id && !item.parentId);
  const subsectionName = resolveCatalogName(context.subsectionName, children.map(item => item.name));
  const subsection = children.find(item => item.name === subsectionName);
  const grandchildren = subsection ? subsections.filter(item => item.parentId === subsection.id) : [];
  const parentName = resolveCatalogName(context.parentName, grandchildren.map(item => item.name));
  return { filterName, subsectionName, parentName };
}

function repairMalformedEscapes(value: string): string {
  return value.replace(/(?:%[0-9a-f]{2})+|%/gi, encoded => {
    const bytes = encoded.match(/%[0-9a-f]{2}|%/gi)!;
    let repaired = '';
    for (let index = 0; index < bytes.length;) {
      const byte = parseInt(bytes[index].slice(1), 16);
      const length = byte >= 0xc2 && byte <= 0xdf ? 2 : byte >= 0xe0 && byte <= 0xef ? 3 : byte >= 0xf0 && byte <= 0xf4 ? 4 : 1;
      const candidate = bytes.slice(index, index + length).join('');
      try {
        decodeURIComponent(candidate);
        repaired += candidate;
        index += length;
      } catch {
        repaired += bytes[index].replace('%', '%25');
        index++;
      }
    }
    return repaired;
  });
}

export class CatalogUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    if (!/^\/?(?:Filter|Product)(?:\/|$)/.test(url)) { return super.parse(url); }
    const boundary = url.search(/[?#]/);
    const pathname = boundary < 0 ? url : url.slice(0, boundary);
    const suffix = boundary < 0 ? '' : url.slice(boundary);
    const repaired = repairMalformedEscapes(pathname);
    return super.parse(repaired + suffix);
  }
}
