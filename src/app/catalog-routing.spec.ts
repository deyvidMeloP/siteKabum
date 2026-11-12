import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DefaultUrlSerializer, NavigationEnd, Router, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { filter, firstValueFrom, take } from 'rxjs';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { KabumServiceService } from './services/kabum-service.service';
import { ProductFilterStateService } from './services/product-filter-state.service';
import { CatalogUrlSerializer, resolveCatalogName, resolveFilterRouteContext } from './routing/catalog-route';

const specialNames = ['Produto com espaços', 'Câmera 東京 😀', 'Oferta 50%', 'Produto %20 literal', 'A & B + C #D ? E / F', "D'Ávila", 'Inválido %2G %E0%A4%A'];

describe('Contrato de nomes e serialização de rotas', () => {
  const serializer = new CatalogUrlSerializer();
  for (const name of specialNames) {
    it(`preserva o segmento original: ${name}`, () => {
      const tree = serializer.parse('/Product/' + encodeURIComponent(name));
      expect(tree.root.children['primary'].segments[1].path).toBe(name);
      expect(serializer.parse(serializer.serialize(tree)).root.children['primary'].segments[1].path).toBe(name);
    });
    it(`resolve o nome legado uma única vez: ${name}`, () => {
      expect(resolveCatalogName(encodeURIComponent(name), [name])).toBe(name);
    });
  }
  it('confirma que o serializador padrão decodifica uma única camada', () => {
    const tree = new DefaultUrlSerializer().parse('/Product/Produto%2520A');
    expect(tree.root.children['primary'].segments[1].path).toBe('Produto%20A');
  });
  it('prioriza %20 literal sobre um espaço existente no catálogo', () => {
    expect(resolveCatalogName('Produto%20A', ['Produto A', 'Produto%20A'])).toBe('Produto%20A');
  });
  it('não transforma um nome desconhecido por decodificações sucessivas', () => {
    expect(resolveCatalogName('%2520', [' '])).toBe('%2520');
  });
  it('mantém um nome desconhecido com percentuais malformados', () => {
    expect(resolveCatalogName('50% %GG %E0%A4', ['50'])).toBe('50% %GG %E0%A4');
  });
  for (const [url, value] of [['/Filter/Oferta%2050%', 'Oferta 50%'], ['/Product/%2G', '%2G'], ['/Product/%E0%A4%A', '%E0%A4%A']]) {
    it(`aceita percentuais malformados no endereço: ${url}`, () => {
      expect(serializer.parse(url).root.children['primary'].segments[1].path).toBe(value);
    });
  }
  it('preserva espaço válido antes de UTF-8 incompleto', () => {
    const tree = serializer.parse('/Product/Produto%20%E0%A4%A');
    expect(tree.root.children['primary'].segments[1].path).toBe('Produto %E0%A4%A');
  });
  it('preserva Unicode válido depois de um escape inválido', () => {
    const tree = serializer.parse('/Product/%2G%20%C3%A9');
    expect(tree.root.children['primary'].segments[1].path).toBe('%2G é');
  });
  it('preserva query, fragmento e escapes válidos', () => {
    const tree = serializer.parse('/Filter/Caf%C3%A9%20A?x=a%2Bb#se%C3%A7%C3%A3o');
    expect(tree.root.children['primary'].segments[1].path).toBe('Café A');
    expect(tree.queryParams['x']).toBe('a+b'); expect(tree.fragment).toBe('seção');
  });
  it('não modifica a serialização de rotas fora do catálogo', () => {
    expect(serializer.serialize(serializer.parse('/home?x=1#top'))).toBe('/home?x=1#top');
  });
  it('resolve nomes legados dentro da hierarquia correta', () => {
    const context = resolveFilterRouteContext({filterName: 'A%20B', subsectionName: 'C%20D', parentName: 'E%20F'}, [{id: 1, name: 'A B'}], [{id: 2, name: 'C D', scId: 1, parentId: 0}, {id: 3, name: 'E F', parentId: 2}]);
    expect(context).toEqual({filterName: 'A B', subsectionName: 'C D', parentName: 'E F'});
  });
  it('não decodifica um ancestral literal para encontrar outra hierarquia', () => {
    const context = resolveFilterRouteContext({filterName: 'A%20B', subsectionName: 'Comum', parentName: ''}, [{id: 1, name: 'A B'}, {id: 2, name: 'A%20B'}], [{id: 10, name: 'Comum', scId: 1}, {id: 20, name: 'Comum', scId: 2}]);
    expect(context.filterName).toBe('A%20B');
  });
});

@Component({ template: '<router-outlet></router-outlet>' })
class CatalogRoutingHostComponent {}
@Component({ template: '' })
class CatalogHomeComponent {}

describe('Navegação real e snapshots com nomes especiais', () => {
  let fixture: ComponentFixture<CatalogRoutingHostComponent>;
  let router: Router;
  let service: KabumServiceService;
  let http: HttpTestingController;
  let data: Record<string, any[]>;
  let savedStorage: Record<string, string | null>;
  const storageKeys = ['filterName', 'subsectionName', 'parentName', 'productName'];
  const rootA = 'Peças & Cia';
  const rootB = 'Outras + Áreas';
  const subsection = 'Comum %20';
  const child = 'Filho / Série #1?';

  beforeEach(async () => {
    savedStorage = Object.fromEntries(storageKeys.map(key => [key, localStorage.getItem(key)]));
    storageKeys.forEach(key => localStorage.removeItem(key));
    spyOn(ProductFilterComponent.prototype as any, 'scheduleViewInitialization').and.stub();
    spyOn(ProductMainComponent.prototype as any, 'scheduleViewInitialization').and.stub();
    spyOn(KabumServiceService.prototype, 'accountant_Time2').and.returnValue('');
    spyOn(KabumServiceService.prototype, 'accountant_Time3').and.returnValue('');
    await TestBed.configureTestingModule({
      declarations: [CatalogRoutingHostComponent, CatalogHomeComponent, ProductFilterComponent, ProductMainComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSliderModule, HttpClientTestingModule, RouterTestingModule.withRoutes([
        {path: 'home', component: CatalogHomeComponent},
        {path: 'Filter/:filterName/:subsectionName/:parentName', component: ProductFilterComponent},
        {path: 'Filter/:filterName/:subsectionName', component: ProductFilterComponent},
        {path: 'Filter/:filterName', component: ProductFilterComponent},
        {path: 'Product/:productName', component: ProductMainComponent}
      ])],
      providers: [{provide: UrlSerializer, useClass: CatalogUrlSerializer}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router); service = TestBed.inject(KabumServiceService); http = TestBed.inject(HttpTestingController);
    data = {
      products: [...specialNames.map((name, i) => ({idProduct: i + 1, name_Product: name, price: 100 + i * 100, discount: 0, scId: 1, sbcId: 12})), {idProduct: 99, name_Product: 'Outro', price: 900, discount: 0, scId: 2, sbcId: 22}],
      section: [{id: 1, name: rootA}, {id: 2, name: rootB}],
      subsection: [{id: 11, name: subsection, scId: 1, parentId: 0}, {id: 21, name: subsection, scId: 2, parentId: 0}, {id: 12, name: child, parentId: 11}, {id: 22, name: child, parentId: 21}],
      categories: [{id: 100, name: 'Marca', scId: 1, parentId: 0}, {id: 101, name: 'A', scId: 1, parentId: 100}, {id: 102, name: 'B', scId: 1, parentId: 100}, {id: 200, name: 'Marca', scId: 2, parentId: 0}, {id: 201, name: 'A', scId: 2, parentId: 200}],
      productCategory: specialNames.map((_, i) => ({idProduct: i + 1, ctId: i % 2 ? 102 : 101})), images: [], departments: []
    };
    fixture = TestBed.createComponent(CatalogRoutingHostComponent); document.body.appendChild(fixture.nativeElement); fixture.detectChanges();
    await router.navigate(['/home']); fixture.detectChanges();
  });
  afterEach(() => {
    fixture.destroy(); http.verify();
    storageKeys.forEach(key => savedStorage[key] === null ? localStorage.removeItem(key) : localStorage.setItem(key, savedStorage[key]!));
  });
  function settle(): void {
    fixture.detectChanges();
    for (let i = 0; i < 4; i++) {
      const pending = http.match(request => request.method === 'GET');
      for (const request of pending) { request.flush(data[request.request.url.split('/').pop()!] ?? []); }
    }
    fixture.detectChanges();
  }
  async function go(commands: any[]): Promise<void> { await router.navigate(commands); settle(); }
  async function address(url: string): Promise<void> { await router.navigateByUrl(url); settle(); }
  function filterComponent(): ProductFilterComponent { return fixture.debugElement.query(By.directive(ProductFilterComponent)).componentInstance; }
  function productComponent(): ProductMainComponent { return fixture.debugElement.query(By.directive(ProductMainComponent)).componentInstance; }
  function ids(): number[] { return filterComponent().filterProduct.map(item => item.idProduct); }
  function params(): any { let route = router.routerState.snapshot.root; while (route.firstChild) { route = route.firstChild; } return route.params; }
  function expectedUrl(commands: any[]): string { return router.serializeUrl(router.createUrlTree(commands)); }
  async function action(fn: () => void): Promise<void> { const done = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd), take(1))); TestBed.inject(NgZone).run(fn); await done; settle(); }

  for (const [i, name] of specialNames.entries()) {
    it(`abre o produto pelo serviço sem pré-codificação: ${name}`, async () => {
      await service.changeProductMainName(name); settle();
      expect(params()['productName']).toBe(name); expect(productComponent().produto.idProduct).toBe(i + 1);
      expect(router.url).toBe(expectedUrl(['/Product', name]));
    });
    it(`abre o produto por endereço canônico: ${name}`, async () => {
      await address('/Product/' + encodeURIComponent(name));
      expect(params()['productName']).toBe(name); expect(productComponent().produto.idProduct).toBe(i + 1);
    });
    it(`abre o produto por link legado: ${name}`, async () => {
      await address('/Product/' + encodeURIComponent(encodeURIComponent(name)));
      expect(params()['productName']).toBe(encodeURIComponent(name)); expect(productComponent().produto.idProduct).toBe(i + 1);
    });
    it(`abre a seção especial por endereço e por serviço: ${name}`, async () => {
      data['section'][0].name = name;
      await address('/Filter/' + encodeURIComponent(name)); expect(params()['filterName']).toBe(name); expect(filterComponent().name).toBe(name); expect(ids()).toEqual([1,2,3,4,5,6,7]);
      await go(['/home']); await service.changeFilterName(name); settle(); expect(router.url).toBe(expectedUrl(['/Filter', name])); expect(ids()).toEqual([1,2,3,4,5,6,7]);
    });
  }
  it('preserva o produto literal quando o catálogo também contém o nome decodificado', async () => {
    data['products'].push({...data['products'][3], idProduct: 88, name_Product: 'Produto   literal'});
    await go(['/Product', 'Produto %20 literal']); expect(productComponent().produto.idProduct).toBe(4);
  });
  it('não cria URIError em acesso direto com percentual cru', async () => {
    data['products'][0].name_Product = 'Produto 50%'; await address('/Product/Produto%2050%'); expect(productComponent().produto.idProduct).toBe(1);
    data['section'][0].name = 'Oferta 50%'; await address('/Filter/Oferta%2050%'); expect(filterComponent().name).toBe('Oferta 50%'); expect(ids().length).toBe(7);
  });
  it('não interpreta um produto ausente como outro por decodificação recursiva', async () => {
    await go(['/Product', encodeURIComponent(encodeURIComponent(specialNames[0]))]); expect(productComponent().produto).toBeUndefined();
  });
  it('mantém %20 literal e espaço como contextos separados', async () => {
    data['section'] = [{id: 1, name: 'A%20B'}, {id: 2, name: 'A B'}];
    await go(['/Filter', 'A%20B']); filterComponent().onCheckboxChange({id: 101}, 'Marca');
    await go(['/Filter', 'A B']); expect(ids()).toEqual([99]); expect(filterComponent().auxFilter).toEqual([]);
    await go(['/Filter', 'A%20B']); expect(filterComponent().auxFilter).toEqual([101]); expect(ids()).toEqual([1,3,5,7]);
  });
  it('mantém o snapshot entre URL canônica, produto e URL legada', async () => {
    await go(['/Filter', rootA]); const component = filterComponent(); component.onCheckboxChange({id: 101}, 'Marca'); component.value = 150.25; component.highValue = 550.75; component.filterAll(1,0,null);
    await go(['/Product', specialNames[2]]); await address('/Filter/' + encodeURIComponent(encodeURIComponent(rootA)));
    expect(filterComponent().auxFilter).toEqual([101]); expect(filterComponent().value).toBe(150.25); expect(filterComponent().highValue).toBe(550.75); expect(ids()).toEqual([3,5]);
    expect(TestBed.inject(ProductFilterStateService).get({filterName: rootA, subsectionName: '', parentName: ''})?.categoryIds).toEqual([101]);
  });
  it('não herda o estado de outro ancestral com subseção e filho iguais', async () => {
    await go(['/Filter', rootA, subsection, child]); expect(ids()).toEqual([1,2,3,4,5,6,7]);
    await go(['/Filter', rootB, subsection, child]); expect(ids()).toEqual([99]); expect(params()).toEqual({filterName: rootB, subsectionName: subsection, parentName: child});
  });
  it('usa a rota atual em vez do localStorage ao abrir uma subseção', async () => {
    await go(['/Filter', rootA]); localStorage.setItem('filterName', rootB); await service.changeSubsectionName(subsection); settle();
    expect(params()).toEqual({filterName: rootA, subsectionName: subsection}); expect(router.url).toBe(expectedUrl(['/Filter', rootA, subsection]));
  });
  it('usa os dois ancestrais atuais ao abrir um filho', async () => {
    await go(['/Filter', rootA, subsection]); localStorage.setItem('filterName', rootB); localStorage.setItem('subsectionName', 'Antiga'); await service.changeParentName(child); settle();
    expect(params()).toEqual({filterName: rootA, subsectionName: subsection, parentName: child}); expect(ids()).toEqual([1,2,3,4,5,6,7]);
  });
  it('não fabrica uma hierarquia a partir de chaves antigas fora de Filter', async () => {
    localStorage.setItem('filterName', rootB); await service.changeSubsectionName(subsection); expect(router.url).toBe('/home');
    await service.changeParentName(child); expect(router.url).toBe('/home');
  });
  it('limpa as chaves descendentes ao trocar de seção', async () => {
    localStorage.setItem('subsectionName', 'Antiga'); localStorage.setItem('parentName', 'Antigo'); await service.changeFilterName(rootA); settle();
    expect(localStorage.getItem('subsectionName')).toBeNull(); expect(localStorage.getItem('parentName')).toBeNull();
  });
  it('inicializa parentName com sua própria chave', () => {
    localStorage.setItem('subsectionName', 'Sub'); localStorage.setItem('parentName', 'Filho'); const instance = new KabumServiceService(TestBed.inject(HttpClient), router); let value = '';
    const subscription = instance.parentName$.subscribe(name => value = name); expect(value).toBe('Filho'); subscription.unsubscribe();
  });
  it('mantém o caminho completo ao clicar no menu da navbar', async () => {
    const navbar: any = {nameSection: [rootB, subsection], stateService: service, leave() {}, leaveButton() {}, departments_Leave() {}, closeMenuMobile() {}};
    await action(() => NavbarComponent.prototype.NavigationPage.call(navbar, child, 'parent'));
    expect(params()).toEqual({filterName: rootB, subsectionName: subsection, parentName: child}); expect(ids()).toEqual([99]);
  });
  it('mantém o caminho da seção ao abrir Ver tudo da subseção', async () => {
    const navbar: any = {nameSection: [rootA, subsection], stateService: service, leave() {}, leaveButton() {}, departments_Leave() {}, closeMenuMobile() {}};
    await action(() => NavbarComponent.prototype.NavigationPage.call(navbar, subsection, 'subsection'));
    expect(params()).toEqual({filterName: rootA, subsectionName: subsection});
  });
  it('navega pelas categorias relacionadas usando o contexto carregado', async () => {
    await go(['/Filter', rootA]); localStorage.setItem('filterName', rootB); await action(() => filterComponent().filter_Section(subsection));
    expect(params()).toEqual({filterName: rootA, subsectionName: subsection});
    await action(() => filterComponent().filter_Section(child)); expect(params()).toEqual({filterName: rootA, subsectionName: subsection, parentName: child});
  });
  it('abre o card por routerLink mantendo o nome literal', async () => {
    await go(['/Filter', rootA]); const card = fixture.nativeElement.querySelectorAll('a.product_Item')[3] as HTMLAnchorElement;
    expect(card.getAttribute('href')).toBe(expectedUrl(['/Product', specialNames[3]])); await action(() => card.click()); expect(productComponent().produto.idProduct).toBe(4);
  });
});
