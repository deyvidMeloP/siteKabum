import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Limpeza dos filtros do catálogo', () => {
  let fixture: ComponentFixture<ProductFilterComponent>;
  let component: ProductFilterComponent;
  let catalog: any[];
  let categories: any[];

  beforeEach(async () => {
    spyOn(ProductFilterComponent.prototype, 'ngOnInit').and.stub();
    await TestBed.configureTestingModule({
      declarations: [ProductFilterComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, NgxSliderModule],
      providers: [{ provide: KabumServiceService, useValue: {} }]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductFilterComponent);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    catalog = [
      { idProduct: 1, name_Product: 'AMD Gaming', price: 100, discount: 0 },
      { idProduct: 2, name_Product: 'Intel Office', price: 200, discount: 0 },
      { idProduct: 3, name_Product: 'AMD Office', price: 300, discount: 0 },
      { idProduct: 4, name_Product: 'Intel Gaming', price: 400, discount: 0 }
    ];
    categories = [
      { id: 1, parentId: 0, name: 'Marca' }, { id: 2, parentId: 1, name: 'AMD' }, { id: 3, parentId: 1, name: 'Intel' },
      { id: 4, parentId: 0, name: 'Uso' }, { id: 5, parentId: 4, name: 'Gaming' }, { id: 6, parentId: 4, name: 'Office' }
    ];
    component.product = catalog;
    component.products = [...catalog, { idProduct: 99, price: 900 }];
    component.filterProduct = [...catalog];
    component.categories = categories;
    component.categoriesGrouped = { 1: { name: 'Marca', children: categories.slice(1, 3) }, 4: { name: 'Uso', children: categories.slice(4, 6) } };
    component.productCategory = [{ idProduct: 1, ctId: 2 }, { idProduct: 1, ctId: 5 }, { idProduct: 2, ctId: 3 }, { idProduct: 2, ctId: 6 }, { idProduct: 3, ctId: 2 }, { idProduct: 3, ctId: 6 }, { idProduct: 4, ctId: 3 }, { idProduct: 4, ctId: 5 }];
    component.options = { ...component.options, floor: 100, ceil: 400 };
    component.value = 100;
    component.highValue = 400;
  });

  afterEach(() => fixture.destroy());

  function render(): void { fixture.detectChanges(); tick(); fixture.detectChanges(); }
  function ids(): number[] { return component.filterProduct.map(p => p.idProduct); }
  function checkbox(id: number, panel = 'desktop'): HTMLInputElement { return fixture.nativeElement.querySelector(`#${panel}-category-${id}`); }
  function select(id: number): void { checkbox(id).click(); render(); }
  function price(index: number, value: string): void {
    const input = fixture.nativeElement.querySelectorAll('input[type=number]')[index] as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    render();
  }

  it('limpa categorias e restaura os produtos da seção', fakeAsync(() => {
    render(); select(2);
    expect(ids()).toEqual([1, 3]);
    fixture.nativeElement.querySelector('.categories_Filter .filter_Button_Mobile').click(); render();
    expect(ids()).toEqual([1, 2, 3, 4]);
    expect(component.auxFilter).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('input[type=checkbox]:checked').length).toBe(0);
  }));

  it('limpa categorias combinadas e a faixa de preço', fakeAsync(() => {
    render(); select(2); select(6); price(0, '150'); price(1, '350');
    expect(ids()).toEqual([3]);
    component.clearFilters(); render();
    expect(ids()).toEqual([1, 2, 3, 4]);
    expect(component.value).toBe(100);
    expect(component.highValue).toBe(400);
  }));

  it('limpa também os estados auxiliares usados pelas regras existentes', fakeAsync(() => {
    render(); select(2);
    component.nameGroup = ['Marca']; component.auxProduct = [catalog[0]];
    component.clearFilters(); render();
    expect(component.auxFilter).toEqual([]);
    expect(component.auxPcProduct).toEqual([]);
    expect(component.auxProduct).toEqual([]);
    expect(component.nameGroup).toEqual([]);
    expect(component.CategoryFilter).toBeUndefined();
  }));

  it('restaura o preço nos controles e no slider', fakeAsync(() => {
    render(); price(0, '150'); price(1, '350');
    expect(ids()).toEqual([2, 3]);
    component.clearFilters(); render();
    const inputs = fixture.nativeElement.querySelectorAll('input[type=number]');
    expect(inputs[0].value).toBe('100'); expect(inputs[1].value).toBe('400');
    const slider = fixture.nativeElement.querySelector('ngx-slider');
    expect(slider.querySelector('.ngx-slider-pointer-min').getAttribute('aria-valuenow')).toBe('100');
    expect(slider.querySelector('.ngx-slider-pointer-max').getAttribute('aria-valuenow')).toBe('400');
  }));

  it('mantém preços com centavos consistentes entre campos, slider e produtos', fakeAsync(() => {
    render(); price(0, '200.3'); price(1, '350.7');
    expect(component.value).toBe(200.3); expect(component.highValue).toBe(350.7);
    expect(ids()).toEqual([3]);
    const slider = fixture.nativeElement.querySelector('ngx-slider');
    expect(slider.querySelector('.ngx-slider-pointer-min').getAttribute('aria-valuenow')).toBe('200.3');
    expect(slider.querySelector('.ngx-slider-pointer-max').getAttribute('aria-valuenow')).toBe('350.7');
    component.clearFilters(); render(); expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('aceita limpar repetidamente sem seleções', fakeAsync(() => {
    render(); component.clearFilters(); component.clearFilters(); render();
    expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('permite selecionar novamente depois de limpar', fakeAsync(() => {
    render(); select(2); component.clearFilters(); render(); select(3);
    expect(ids()).toEqual([2, 4]);
    expect(component.auxFilter).toEqual([3]);
  }));

  it('sincroniza a seleção entre os checkboxes mobile e desktop', fakeAsync(() => {
    render(); select(2);
    expect(checkbox(2, 'mobile').checked).toBeTrue();
    component.clearFilters(); render();
    expect(checkbox(2).checked).toBeFalse(); expect(checkbox(2, 'mobile').checked).toBeFalse();
  }));

  it('usa IDs distintos para os controles dos dois painéis', fakeAsync(() => {
    render();
    expect(checkbox(2).id).not.toBe(checkbox(2, 'mobile').id);
    const label = fixture.nativeElement.querySelector('label[for="desktop-category-2"]') as HTMLLabelElement;
    expect(label.control).toBe(checkbox(2));
    label.click(); render(); expect(ids()).toEqual([1, 3]);
  }));

  it('fecha o painel mobile ao limpar e reabre com critérios padrão', fakeAsync(() => {
    render(); component.clickMobileFilter(); render();
    expect(getComputedStyle(fixture.nativeElement.querySelector('.filter_Mobile')).top).toBe('0px');
    checkbox(2, 'mobile').click(); render();
    fixture.nativeElement.querySelector('.filter_Mobile .filter_Button_Mobile').click(); render();
    expect(component.ngxSlide).toBe(0); expect(ids()).toEqual([1, 2, 3, 4]);
    component.clickMobileFilter(); render();
    expect(checkbox(2, 'mobile').checked).toBeFalse(); expect(component.value).toBe(100);
  }));

  it('fechar pelo overlay preserva as seleções', fakeAsync(() => {
    render(); component.clickMobileFilter(); render(); checkbox(2, 'mobile').click(); render();
    fixture.nativeElement.querySelector('.overlay').click(); render();
    expect(component.auxFilter).toEqual([2]); expect(ids()).toEqual([1, 3]);
  }));

  it('não modifica o catálogo original nem inclui produtos de outras seções', fakeAsync(() => {
    const initial = JSON.stringify(catalog);
    render(); select(2); component.clearFilters(); render();
    expect(JSON.stringify(catalog)).toBe(initial); expect(ids()).not.toContain(99);
    expect(component.filterProduct).not.toBe(component.product);
  }));

  it('tolera catálogo vazio e grupos incompletos', fakeAsync(() => {
    component.product = []; component.categoriesGrouped = { 1: { name: 'Marca' } };
    component.options = { floor: 0, ceil: 1000 };
    expect(() => component.clearFilters()).not.toThrow();
    expect(ids()).toEqual([]); expect(component.highValue).toBe(1000);
  }));

  it('mantém os critérios sem implementação indisponíveis', fakeAsync(() => {
    render();
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('input[type=checkbox][disabled]')) as HTMLInputElement[];
    expect(inputs.length).toBe(16);
    inputs.forEach(input => { input.click(); expect(input.checked).toBeFalse(); });
    expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('identifica os critérios indisponíveis sem depender de tooltips', fakeAsync(() => {
    render();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.filter-unavailable')) as HTMLElement[];
    expect(rows.length).toBe(16);
    rows.forEach(row => {
      expect(row.getAttribute('aria-disabled')).toBe('true');
      expect(row.querySelector('.filter-unavailable-status')?.textContent).toBe('Indisponível');
      expect(row.querySelector('input:disabled')).not.toBeNull();
    });
    let panel = '.categories_Filter';
    if (getComputedStyle(fixture.nativeElement.querySelector(panel)).display === 'none') {
      component.clickMobileFilter(); render(); panel = '.filter_Mobile';
    }
    const badges = Array.from(fixture.nativeElement.querySelectorAll(panel + ' .filter-unavailable-status')) as HTMLElement[];
    badges.forEach(badge => expect(badge.getBoundingClientRect().width).toBeGreaterThan(0));
    expect(checkbox(2).closest('.filter-unavailable')).toBeNull();
  }));

  it('remove o cursor de clique apenas dos controles indisponíveis', fakeAsync(() => {
    render();
    const targets = Array.from(fixture.nativeElement.querySelectorAll('.categories_Filter .filter-unavailable input, .categories_Filter .filter-unavailable .slider')) as HTMLElement[];
    targets.forEach(target => expect(getComputedStyle(target).cursor).toBe('not-allowed'));
    expect(getComputedStyle(checkbox(2)).cursor).toBe('pointer');
    select(2); expect(ids()).toEqual([1, 3]);
    price(0, '150'); expect(ids()).toEqual([3]);
    component.clearFilters(); render(); expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('normaliza preços vazios ou fora dos limites sem desalinhar a lista', fakeAsync(() => {
    render(); price(0, '900'); expect(component.value).toBe(400); expect(ids()).toEqual([4]);
    price(0, ''); expect(component.value).toBe(100);
    price(1, '-2'); expect(component.highValue).toBe(100); expect(ids()).toEqual([1]);
    price(1, ''); expect(component.highValue).toBe(400); expect(ids()).toEqual([1, 2, 3, 4]);
  }));

  it('não reaplica filtros durante a revalidação dos limites de preço', fakeAsync(() => {
    render(); const apply = spyOn(component, 'filterAll').and.callThrough();
    component.value = 200;
    expect(() => render()).not.toThrow();
    expect(component.maxPriceControl.hasError('min')).toBeFalse();
    expect(apply).not.toHaveBeenCalled();
    expect(component.value).toBe(200);
  }));

  it('preserva os links de produtos após a limpeza', fakeAsync(() => {
    render(); select(2); component.clearFilters(); render();
    const links = fixture.nativeElement.querySelectorAll('a.product_Item') as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(4); expect(links[1].getAttribute('href')).toBe('/Product/Intel%20Office');
  }));
  it('restaura também os estados pristine e untouched dos preços', fakeAsync(() => {
    render(); price(0, '150'); component.minPriceControl.markAsTouched(); component.maxPriceControl.markAsDirty();
    component.clearFilters(); render();
    expect(component.minPriceControl.pristine).toBeTrue(); expect(component.minPriceControl.untouched).toBeTrue();
    expect(component.maxPriceControl.pristine).toBeTrue(); expect(component.maxPriceControl.untouched).toBeTrue();
  }));
});
