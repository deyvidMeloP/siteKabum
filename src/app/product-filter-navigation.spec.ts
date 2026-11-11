import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { KabumServiceService } from './services/kabum-service.service';

@Component({ template: '<router-outlet></router-outlet>' })
class NavigationHostComponent {}

 describe('Navegação dos cards do ProductFilter', () => {
  let fixture: ComponentFixture<NavigationHostComponent>;
  let router: Router;
  let filter: ProductFilterComponent;
  let products: any[];
  const names = ['Produto A', 'Placa de vídeo / Série #1? +', 'Desconto 50%', 'Produto %20 literal', 'Produto % inválido'];

  beforeEach(async () => {
    products = names.map((name, index) => ({ idProduct: index + 1, name_Product: name, price: 100, discount: 10, stock_Quantity: 3, imageUrl: '' }));
    spyOn(ProductFilterComponent.prototype, 'ngOnInit').and.stub();
    spyOn(ProductMainComponent.prototype as any, 'scheduleViewInitialization').and.stub();
    spyOn(window, 'IntersectionObserver').and.returnValue({ observe() {}, disconnect() {} } as any);
    await TestBed.configureTestingModule({
      declarations: [NavigationHostComponent, ProductFilterComponent, ProductMainComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([
        { path: 'Filter/:filterName', component: ProductFilterComponent },
        { path: 'Product/:productName', component: ProductMainComponent }
      ])],
      providers: [{ provide: KabumServiceService, useValue: {
        getDados: () => of(products), getDadosImages: () => of([]), getDadosDepartments: () => of([]),
        command$: EMPTY, offerTime2$: EMPTY, offerTime3$: EMPTY,
        accountant_Time2() {}, accountant_Time3() {}
      } }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavigationHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await router.navigate(['/Filter', 'Hardware']);
    fixture.detectChanges();
    filter = fixture.debugElement.query(By.directive(ProductFilterComponent)).componentInstance;
    filter.filterProduct = products;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function cards(): HTMLAnchorElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('a.product_Item'));
  }

  function detail(): ProductMainComponent {
    return fixture.debugElement.query(By.directive(ProductMainComponent)).componentInstance;
  }

  async function click(element: HTMLElement): Promise<void> {
    element.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  for (const [index, name] of names.entries()) {
    it(`abre o nome original sem codificação duplicada: ${name}`, async () => {
      const link = cards()[index];
      expect(link.getAttribute('href')).toBe(router.serializeUrl(router.createUrlTree(['/Product', name])));
      await click(link.querySelector('.product_Name')!);
      expect(detail().produto.name_Product).toBe(name);
      expect(router.url).toBe(router.serializeUrl(router.createUrlTree(['/Product', name])));
    });
  }

  it('abre o produto ao clicar na imagem', async () => {
    await click(cards()[1].querySelector('img')!);
    expect(detail().produto.idProduct).toBe(2);
  });

  it('usa a área COMPRAR para abrir os detalhes sem implementar compra', async () => {
    await click(cards()[0].querySelector('.buy_Enter_Buy')!);
    expect(detail().produto.idProduct).toBe(1);
  });

  it('oferece um link nativo acessível por teclado', () => {
    const link = cards()[0];
    expect(link.tabIndex).toBe(0);
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(link.getAttribute('href')).toBe('/Product/Produto%20A');
  });

  it('não altera a seleção nem os limites dos filtros ao navegar', async () => {
    filter.auxFilter = [2];
    filter.categoriesGrouped = { 1: { name: 'Marca', children: [{ id: 2, name: 'AMD', selected: true }] } };
    filter.value = 50;
    filter.highValue = 200;
    const before = JSON.stringify([filter.auxFilter, filter.categoriesGrouped, filter.value, filter.highValue, filter.filterProduct]);
    await click(cards()[0]);
    expect(JSON.stringify([filter.auxFilter, filter.categoriesGrouped, filter.value, filter.highValue, filter.filterProduct])).toBe(before);
  });

  it('não cria links inválidos quando o nome está ausente', () => {
    filter.filterProduct = [undefined, null, ''].map(name_Product => ({ name_Product, price: 100, discount: 0 }));
    fixture.detectChanges();
    for (const link of cards()) {
      expect(link.hasAttribute('href')).toBeFalse();
      expect(link.tabIndex).toBe(-1);
    }
    expect(router.url).toBe('/Filter/Hardware');
  });

  it('preserva o contrato antigo de nomes pré-codificados', async () => {
    await router.navigate(['/Product', encodeURIComponent(names[0])]);
    fixture.detectChanges();
    expect(detail().produto.name_Product).toBe(names[0]);
  });

  it('prioriza o nome literal quando também existe uma versão decodificada', async () => {
    products.push({ ...products[0], name_Product: 'Produto   literal' });
    await click(cards()[3]);
    expect(detail().produto.name_Product).toBe('Produto %20 literal');
  });

  it('tolera produto removido entre a listagem e os detalhes', async () => {
    products.splice(0, 1);
    await click(cards()[0]);
    expect(detail().produto).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.product_Box')).toBeNull();
  });

  it('abre um produto sem imagens', async () => {
    delete products[0].imageUrl;
    await click(cards()[0]);
    expect(detail().produto.idProduct).toBe(1);
    expect(detail().images_Product).toEqual([]);
  });

  it('permite voltar à seção e abrir outro produto', async () => {
    await click(cards()[0]);
    await router.navigate(['/Filter', 'Hardware']);
    fixture.detectChanges();
    filter = fixture.debugElement.query(By.directive(ProductFilterComponent)).componentInstance;
    filter.filterProduct = products;
    fixture.detectChanges();
    await click(cards()[1]);
    expect(detail().produto.idProduct).toBe(2);
  });
});
