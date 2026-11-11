import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { BehaviorSubject } from 'rxjs';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { KabumServiceService } from './services/kabum-service.service';
import { FilterRouteContext, ProductFilterSnapshot, ProductFilterStateService, filterContextKey } from './services/product-filter-state.service';

@Component({ template: '' })
class LoadingProductPageComponent {}

describe('Snapshots em memória do ProductFilter', () => {
  let fixture: ComponentFixture<ProductFilterComponent>;
  let component: ProductFilterComponent;
  let http: HttpTestingController;
  let params: BehaviorSubject<Params>;
  let service: KabumServiceService;
  let data: Record<string, any[]>;
  let carousel: jasmine.Spy;
  const endpoints = ['products', 'productCategory', 'section', 'subsection', 'categories'];

  beforeEach(async () => {
    params = new BehaviorSubject<Params>({ filterName: 'A' });
    spyOn(console, 'warn');
    carousel = spyOn(window as any, 'swiper_Filter').and.stub();
    await TestBed.configureTestingModule({
      declarations: [ProductFilterComponent, LoadingProductPageComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSliderModule, HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: 'Product/:productName', component: LoadingProductPageComponent }])],
      providers: [KabumServiceService, { provide: ActivatedRoute, useFactory: (router: Router) => ({ snapshot: router.routerState.root.snapshot, params: params.asObservable() }), deps: [Router] }]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(KabumServiceService);
    fixture = TestBed.createComponent(ProductFilterComponent);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    data = {
      products: [
        { idProduct: 1, name_Product: 'AMD Gaming', scId: 10, sbcId: 15, price: 100, discount: 0 },
        { idProduct: 2, name_Product: 'Intel Office', scId: 10, sbcId: 15, price: 200, discount: 0 },
        { idProduct: 3, name_Product: 'AMD Office', scId: 10, sbcId: 15, price: 300, discount: 0 },
        { idProduct: 4, name_Product: 'Intel Gaming', scId: 10, sbcId: 15, price: 400, discount: 0 },
        { idProduct: 5, name_Product: 'Outra seção', scId: 20, sbcId: 25, price: 500, discount: 0 }
      ],
      productCategory: [
        { idProduct: 1, ctId: 17 }, { idProduct: 1, ctId: 17 }, { idProduct: 1, ctId: 220 },
        { idProduct: 2, ctId: 42 }, { idProduct: 2, ctId: 333 },
        { idProduct: 3, ctId: 17 }, { idProduct: 3, ctId: 333 },
        { idProduct: 4, ctId: 42 }, { idProduct: 4, ctId: 220 },
        { idProduct: 5, ctId: 501 }
      ],
      section: [{ id: 10, name: 'A' }, { id: 20, name: 'B' }],
      subsection: [{ id: 15, name: 'A_SUB', scId: 10, parentId: 0 }],
      categories: [
        { id: 17, name: 'AMD', parentId: 3, scId: 10 },
        { id: 333, name: 'Office', parentId: 105, scId: 10 },
        { id: 42, name: 'Intel', parentId: 3, scId: 10 },
        { id: 220, name: 'Gaming', parentId: 105, scId: 10 },
        { id: 444, name: 'Sem produtos', parentId: 105, scId: 10 },
        { id: 105, name: 'Uso', parentId: 0, scId: 10 },
        { id: 3, name: 'Marca', parentId: 0, scId: 10 },
        { id: 501, name: 'B filho', parentId: 500, scId: 20 },
        { id: 500, name: 'Marca', parentId: 0, scId: 20 }
      ]
    };
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
    params.complete();
  });

  function test(body: () => void): () => void {
    return fakeAsync(() => { try { body(); } finally { fixture.destroy(); } });
  }
  function start(): Record<string, TestRequest> {
    fixture.detectChanges();
    return requests();
  }
  function requests(): Record<string, TestRequest> {
    const found = http.match(request => request.method === 'GET' && endpoints.some(e => request.url.endsWith('/' + e)));
    expect(found.length).toBe(5);
    return Object.fromEntries(found.map(request => [request.request.url.split('/').pop()!, request]));
  }
  function respond(pending: Record<string, TestRequest>, order = endpoints): void {
    for (const endpoint of order) { pending[endpoint].flush(JSON.parse(JSON.stringify(data[endpoint]))); }
  }
  function render(): void { fixture.detectChanges(); tick(); fixture.detectChanges(); }
  function ids(): number[] { return component.filterProduct.map(p => p.idProduct); }
  function names(): string[] { return Array.from(fixture.nativeElement.querySelectorAll('.product_Name')).map((e: any) => e.textContent.trim()); }
  function checkCatalog(expectedIds: number[], expectedNames: string[], group: string, children: string[]): void {
    render();
    expect(component.testa).toBe(0);
    expect(ids()).toEqual(expectedIds);
    expect(names()).toEqual(expectedNames);
    const groups = Object.values(component.categoriesGrouped) as any[];
    expect(groups.map(g => g.name)).toEqual([group]);
    expect(groups.flatMap(g => g.children.map((child: any) => child.name))).toEqual(children);
    expect(fixture.nativeElement.querySelector('.categories_Filter').textContent).toContain(group);
    for (const child of children) { expect(fixture.nativeElement.querySelector('.categories_Filter').textContent).toContain(child); }
  }



  const contextA: FilterRouteContext = { filterName: 'A', subsectionName: '', parentName: '' };
  const contextB: FilterRouteContext = { filterName: 'B', subsectionName: '', parentName: '' };
  function store(): ProductFilterStateService { return TestBed.inject(ProductFilterStateService); }
  function load(): void { respond(start()); render(); }
  function select(id: number): void { (fixture.nativeElement.querySelector('#desktop-category-' + id) as HTMLInputElement).click(); render(); }
  function snapshot(context = contextA, categoryIds = [17], minimumPrice = 150.25, maximumPrice = 350.75): ProductFilterSnapshot {
    return { context: { ...context }, categoryIds, minimumPrice, maximumPrice };
  }
  function recreate(next = { filterName: 'A' } as Params): Record<string, TestRequest> {
    fixture.destroy(); params.next(next); fixture = TestBed.createComponent(ProductFilterComponent);
    component = fixture.componentInstance; document.body.appendChild(fixture.nativeElement); return start();
  }
  function back(): void { respond(recreate()); render(); }
  function range(minimum: number, maximum: number): void {
    component.value = minimum; component.highValue = maximum; component.filterAll(1, 0, null); render();
  }
  function expectState(selected: number[], minimum: number, maximum: number, expectedIds: number[]): void {
    expect(component.auxFilter).toEqual(selected); expect(component.value).toBe(minimum); expect(component.highValue).toBe(maximum);
    expect(ids()).toEqual(expectedIds); expect(names()).toEqual(expectedIds.map(id => data['products'].find(p => p.idProduct === id).name_Product));
    const checked = Array.from(fixture.nativeElement.querySelectorAll('input[type=checkbox]:checked')) as HTMLInputElement[];
    expect(checked.map(e => e.id).sort()).toEqual(selected.flatMap(id => ['desktop-category-' + id, 'mobile-category-' + id]).sort());
    const fields = Array.from(fixture.nativeElement.querySelectorAll('input[type=number]')) as HTMLInputElement[];
    expect(fields.map(e => Number(e.value))).toEqual([minimum, maximum]);
    expect(Number(fixture.nativeElement.querySelector('.ngx-slider-pointer-min').getAttribute('aria-valuenow'))).toBe(minimum);
    expect(Number(fixture.nativeElement.querySelector('.ngx-slider-pointer-max').getAttribute('aria-valuenow'))).toBe(maximum);
  }

  it('preserva uma categoria ao recriar o componente depois do produto', test(() => {
    load(); select(17); back(); expectState([17], 100, 400, [1, 3]);
  }));
  it('preserva seleções em grupos diferentes com E', test(() => {
    load(); select(17); select(333); back(); expectState([17, 333], 100, 400, [3]);
  }));
  it('preserva seleções do mesmo grupo com OU', test(() => {
    load(); select(17); select(42); back(); expectState([17, 42], 100, 400, [1, 2, 3, 4]);
  }));
  it('preserva preços decimais sem arredondar centavos', test(() => {
    load(); range(150.25, 350.75); back(); expectState([], 150.25, 350.75, [2, 3]);
  }));
  it('preserva a combinação de categorias com preços', test(() => {
    load(); select(17); range(150.25, 350.75); back(); expectState([17], 150.25, 350.75, [3]);
  }));
  it('restaura de forma estável em recriações consecutivas', test(() => {
    load(); select(17); range(150.25, 350.75); back(); back(); expectState([17], 150.25, 350.75, [3]);
  }));
  it('inicia uma seção nova sem herdar seleções de A', test(() => {
    load(); select(17); params.next({ filterName: 'B' }); respond(requests()); render(); expectState([], 500, 500, [5]);
  }));
  it('restaura snapshots próprios ao alternar A → B → A → B', test(() => {
    load(); select(17); range(150.25, 350.75); params.next({ filterName: 'B' }); respond(requests()); render(); select(501);
    params.next({ filterName: 'A' }); respond(requests()); render(); expectState([17], 150.25, 350.75, [3]);
    params.next({ filterName: 'B' }); respond(requests()); render(); expectState([501], 500, 500, [5]);
  }));
  it('LIMPAR FILTROS remove o snapshot antes de sair e retornar', test(() => {
    load(); select(17); range(150.25, 350.75); component.clearFilters(); render(); expect(store().get(contextA)).toBeUndefined();
    back(); expectState([], 100, 400, [1, 2, 3, 4]);
  }));
  it('limpar A não remove o snapshot de B', test(() => {
    store().set(snapshot(contextB, [501], 500, 500)); load(); select(17); component.clearFilters();
    expect(store().get(contextA)).toBeUndefined(); expect(store().get(contextB)?.categoryIds).toEqual([501]);
  }));
  it('retornar aos critérios padrão remove um snapshot desnecessário', test(() => {
    load(); select(17); select(17); expect(store().get(contextA)).toBeUndefined();
  }));
  it('descarta somente categorias removidas e mantém as demais', test(() => {
    store().set(snapshot(contextA, [17, 42], 100, 400)); data['categories'] = data['categories'].filter(c => c.id !== 17);
    load(); expectState([42], 100, 400, [2, 4]); expect(store().get(contextA)?.categoryIds).toEqual([42]);
  }));
  it('descarta seleções de categorias de outra seção', test(() => {
    store().set(snapshot(contextA, [17, 501, 9999, 17], 100, 400)); load(); expectState([17], 100, 400, [1, 3]);
  }));
  it('descarta uma categoria que passou a ter pai ausente', test(() => {
    store().set(snapshot(contextA, [17, 42], 100, 400)); data['categories'].find(c => c.id === 17).parentId = 999;
    load(); expectState([42], 100, 400, [2, 4]);
  }));
  it('descarta uma categoria com ID conflitante sem descartar as válidas', test(() => {
    store().set(snapshot(contextA, [17, 42], 100, 400)); data['categories'].push({ id: 17, name: 'Conflito', parentId: 105, scId: 10 });
    load(); expectState([42], 100, 400, [2, 4]);
  }));
  it('normaliza os preços quando os limites do catálogo mudam', test(() => {
    store().set(snapshot(contextA, [], 150.25, 400)); const prices = [175.25, 225.5, 325.75, 375.9];
    data['products'].filter(p => p.scId === 10).forEach((p, i) => p.price = prices[i]);
    load(); expectState([], 175.25, 375.9, [1, 2, 3, 4]);
  }));
  it('normaliza um intervalo totalmente fora do novo catálogo', test(() => {
    store().set(snapshot(contextA, [], 900, 1000)); load(); expectState([], 400, 400, [4]);
  }));
  it('normaliza um intervalo invertido sem perder centavos', test(() => {
    store().set(snapshot(contextA, [], 350.75, 150.25)); load(); expectState([], 150.25, 350.75, [2, 3]);
  }));
  it('normaliza preços não finitos para os limites padrão', test(() => {
    store().set(snapshot(contextA, [17], NaN, Infinity)); load(); expectState([17], 100, 400, [1, 3]);
  }));
  it('não publica seleções antes de receber o conjunto HTTP completo', test(() => {
    store().set(snapshot()); const pending = start(); for (const endpoint of endpoints.slice(0, -1)) { pending[endpoint].flush(data[endpoint]); render(); }
    expect(component.auxFilter).toEqual([]); expect(ids()).toEqual([]); expect(component.testa).toBe(1);
    expect(store().get(contextA)).toEqual(snapshot()); pending['categories'].flush(data['categories']); render();
    expectState([17], 150.25, 350.75, [3]);
  }));
  it('restaura com respostas HTTP fora de ordem', test(() => {
    store().set(snapshot()); respond(start(), [...endpoints].reverse()); render(); expectState([17], 150.25, 350.75, [3]);
  }));
  it('aplica a filtragem uma única vez ao restaurar', test(() => {
    store().set(snapshot()); const apply = spyOn(component as any, 'applyCatalogFilters').and.callThrough(); load(); expect(apply).toHaveBeenCalledTimes(1);
  }));
  it('não repete a restauração em callbacks de renderização', test(() => {
    store().set(snapshot()); const restore = spyOn(component as any, 'restoreFilters').and.callThrough(); load(); render(); tick(2000); render();
    expect(restore).toHaveBeenCalledTimes(1); expectState([17], 150.25, 350.75, [3]);
  }));
  it('não sobrescreve o snapshot quando uma consulta falha', test(() => {
    store().set(snapshot()); const pending = start(); pending['section'].flush({}, { status: 500, statusText: 'Simulado' }); render();
    expect(component.loadError).not.toBe(''); expect(store().get(contextA)).toEqual(snapshot());
  }));
  it('recupera o snapshot depois de erro e de uma nova navegação', test(() => {
    store().set(snapshot()); const pending = start(); pending['products'].error(new ProgressEvent('error')); render();
    params.next({ filterName: 'B' }); respond(requests()); render(); params.next({ filterName: 'A' }); respond(requests()); render();
    expectState([17], 150.25, 350.75, [3]);
  }));
  it('mantém o snapshot ao destruir com consultas pendentes', test(() => {
    store().set(snapshot()); const pending = start(); fixture.destroy(); endpoints.forEach(e => expect(pending[e].cancelled).toBeTrue());
    expect(store().get(contextA)).toEqual(snapshot()); back(); expectState([17], 150.25, 350.75, [3]);
  }));
  it('uma resposta obsoleta de A não restaura seleções sobre B', test(() => {
    store().set(snapshot()); store().set(snapshot(contextB, [501], 500, 500)); const a = start();
    params.next({ filterName: 'B' }); respond(requests()); render(); endpoints.forEach(e => expect(a[e].cancelled).toBeTrue());
    expectState([501], 500, 500, [5]); expect(store().get(contextA)).toEqual(snapshot());
  }));
  it('preserva A durante a navegação rápida A → B → A', test(() => {
    load(); select(17); range(150.25, 350.75); params.next({ filterName: 'B' }); const b = requests();
    params.next({ filterName: 'A' }); respond(requests()); render(); endpoints.forEach(e => expect(b[e].cancelled).toBeTrue());
    expectState([17], 150.25, 350.75, [3]);
  }));
  it('não salva um catálogo vazio quando o contexto não foi encontrado', test(() => {
    store().set(snapshot()); data['section'] = []; load(); expect(ids()).toEqual([]); expect(store().get(contextA)).toEqual(snapshot());
  }));
  it('mantém os controles restaurados pristine e untouched', test(() => {
    store().set(snapshot()); load(); expect(component.minPriceControl.pristine).toBeTrue(); expect(component.maxPriceControl.untouched).toBeTrue();
  }));
  it('mantém snapshots independentes para nomes finais iguais em seções diferentes', test(() => {
    data['subsection'] = [{ id: 15, name: 'Comum', scId: 10, parentId: 0 }, { id: 25, name: 'Comum', scId: 20, parentId: 0 }];
    data['categories'].forEach(c => { c.sbcId = c.scId === 10 ? 15 : 25; c.scId = 0; });
    start(); params.next({ filterName: 'A', subsectionName: 'Comum' }); respond(requests()); render(); select(17); range(150.25, 350.75);
    params.next({ filterName: 'B', subsectionName: 'Comum' }); respond(requests()); render(); expectState([], 500, 500, [5]); select(501);
    params.next({ filterName: 'A', subsectionName: 'Comum' }); respond(requests()); render(); expectState([17], 150.25, 350.75, [3]);
  }));
  it('diferencia hierarquias completas com o mesmo nome no terceiro nível', test(() => {
    data['subsection'] = [{ id: 15, name: 'Comum', scId: 10, parentId: 0 }, { id: 25, name: 'Comum', scId: 20, parentId: 0 }, { id: 16, name: 'Filho', scId: 0, parentId: 15 }, { id: 26, name: 'Filho', scId: 0, parentId: 25 }];
    data['products'].forEach(p => p.sbcId = p.scId === 10 ? 16 : 26);
    data['categories'].forEach(c => { c.sbcId = c.scId === 10 ? 16 : 26; c.scId = 0; });
    start(); params.next({ filterName: 'A', subsectionName: 'Comum', parentName: 'Filho' }); respond(requests()); render(); select(17);
    params.next({ filterName: 'B', subsectionName: 'Comum', parentName: 'Filho' }); respond(requests()); render(); expectState([], 500, 500, [5]);
    params.next({ filterName: 'A', subsectionName: 'Comum', parentName: 'Filho' }); respond(requests()); render(); expectState([17], 100, 400, [1, 3]);
  }));
  it('a chave distingue níveis e nomes com separadores', test(() => {
    expect(filterContextKey({ filterName: 'A/B', subsectionName: 'C', parentName: '' })).not.toBe(filterContextKey({ filterName: 'A', subsectionName: 'B/C', parentName: '' }));
    expect(filterContextKey({ filterName: 'Comum', subsectionName: '', parentName: '' })).not.toBe(filterContextKey({ filterName: 'A', subsectionName: 'Comum', parentName: '' }));
  }));
  it('o serviço armazena somente contexto, IDs e preços', test(() => {
    load(); select(17); expect(Object.keys(store().get(contextA)!).sort()).toEqual(['categoryIds', 'context', 'maximumPrice', 'minimumPrice']);
  }));
  it('não compartilha referências mutáveis com quem grava ou lê snapshots', test(() => {
    const value = snapshot(); store().set(value); value.categoryIds.push(42); value.context.filterName = 'Modificado';
    const copy = store().get(contextA)!; expect(copy.categoryIds).toEqual([17]); copy.categoryIds.push(333); copy.context.filterName = 'Outro';
    expect(store().get(contextA)?.categoryIds).toEqual([17]);
  }));
  it('uma nova aplicação inicia com um serviço sem snapshots', test(() => {
    load(); select(17); expect(new ProductFilterStateService().get(contextA)).toBeUndefined();
  }));
  it('não grava snapshots em localStorage', test(() => {
    const write = spyOn(Storage.prototype, 'setItem'); load(); select(17); range(150.25, 350.75); expect(write).not.toHaveBeenCalled();
  }));
  it('restaura sem modificar produtos, categorias e vínculos HTTP', test(() => {
    store().set(snapshot()); load(); const original = JSON.stringify([component.products, component.categories, component.productCategory]);
    select(42); component.clearFilters(); render(); expect(JSON.stringify([component.products, component.categories, component.productCategory])).toBe(original);
  }));
  it('mantém preços e slider restaurados ao alternar os painéis desktop e mobile', test(() => {
    store().set(snapshot()); load(); component.clickMobileFilter(); render(); expectState([17], 150.25, 350.75, [3]);
    component.closeAp(); render(); expectState([17], 150.25, 350.75, [3]);
  }));

  it('descarta IDs conflitantes em outra seção sem perder as seleções válidas', test(() => {
    store().set(snapshot(contextA, [17, 42], 100, 400));
    data['categories'].push({ id: 17, name: 'Conflito em B', parentId: 500, scId: 20 });
    load(); expectState([42], 100, 400, [2, 4]); expect(store().get(contextA)?.categoryIds).toEqual([42]);
  }));

});
