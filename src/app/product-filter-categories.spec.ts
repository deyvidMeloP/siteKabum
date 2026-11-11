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

@Component({ template: '' })
class LoadingProductPageComponent {}

describe('Relacionamentos e hierarquia do ProductFilter', () => {
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


  function load(): void { respond(start()); render(); }
  function select(id: number, panel = 'desktop'): void {
    (fixture.nativeElement.querySelector('#' + panel + '-category-' + id) as HTMLInputElement).click(); render();
  }
  function groups(): Record<string, number[]> {
    return Object.fromEntries(Object.entries(component.categoriesGrouped).map(([id, group]) => [id, group.children.map((child: any) => child.id).sort((a: number, b: number) => a - b)]));
  }
  function expectGroups(): void {
    expect(groups()).toEqual({ 3: [17, 42], 105: [220, 333, 444] });
    expect(Object.values(component.categoriesGrouped).map(group => group.name)).toEqual(['Marca', 'Uso']);
    expect(fixture.nativeElement.querySelectorAll('.categories_Filter .categories_Box input[type=checkbox]:not(:disabled)').length).toBe(5);
  }

  it('usa os IDs esparsos 3, 17, 42 e 105 sem consultar posições', test(() => {
    load(); expectGroups(); select(17); expect(ids()).toEqual([1, 3]); select(333); expect(ids()).toEqual([3]);
  }));

  for (const order of ['original', 'reverse', 'numeric', 'children-first', 'parents-first']) {
    it('preserva a hierarquia e os resultados na ordem ' + order, test(() => {
      if (order === 'reverse') { data['categories'].reverse(); }
      if (order === 'numeric') { data['categories'].sort((a, b) => a.id - b.id); }
      if (order === 'children-first') { data['categories'].sort((a, b) => Number(!a.parentId) - Number(!b.parentId)); }
      if (order === 'parents-first') { data['categories'].sort((a, b) => Number(!!a.parentId) - Number(!!b.parentId)); }
      load(); expectGroups(); select(17); select(333); expect(ids()).toEqual([3]);
    }));
  }

  it('não perde filhos ao agrupar diretamente um filho antes do pai', test(() => {
    load(); component.categoriesSearch = [data['categories'][0], data['categories'][6]];
    component.groupCategoriesByParent(); render(); expect(groups()).toEqual({ 3: [17] });
  }));

  it('deduplica vínculos pelo par produto e categoria', test(() => {
    data['productCategory'].push(...data['productCategory'].slice(0, 3));
    load(); select(17); select(333); expect(ids()).toEqual([3]);
    expect(component.auxPcProduct.filter(link => link.idProduct === 1 && link.ctId === 17).length).toBe(1);
    expect(component.auxPcProduct.some(link => link.idProduct === 3 && link.ctId === 333)).toBeTrue();
  }));

  it('preserva vínculos legítimos de um produto com categorias diferentes', test(() => {
    load(); select(17); select(220); expect(ids()).toEqual([1]);
    expect(component.auxPcProduct.filter(link => link.idProduct === 1).map(link => link.ctId)).toEqual([17, 220]);
  }));

  it('não aceita um produto que só atende parte dos grupos, mesmo com vínculos repetidos', test(() => {
    data['productCategory'].push({ idProduct: 1, ctId: 17 }, { idProduct: 1, ctId: 17 });
    load(); select(17); select(333); expect(ids()).toEqual([3]); expect(ids()).not.toContain(1);
  }));

  it('combina categorias do mesmo grupo com OU', test(() => {
    load(); select(17); select(42); expect(ids()).toEqual([1, 2, 3, 4]);
    expect(component.nameGroup).toEqual(['Marca']);
  }));

  it('combina grupos diferentes com E', test(() => {
    load(); select(17); select(333); expect(ids()).toEqual([3]);
    expect(component.nameGroup).toEqual(['Marca', 'Uso']);
  }));

  it('combina OU dentro de cada grupo e E entre os grupos', test(() => {
    load(); select(17); select(42); select(333); expect(ids()).toEqual([2, 3]);
    select(220); expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('não deixa várias correspondências do mesmo grupo substituírem outro grupo', test(() => {
    data['productCategory'].push({ idProduct: 1, ctId: 42 });
    load(); select(17); select(42); select(333); expect(ids()).toEqual([2, 3]);
  }));

  it('retorna vazio quando um grupo selecionado não possui produtos', test(() => {
    load(); select(444); expect(ids()).toEqual([]); select(17); expect(ids()).toEqual([]);
  }));

  it('permite OU entre uma categoria sem vínculos e outra do mesmo grupo', test(() => {
    load(); select(444); select(333); expect(ids()).toEqual([2, 3]);
  }));

  it('ignora vínculos com categorias inexistentes e informa a inconsistência', test(() => {
    data['productCategory'].push({ idProduct: 1, ctId: 9999 });
    load(); select(17); expect(ids()).toEqual([1, 3]);
    expect(component.categoryIssues.some(issue => issue.includes('Vínculo'))).toBeTrue();
    expect(console.warn).toHaveBeenCalled();
  }));

  it('uma seleção inválida não amplia os resultados', test(() => {
    load(); component.filterAll(2, { id: 9999 }, 'Ausente'); render(); expect(ids()).toEqual([]);
    component.clearFilters(); render(); expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('não cria grupos fantasmas para categorias órfãs', test(() => {
    data['categories'].push({ id: 777, name: 'Órfã', parentId: 9999, scId: 10 });
    load(); expectGroups(); expect(component.categoryIssues.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('#desktop-category-777')).toBeNull();
  }));

  it('exclui ciclos de pais sem afetar categorias válidas', test(() => {
    data['categories'].push({ id: 777, name: 'Ciclo A', parentId: 778, scId: 10 }, { id: 778, name: 'Ciclo B', parentId: 777, scId: 10 });
    load(); expectGroups(); select(17); expect(ids()).toEqual([1, 3]);
    expect(component.categoryIssues.some(issue => issue.includes('cíclico'))).toBeTrue();
  }));

  it('deduplica categorias repetidas sem duplicar grupos ou checkboxes', test(() => {
    data['categories'].push(...JSON.parse(JSON.stringify(data['categories'])));
    load(); expectGroups(); select(17); expect(ids()).toEqual([1, 3]);
  }));

  it('rejeita categorias conflitantes com o mesmo ID em qualquer ordem', test(() => {
    data['categories'].push({ id: 17, name: 'Conflitante', parentId: 105, scId: 10 });
    load(); expect(component.categoriesGrouped[3].children.map((child: any) => child.id)).toEqual([42]);
    expect(component.categoryIssues.some(issue => issue.includes('conflitante'))).toBeTrue();
  }));

  it('deduplica produtos do catálogo sem duplicar cards', test(() => {
    data['products'].push({ ...data['products'][0] }); load(); select(17);
    expect(ids()).toEqual([1, 3]); expect(names()).toEqual(['AMD Gaming', 'AMD Office']);
  }));

  it('aceita arrays vazios com grupos e produtos vazios', test(() => {
    for (const endpoint of endpoints) { data[endpoint] = []; }
    load(); expect(ids()).toEqual([]); expect(groups()).toEqual({}); expect(component.categoryIssues).toEqual([]);
  }));

  it('sem vínculos mostra o catálogo até que uma categoria seja selecionada', test(() => {
    data['productCategory'] = []; load(); expect(ids()).toEqual([1, 2, 3, 4]);
    select(17); expect(ids()).toEqual([]);
  }));

  it('sincroniza selecionar, desmarcar e selecionar novamente nos dois painéis', test(() => {
    load(); select(17); select(17, 'mobile'); expect(ids()).toEqual([1, 2, 3, 4]);
    select(42, 'mobile'); expect(ids()).toEqual([2, 4]);
    expect((fixture.nativeElement.querySelector('#desktop-category-42') as HTMLInputElement).checked).toBeTrue();
    expect(component.auxFilter).toEqual([42]);
  }));

  it('limpa seleções, estados auxiliares, preços e checkboxes', test(() => {
    load(); select(17); select(333); component.value = 200; component.filterAll(1, 0, null);
    component.clearFilters(); render(); expect(ids()).toEqual([1, 2, 3, 4]);
    expect(component.auxFilter).toEqual([]); expect(component.nameGroup).toEqual([]); expect(component.auxPcProduct).toEqual([]);
    expect(component.value).toBe(100); expect(component.highValue).toBe(400);
    expect(fixture.nativeElement.querySelectorAll('input:checked').length).toBe(0);
  }));

  it('combina preços e categorias sem perder nenhum dos critérios', test(() => {
    load(); select(17); component.value = 200; component.filterAll(1, 0, null); render(); expect(ids()).toEqual([3]);
    select(42); expect(ids()).toEqual([2, 3, 4]); component.highValue = 300; component.filterAll(1, 0, null); render();
    expect(ids()).toEqual([2, 3]); select(333); expect(ids()).toEqual([2, 3]);
  }));

  it('restaura o estado de A após cancelar B na navegação rápida A → B → A', test(() => {
    load(); select(17); params.next({ filterName: 'B' }); const b = requests();
    expect(component.auxFilter).toEqual([]); params.next({ filterName: 'A' }); const a = requests();
    endpoints.forEach(e => expect(b[e].cancelled).toBeTrue()); respond(a); render();
    expect(ids()).toEqual([1, 3]); expect(component.auxFilter).toEqual([17]); expectGroups();
  }));

  it('não confunde grupos de seções distintas que possuem o mesmo nome', test(() => {
    load(); params.next({ filterName: 'B' }); respond(requests()); render();
    expect(groups()).toEqual({ 500: [501] }); select(501); expect(ids()).toEqual([5]);
    expect(component.nameGroup).toEqual(['Marca']);
  }));

  it('mantém o escopo por sbcId em subseções', test(() => {
    data['categories'].forEach(category => { if (category.scId === 10) { category.sbcId = 15; category.scId = 0; } });
    start(); params.next({ subsectionName: 'A_SUB' }); respond(requests()); render(); expectGroups(); select(17); expect(ids()).toEqual([1, 3]);
  }));

  it('preserva a navegação do card após filtrar e limpar', test(() => {
    load(); select(17); component.clearFilters(); render();
    const link = fixture.nativeElement.querySelectorAll('a.product_Item')[2] as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/Product/AMD%20Office');
    TestBed.inject(NgZone).run(() => link.click()); flushMicrotasks(); tick();
    expect(TestBed.inject(Router).url).toBe('/Product/AMD%20Office');
  }));

  it('não modifica as respostas originais ao selecionar e limpar', test(() => {
    load(); const original = JSON.stringify([component.categories, component.productCategory, component.products]);
    select(17); component.clearFilters(); render();
    expect(JSON.stringify([component.categories, component.productCategory, component.products])).toBe(original);
  }));
});
