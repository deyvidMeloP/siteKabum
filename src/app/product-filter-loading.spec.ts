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

describe('Carregamento concorrente do ProductFilter', () => {
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
        { idProduct: 1, name_Product: 'A primeiro', scId: 10, sbcId: 15, price: 100, discount: 0 },
        { idProduct: 2, name_Product: 'A segundo', scId: 10, sbcId: 16, price: 300, discount: 0 },
        { idProduct: 3, name_Product: 'B atual', scId: 20, sbcId: 25, price: 200, discount: 0 },
        { idProduct: 4, name_Product: 'C atual', scId: 30, sbcId: 35, price: 400, discount: 0 }
      ],
      productCategory: [{ idProduct: 1, ctId: 2 }, { idProduct: 1, ctId: 9 }, { idProduct: 2, ctId: 7 }, { idProduct: 3, ctId: 4 }, { idProduct: 4, ctId: 6 }],
      section: [{ id: 10, name: 'A' }, { id: 20, name: 'B' }, { id: 30, name: 'C' }],
      subsection: [{ id: 15, scId: 10, parentId: 0, name: 'A_SUB' }, { id: 16, scId: 0, parentId: 15, name: 'A_NESTED' }, { id: 25, scId: 20, parentId: 0, name: 'B_SUB' }],
      categories: [
        { id: 1, name: 'Marca A', parentId: 0, scId: 10 }, { id: 2, name: 'AMD', parentId: 1, scId: 10 },
        { id: 3, name: 'Marca B', parentId: 0, scId: 20 }, { id: 4, name: 'Intel', parentId: 3, scId: 20 },
        { id: 5, name: 'Marca C', parentId: 0, scId: 30 }, { id: 6, name: 'OEM', parentId: 5, scId: 30 },
        { id: 7, name: 'NVIDIA', parentId: 1, scId: 10 }, { id: 8, name: 'Subcategoria A', parentId: 0, sbcId: 15 }, { id: 9, name: 'Sub AMD', parentId: 8, sbcId: 15 }
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

  for (const order of [
    endpoints,
    ['productCategory', 'products', 'categories', 'subsection', 'section'],
    ['categories', 'subsection', 'section', 'productCategory', 'products'],
    ['subsection', 'section', 'products', 'categories', 'productCategory'],
    ['section', 'subsection', 'productCategory', 'categories', 'products'],
    ['categories', 'products', 'productCategory', 'subsection', 'section']
  ]) {
    it('publica apenas o conjunto completo na ordem ' + order.join(' → '), test(() => {
      const pending = start();
      expect(component.testa).toBe(1);
      expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain('Carregando');
      for (const endpoint of order.slice(0, -1)) {
        pending[endpoint].flush(data[endpoint]); render();
        expect(ids()).toEqual([]); expect(component.products).toEqual([]);
        expect(component.categoriesGrouped).toEqual({}); expect(component.testa).toBe(1);
        expect(fixture.nativeElement.querySelectorAll('.product_Item').length).toBe(0);
      }
      pending[order[order.length - 1]].flush(data[order[order.length - 1]]);
      checkCatalog([1, 2], ['A primeiro', 'A segundo'], 'Marca A', ['AMD', 'NVIDIA']);
      expect(component.value).toBe(100); expect(component.highValue).toBe(300);
      expect(fixture.nativeElement.querySelector('[role=status]')).toBeNull();
    }));
  }

  it('cancela A e mantém B mesmo quando uma resposta antiga tenta chegar depois', test(() => {
    const old = start(); old['categories'].flush(data['categories']);
    params.next({ filterName: 'B' }); const current = requests();
    for (const key of endpoints.filter(e => e !== 'categories')) { expect(old[key].cancelled).toBeTrue(); }
    respond(current);
    checkCatalog([3], ['B atual'], 'Marca B', ['Intel']);
    expect(() => old['products'].flush([{ idProduct: 99, name_Product: 'Resposta antiga', scId: 20, price: 1 }])).toThrowError(/cancelled/);
    expect(names()).toEqual(['B atual']); expect(component.products.map(p => p.idProduct)).not.toContain(99);
  }));

  it('cancela A e B em navegações rápidas A → B → C', test(() => {
    const a = start(); params.next({ filterName: 'B' }); const b = requests(); params.next({ filterName: 'C' }); const c = requests();
    endpoints.forEach(e => { expect(a[e].cancelled).toBeTrue(); expect(b[e].cancelled).toBeTrue(); });
    respond(c, [...endpoints].reverse());
    checkCatalog([4], ['C atual'], 'Marca C', ['OEM']);
  }));

  it('cancela todas as consultas e a inscrição de rota na destruição', test(() => {
    const pending = start(); fixture.destroy();
    endpoints.forEach(e => expect(pending[e].cancelled).toBeTrue());
    params.next({ filterName: 'B' }); tick(5000);
    http.expectNone(request => request.method === 'GET');
    expect(component.products).toEqual([]); expect(carousel).not.toHaveBeenCalled();
  }));

  it('cancela a montagem de interface quando outra rota começa antes da renderização', test(() => {
    const initialize = spyOn(component, 'initLess').and.callThrough();
    respond(start()); params.next({ filterName: 'B' }); const pending = requests(); render();
    expect(initialize).not.toHaveBeenCalled(); expect(carousel).not.toHaveBeenCalled();
    respond(pending); checkCatalog([3], ['B atual'], 'Marca B', ['Intel']);
    expect(initialize).toHaveBeenCalledTimes(1); expect(carousel).toHaveBeenCalledTimes(1);
  }));

  it('cancela a montagem pendente quando o componente é destruído', test(() => {
    const initialize = spyOn(component, 'initLess'); respond(start()); fixture.destroy(); tick();
    expect(initialize).not.toHaveBeenCalled(); expect(carousel).not.toHaveBeenCalled();
  }));

  for (const endpoint of endpoints) {
    it('trata falha HTTP em ' + endpoint + ' sem publicar um catálogo parcial', test(() => {
      const pending = start();
      for (const ready of endpoints.filter(e => e !== endpoint).slice(0, 2)) { pending[ready].flush(data[ready]); }
      expect(component.products).toEqual([]);
      pending[endpoint].flush({ message: 'Falha simulada' }, { status: 500, statusText: 'Simulado' }); render();
      expect(component.testa).toBe(0); expect(component.loadError).not.toBe('');
      expect(component.products).toEqual([]); expect(component.productCategory).toEqual([]); expect(ids()).toEqual([]);
      expect(component.categoriesGrouped).toEqual({});
      expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Não foi possível');
      expect(fixture.nativeElement.querySelector('.product-filter-page')).toBeNull();
      for (const key of endpoints.filter(e => e !== endpoint)) { expect(pending[key].cancelled).toBeTrue(); }
    }));
  }

  it('trata erro de rede sem manter os resultados anteriores', test(() => {
    respond(start()); render(); params.next({ filterName: 'B' }); const pending = requests();
    pending['products'].error(new ProgressEvent('error')); render();
    expect(ids()).toEqual([]); expect(component.categoriesGrouped).toEqual({});
    expect(fixture.nativeElement.querySelector('[role=alert]')).not.toBeNull();
  }));

  it('libera apenas o carrossel da própria instância ao trocar rota ou destruir', test(() => {
    const handles: Array<{ destroy: jasmine.Spy }> = [];
    carousel.and.callFake(() => {
      const handle = { destroy: jasmine.createSpy('destroy') };
      const container = fixture.nativeElement.querySelector('.marker_Swiper') as any;
      container.swiper = handle; handles.push(handle);
    });
    respond(start()); render(); expect(handles.length).toBe(1);
    params.next({ filterName: 'B' }); const pending = requests();
    expect(handles[0].destroy).toHaveBeenCalledOnceWith(true, true);
    respond(pending); render(); expect(handles.length).toBe(2);
    fixture.destroy(); expect(handles[1].destroy).toHaveBeenCalledOnceWith(true, true);
    expect(handles[0].destroy).toHaveBeenCalledTimes(1);
  }));

  it('recupera o carregamento na próxima navegação depois de uma falha', test(() => {
    const a = start(); a['section'].flush({}, { status: 503, statusText: 'Simulado' }); render();
    params.next({ filterName: 'B' }); expect(component.loadError).toBe(''); respond(requests());
    checkCatalog([3], ['B atual'], 'Marca B', ['Intel']); expect(fixture.nativeElement.querySelector('[role=alert]')).toBeNull();
  }));

  it('remove o catálogo anterior enquanto uma nova navegação está carregando', test(() => {
    respond(start()); render(); params.next({ filterName: 'B' }); const pending = requests(); render();
    expect(component.name).toBe('B'); expect(ids()).toEqual([]); expect(component.idSearch).toBeUndefined();
    expect(component.categoriesGrouped).toEqual({}); expect(component.auxFilter).toEqual([]); expect(names()).toEqual([]);
    respond(pending); checkCatalog([3], ['B atual'], 'Marca B', ['Intel']);
  }));

  it('aceita conjuntos de dados vazios válidos sem confundir com falha HTTP', test(() => {
    const pending = start(); for (const endpoint of endpoints) { pending[endpoint].flush([]); } render();
    expect(component.loadError).toBe(''); expect(component.testa).toBe(0); expect(ids()).toEqual([]);
    expect(component.categoriesGrouped).toEqual({}); expect(component.value).toBe(0); expect(component.highValue).toBe(1000);
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeNull();
  }));

  it('mantém o resultado correto com produtos e seções fora da ordem de IDs', test(() => {
    data['products'].reverse(); data['section'].reverse(); data['subsection'].reverse(); respond(start());
    checkCatalog([2, 1], ['A segundo', 'A primeiro'], 'Marca A', ['AMD', 'NVIDIA']);
  }));

  it('preserva seleção, preços e limpeza após concluir o carregamento', test(() => {
    respond(start()); render();
    const checkbox = fixture.nativeElement.querySelector('#desktop-category-7') as HTMLInputElement; checkbox.click(); render();
    expect(ids()).toEqual([2]); expect(component.auxFilter).toEqual([7]);
    const input = fixture.nativeElement.querySelector('.categories_Filter input[type=number]') as HTMLInputElement;
    input.value = '150'; input.dispatchEvent(new Event('input', { bubbles: true })); render();
    fixture.nativeElement.querySelector('.categories_Filter .filter_Button_Mobile').click(); render();
    expect(ids()).toEqual([1, 2]); expect(component.auxFilter).toEqual([]);
    expect(component.value).toBe(100); expect(component.highValue).toBe(300);
    expect(fixture.nativeElement.querySelectorAll('input:checked').length).toBe(0);
    http.expectNone(request => request.method === 'GET');
  }));

  it('atualiza os links dos cards com o catálogo da última rota', test(() => {
    start(); params.next({ filterName: 'B' }); const pending = requests(); respond(pending); render();
    const link = fixture.nativeElement.querySelector('a.product_Item') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/Product/B%20atual');
    TestBed.inject(NgZone).run(() => link.click()); flushMicrotasks(); tick();
    expect(TestBed.inject(Router).url).toBe('/Product/B%20atual');
  }));

  it('prioriza o nome mais específico da rota', test(() => {
    start(); params.next({ filterName: 'A', subsectionName: 'B', parentName: 'C' }); respond(requests());
    checkCatalog([4], ['C atual'], 'Marca C', ['OEM']);
  }));

  it('consulta a subseção sem depender da ordem de conclusão de seus endpoints', test(() => {
    start(); params.next({ filterName: 'A', subsectionName: 'A_SUB' }); respond(requests(), ['categories', 'products', 'subsection', 'section', 'productCategory']);
    checkCatalog([1], ['A primeiro'], 'Subcategoria A', ['Sub AMD']);
  }));

  it('cancela consultas quando a rota deixa de indicar uma seção', test(() => {
    const pending = start(); params.next({}); render(); endpoints.forEach(e => expect(pending[e].cancelled).toBeTrue());
    expect(component.testa).toBe(0); expect(ids()).toEqual([]); expect(component.idSearch).toBeUndefined();
    http.expectNone(request => request.method === 'GET');
  }));

  it('não repete o mesmo carregamento para nomes de rota idênticos', test(() => {
    const pending = start(); params.next({ filterName: 'A' }); http.expectNone(request => request.method === 'GET');
    respond(pending); checkCatalog([1, 2], ['A primeiro', 'A segundo'], 'Marca A', ['AMD', 'NVIDIA']);
  }));

  it('mantém uma única contagem de ofertas por instância e a encerra ao destruir', test(() => {
    const countdown = spyOn(component as any, 'startOfferCountdown').and.callThrough();
    spyOn(service, 'accountant_Time1'); spyOn(service, 'accountant_Time2'); spyOn(service, 'accountant_Time3');
    start(); tick(1000); const a = component.offer_Time1;
    params.next({ filterName: 'B' }); requests(); params.next({ filterName: 'C' }); requests(); tick(1000);
    expect(countdown).toHaveBeenCalledTimes(1); expect(component.offer_Time1).not.toBe(a);
    expect(service.accountant_Time1).not.toHaveBeenCalled(); expect(service.accountant_Time2).not.toHaveBeenCalled(); expect(service.accountant_Time3).not.toHaveBeenCalled();
    fixture.destroy(); const last = [component.offer_Time1, component.offer_Time2, component.offer_Time3]; tick(5000);
    expect([component.offer_Time1, component.offer_Time2, component.offer_Time3]).toEqual(last);
  }));
});
