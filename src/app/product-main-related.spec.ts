import { CommonModule } from '@angular/common';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Produtos relacionados do ProductMain', () => {
  let fixture: ComponentFixture<ProductMainComponent>;
  let params: Subject<any>;
  let products: Subject<any[]>;
  let images: Subject<any[]>;
  let departments: Subject<any[]>;
  let service: any;
  let factory: jasmine.Spy;
  let catalog: any[];
  let originalInitialize: PropertyDescriptor | undefined;
  const picture = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>';

  beforeEach(async () => {
    originalInitialize = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'initialize');
    Object.defineProperty(HTMLElement.prototype, 'initialize', {
      configurable: true, value: function(this: any) {
        this.swiper = { activeIndex: 0, destroyed: false, destroy() { this.destroyed = true; }, slideTo() {} };
      }
    });
    params = new Subject();
    products = new Subject();
    images = new Subject();
    departments = new Subject();
    catalog = Array.from({ length: 8 }, (_, index) => ({
      idProduct: index + 1, name_Product: index === 1 ? 'Câmera 東京 50% / A & B' : 'Produto ' + (index + 1),
      maker: 'AMD', price: 100 + index, discount: 10, stock_Quantity: 5, imageUrl: picture
    }));
    service = {
      getDados: () => products.asObservable(), getDadosImages: () => images.asObservable(),
      getDadosDepartments: () => departments.asObservable(), command$: EMPTY, offerTime2$: EMPTY, offerTime3$: EMPTY,
      accountant_Time2: jasmine.createSpy(), accountant_Time3: jasmine.createSpy(),
      changeProductMainName: jasmine.createSpy()
    };
    factory = spyOn(ProductMainComponent.prototype as any, 'createRelatedSwiper').and.callThrough();
    await TestBed.configureTestingModule({
      declarations: [ProductMainComponent], imports: [CommonModule], schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: KabumServiceService, useValue: service },
        { provide: ActivatedRoute, useValue: { params: params.asObservable() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductMainComponent);
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    params.complete(); products.complete(); images.complete(); departments.complete();
    if (originalInitialize) { Object.defineProperty(HTMLElement.prototype, 'initialize', originalInitialize); }
    else { delete (HTMLElement.prototype as any).initialize; }
  });

  function load(id = 1, count = 8): void {
    params.next({ productName: catalog[id - 1].name_Product });
    products.next(catalog.slice(0, count));
    images.next([{ productId: id, imageUrl: picture }]);
    departments.next(catalog.slice(0, count).map(p => ({ productId: p.idProduct, dtName: 'Hardware', dtCategory2: 'CPU' })));
    TestBed.inject(ApplicationRef).tick();
    tick(100);
  }

  function cards(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.siblings_Slide'));
  }

  it('inicializa somente o carrossel pertencente à view', fakeAsync(() => {
    const foreign = document.createElement('div');
    foreign.className = 'swiper_All';
    document.body.prepend(foreign);
    try {
      load();
      expect(fixture.componentInstance.swiper.el).toBe(fixture.nativeElement.querySelector('.swiper_All'));
      expect((foreign as any).swiper).toBeUndefined();
      expect(factory).toHaveBeenCalledTimes(1);
    } finally { foreign.remove(); }
  }));

  it('mantém todos os IDs relacionados sem incluir o produto atual', fakeAsync(() => {
    load();
    expect(fixture.componentInstance.siblingsList.map(p => p.idProduct)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(cards().length).toBe(7);
  }));

  it('expõe controles de navegação por teclado com nome acessível', fakeAsync(() => {
    load();
    expect(cards()[0].tagName).toBe('BUTTON');
    expect(cards()[0].type).toBe('button');
    expect(cards()[0].getAttribute('role')).toBeNull();
    expect(cards()[0].getAttribute('aria-label')).toBe('Ver produto Câmera 東京 50% / A & B');
    expect(cards()[0].disabled).toBeFalse();
  }));

  it('envia o nome original para a navegação central sem codificá-lo', fakeAsync(() => {
    load(); cards()[0].click();
    expect(service.changeProductMainName).toHaveBeenCalledOnceWith('Câmera 東京 50% / A & B');
  }));

  it('abre exatamente o segundo card selecionado', fakeAsync(() => {
    load(); cards()[1].click();
    expect(service.changeProductMainName).toHaveBeenCalledOnceWith('Produto 3');
  }));

  it('ignora o clique quando o Swiper identifica um arraste', fakeAsync(() => {
    load(); fixture.componentInstance.swiper.allowClick = false; cards()[0].click();
    expect(service.changeProductMainName).not.toHaveBeenCalled();
  }));

  it('respeita um evento já cancelado pelo carrossel', fakeAsync(() => {
    load(); const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    event.preventDefault(); cards()[0].dispatchEvent(event);
    expect(service.changeProductMainName).not.toHaveBeenCalled();
  }));

  it('permite um novo clique após o arraste terminar', fakeAsync(() => {
    load(); fixture.componentInstance.swiper.allowClick = false; cards()[0].click();
    fixture.componentInstance.swiper.allowClick = true; cards()[1].click();
    expect(service.changeProductMainName).toHaveBeenCalledOnceWith('Produto 3');
  }));

  it('não navega após a destruição da view', fakeAsync(() => {
    load(); const card = cards()[0]; fixture.destroy(); card.click();
    expect(service.changeProductMainName).not.toHaveBeenCalled();
  }));

  it('não navega por nomes vazios', fakeAsync(() => {
    load(); fixture.componentInstance.changeProductName('');
    expect(service.changeProductMainName).not.toHaveBeenCalled();
  }));

  it('desabilita um produto relacionado sem nome', fakeAsync(() => {
    catalog[1].name_Product = ''; load();
    expect(cards()[0].disabled).toBeTrue(); cards()[0].click();
    expect(service.changeProductMainName).not.toHaveBeenCalled();
  }));

  it('tolera nenhum produto relacionado', fakeAsync(() => {
    load(1, 1); expect(cards().length).toBe(0);
    expect(fixture.componentInstance.swiper.initialized).toBeTrue();
  }));

  it('tolera um único produto relacionado', fakeAsync(() => {
    load(1, 2); expect(cards().length).toBe(1); cards()[0].click();
    expect(service.changeProductMainName).toHaveBeenCalledOnceWith(catalog[1].name_Product);
  }));

  it('mantém imagem e preço do produto correspondente', fakeAsync(() => {
    load(); expect(cards()[0].querySelector('img')!.getAttribute('src')).toBe(picture);
    expect(cards()[0].textContent).toContain('101');
  }));

  it('mantém a largura da imagem dentro do card', fakeAsync(() => {
    load(); const card = cards()[0].getBoundingClientRect(), image = cards()[0].querySelector('img')!.getBoundingClientRect();
    expect(card.width).toBe(100); expect(image.width).toBeLessThanOrEqual(card.width);
  }));

  it('inclui o espaçamento no cálculo do Swiper', fakeAsync(() => {
    load(); const swiper = fixture.componentInstance.swiper;
    expect(swiper.slidesGrid[1] - swiper.slidesGrid[0]).toBe(140);
  }));

  it('permite alcançar o último card sem cortá-lo', fakeAsync(() => {
    load(); const swiper = fixture.componentInstance.swiper;
    swiper.slideTo(cards().length - 1, 0);
    const last = cards().at(-1)!.getBoundingClientRect(), container = swiper.el.getBoundingClientRect();
    expect(last.left).toBeGreaterThanOrEqual(container.left - 1);
    expect(last.right).toBeLessThanOrEqual(container.right + 1);
  }));

  it('vincula as duas setas somente à instância local', fakeAsync(() => {
    load(); const swiper = fixture.componentInstance.swiper;
    expect(swiper.navigation.prevEl).toBe(fixture.nativeElement.querySelector('.siblings_Back'));
    expect(swiper.navigation.nextEl).toBe(fixture.nativeElement.querySelector('.siblings_Next'));
  }));

  it('avança e retorna pelas setas sem duplicar ações', fakeAsync(() => {
    load(); const swiper = fixture.componentInstance.swiper;
    fixture.nativeElement.querySelector('.siblings_Next').click();
    expect(swiper.activeIndex).toBe(1);
    swiper.slideTo(1, 0);
    fixture.nativeElement.querySelector('.siblings_Back').click();
    expect(swiper.activeIndex).toBe(0);
  }));

  it('destrói a instância anterior ao reutilizar ProductMain', fakeAsync(() => {
    load(); const previous = fixture.componentInstance.swiper, destroy = spyOn(previous, 'destroy').and.callThrough();
    load(2); expect(destroy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.swiper).not.toBe(previous);
    expect(fixture.componentInstance.siblingsList.map(p => p.idProduct)).toEqual([1, 3, 4, 5, 6, 7, 8]);
  }));

  it('não acumula instâncias durante mudanças rápidas de produto', fakeAsync(() => {
    load(); load(2); load(3);
    expect(factory).toHaveBeenCalledTimes(3);
    expect(fixture.componentInstance.produto.idProduct).toBe(3);
    expect(fixture.componentInstance.swiper.el.swiper).toBe(fixture.componentInstance.swiper);
  }));

  it('libera listeners das setas ao destruir o componente', fakeAsync(() => {
    load(); const swiper = fixture.componentInstance.swiper, next = fixture.nativeElement.querySelector('.siblings_Next');
    const move = spyOn(swiper, 'slideNext').and.callThrough(); fixture.destroy(); next.click();
    expect(swiper.destroyed).toBeTrue(); expect(move).not.toHaveBeenCalled();
  }));

  it('cancela o carregamento pendente antes de criar o carrossel', fakeAsync(() => {
    params.next({ productName: catalog[0].name_Product }); fixture.destroy(); products.next(catalog);
    expect(products.observed).toBeFalse(); expect(factory).not.toHaveBeenCalled();
  }));

  it('não cria carrossel para um produto inexistente', fakeAsync(() => {
    params.next({ productName: 'Inexistente' }); products.next(catalog); fixture.detectChanges(); tick();
    expect(fixture.componentInstance.produto).toBeUndefined(); expect(factory).not.toHaveBeenCalled();
  }));
});
