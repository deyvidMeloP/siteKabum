import { CommonModule } from '@angular/common';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Ciclo de vida do ProductMain', () => {
  let fixture: ComponentFixture<ProductMainComponent>;
  let params: Subject<any>;
  let products: Subject<any[]>[];
  let images: Subject<any[]>[];
  let departments: Subject<any[]>[];
  let offer2: Subject<string>;
  let offer3: Subject<string>;
  let observers: Array<{ callback: IntersectionObserverCallback; instance: any; target: Element }>;
  let swipers: any[];
  let originalSiblings: any;
  let service: any;
  let originalInitialize: PropertyDescriptor | undefined;
  let initializers: WeakMap<HTMLElement, jasmine.Spy>;
  const productData = [
    { idProduct: 1, name_Product: 'Produto A', price: 100, discount: 10, stock_Quantity: 5 },
    { idProduct: 2, name_Product: 'Produto B', price: 200, discount: 15, stock_Quantity: 8 }
  ];

  function request(list: Subject<any[]>[]): Subject<any[]> {
    const response = new Subject<any[]>();
    list.push(response);
    return response;
  }

  function swiper(): any {
    const instance: any = {
      activeIndex: 0, destroyed: false,
      slidePrev: jasmine.createSpy(), slideNext: jasmine.createSpy(), slideTo: jasmine.createSpy(),
      destroy: jasmine.createSpy().and.callFake(() => instance.destroyed = true)
    };
    swipers.push(instance);
    return instance;
  }

  function createFixture(): void {
    fixture = TestBed.createComponent(ProductMainComponent);
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    params = new Subject();
    products = [];
    images = [];
    departments = [];
    offer2 = new Subject();
    offer3 = new Subject();
    observers = [];
    swipers = [];
    initializers = new WeakMap();
    originalInitialize = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'initialize');
    Object.defineProperty(HTMLElement.prototype, 'initialize', {
      configurable: true,
      get: function(this: HTMLElement) {
        if (!initializers.has(this)) {
          const element = this as any;
          initializers.set(this, jasmine.createSpy().and.callFake(() => {
            element.swiper = swiper();
            element.on?.slideChange?.();
          }));
        }
        return initializers.get(this);
      }
    });
    spyOn(window, 'IntersectionObserver').and.callFake(function(callback, options) {
      const record = { callback, instance: undefined as any, target: undefined as any };
      record.instance = {
        observe: jasmine.createSpy().and.callFake(target => record.target = target),
        disconnect: jasmine.createSpy(), takeRecords: () => [],
        root: options?.root, rootMargin: options?.rootMargin, thresholds: [options?.threshold]
      };
      observers.push(record);
      return record.instance;
    });
    service = {
      getDados: jasmine.createSpy().and.callFake(() => request(products)),
      getDadosImages: jasmine.createSpy().and.callFake(() => request(images)),
      getDadosDepartments: jasmine.createSpy().and.callFake(() => request(departments)),
      command$: EMPTY, offerTime2$: offer2.asObservable(), offerTime3$: offer3.asObservable(),
      accountant_Time2: jasmine.createSpy(), accountant_Time3: jasmine.createSpy()
    };
    originalSiblings = (window as any).siblings_Swiper;
    (window as any).siblings_Swiper = () => {
      const element = fixture.nativeElement.querySelector('.swiper_All');
      if (element) { element.swiper = swiper(); }
    };
    await TestBed.configureTestingModule({
      declarations: [ProductMainComponent], imports: [CommonModule],
      providers: [
        { provide: KabumServiceService, useValue: service },
        { provide: ActivatedRoute, useValue: { params: params.asObservable() } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    createFixture();
  });

  afterEach(() => {
    fixture.destroy();
    params.complete();
    offer2.complete();
    offer3.complete();
    for (const response of [...products, ...images, ...departments]) { response.complete(); }
    if (originalSiblings === undefined) { delete (window as any).siblings_Swiper; }
    else { (window as any).siblings_Swiper = originalSiblings; }
    if (originalInitialize) { Object.defineProperty(HTMLElement.prototype, 'initialize', originalInitialize); }
    else { delete (HTMLElement.prototype as any).initialize; }
  });

  function emit(observer: typeof observers[number], visible: boolean): void {
    observer.callback([{ target: observer.target, isIntersecting: visible } as IntersectionObserverEntry], observer.instance);
  }

  function prepareImages(data: any[]): void {
    images[images.length - 1].next(data);
    fixture.detectChanges();
    departments[departments.length - 1].next([]);
  }

  function load(name = 'Produto A', imageData?: any[]): void {
    params.next({ productName: encodeURIComponent(name) });
    products[products.length - 1].next(productData);
    fixture.detectChanges();
    prepareImages(imageData ?? [{ productId: name === 'Produto A' ? 1 : 2, imageUrl: 'data:image/png;base64,AA==' }]);
    TestBed.inject(ApplicationRef).tick();
    tick();
  }

  it('cria o observer somente quando o elemento observado está na view', fakeAsync(() => {
    expect(observers.length).toBe(0);
    load();
    expect(observers.length).toBe(1);
    expect(observers[0].target.isConnected).toBeTrue();
    expect(observers[0].target).toBe(fixture.nativeElement.querySelector('.buy_ButtonMobile'));
  }));

  it('atualiza o binding fora da zona Angular sem alcançar outra barra no documento', fakeAsync(() => {
    load();
    fixture.autoDetectChanges();
    const external = document.createElement('div');
    external.className = 'buy_Mobile_Fixed';
    external.style.transform = 'translateY(42px)';
    document.body.prepend(external);
    try {
      const bar = fixture.nativeElement.querySelector('.buy_Mobile_Fixed');
      TestBed.inject(NgZone).runOutsideAngular(() => emit(observers[0], false));
      expect(bar.style.transform).toBe('translateY(0px)');
      TestBed.inject(NgZone).runOutsideAngular(() => emit(observers[0], true));
      expect(bar.style.transform).toBe('translateY(80px)');
      expect(external.style.transform).toBe('translateY(42px)');
    } finally { external.remove(); }
  }));

  it('desconecta o observer e ignora callbacks enfileirados após a destruição', fakeAsync(() => {
    load();
    const component = fixture.componentInstance;
    const observer = observers[0];
    fixture.destroy();
    expect(observer.instance.disconnect).toHaveBeenCalledTimes(1);
    expect(() => emit(observer, false)).not.toThrow();
    expect(component.isBuyButtonVisible).toBeTrue();
  }));

  it('desconecta quando o ngIf remove o alvo e observa o novo elemento', fakeAsync(() => {
    load();
    const old = observers[0];
    fixture.componentInstance.controller = 1;
    fixture.detectChanges();
    expect(old.instance.disconnect).toHaveBeenCalled();
    expect(() => emit(old, false)).not.toThrow();
    fixture.componentInstance.controller = 0;
    fixture.detectChanges();
    expect(observers.length).toBe(2);
    emit(old, false);
    expect(fixture.componentInstance.isBuyButtonVisible).toBeTrue();
    emit(observers[1], false);
    expect(fixture.componentInstance.isBuyButtonVisible).toBeFalse();
  }));

  it('libera carrosséis e observer anteriores ao trocar de produto', fakeAsync(() => {
    load();
    const old = observers[0];
    const oldSwipers = [...swipers];
    load('Produto B');
    expect(old.instance.disconnect).toHaveBeenCalled();
    expect(oldSwipers.every(instance => instance.destroy.calls.count() === 1)).toBeTrue();
    emit(old, false);
    expect(fixture.componentInstance.isBuyButtonVisible).toBeTrue();
    expect(fixture.componentInstance.produto.name_Product).toBe('Produto B');
  }));

  it('cancela respostas de produtos anteriores durante navegação rápida', fakeAsync(() => {
    params.next({ productName: 'Produto A' });
    const old = products[0];
    params.next({ productName: 'Produto B' });
    products[1].next(productData);
    old.next(productData.slice(0, 1));
    fixture.detectChanges();
    expect(old.observers.length).toBe(0);
    expect(fixture.componentInstance.produto.name_Product).toBe('Produto B');
    expect(images.length).toBe(1);
  }));

  it('cancela imagens e departamentos pendentes da visualização anterior', fakeAsync(() => {
    load();
    const oldImages = images[0];
    const oldDepartments = departments[0];
    load('Produto B');
    oldImages.next([{ productId: 1, imageUrl: 'antiga' }]);
    oldDepartments.next([{ productId: 1 }]);
    expect(oldImages.observers.length).toBe(0);
    expect(oldDepartments.observers.length).toBe(0);
    expect(fixture.componentInstance.images_Product[0].productId).toBe(2);
    expect(fixture.componentInstance.departments).toEqual([]);
  }));

  it('cancela requisições quando a página é destruída antes da resposta', fakeAsync(() => {
    params.next({ productName: 'Produto A' });
    fixture.destroy();
    products[0].next(productData);
    expect(products[0].observers.length).toBe(0);
    expect(images.length).toBe(0);
    expect(observers.length).toBe(0);
  }));

  it('cancela a inicialização dos carrosséis quando há destruição antes da renderização', fakeAsync(() => {
    params.next({ productName: 'Produto A' });
    products[0].next(productData);
    fixture.detectChanges();
    const elements = [...fixture.nativeElement.querySelectorAll('swiper-container')];
    images[0].next([{ productId: 1, imageUrl: '' }]);
    fixture.destroy();
    TestBed.inject(ApplicationRef).tick();
    tick();
    expect(elements.every((element: any) => element.initialize.calls.count() === 0)).toBeTrue();
  }));

  it('não inicializa a view antiga quando a rota muda antes da renderização', fakeAsync(() => {
    params.next({ productName: 'Produto A' });
    products[0].next(productData);
    fixture.detectChanges();
    const old = [...fixture.nativeElement.querySelectorAll('swiper-container')];
    images[0].next([{ productId: 1, imageUrl: '' }]);
    params.next({ productName: 'Produto B' });
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    tick();
    expect(old.every((element: any) => element.initialize.calls.count() === 0)).toBeTrue();
  }));

  it('aguarda a renderização mesmo quando produtos e imagens chegam antes da view', fakeAsync(() => {
    params.next({ productName: 'Produto A' });
    products[0].next(productData);
    images[0].next([{ productId: 1, imageUrl: '' }]);
    departments[0].next([]);
    expect(fixture.componentInstance.swiperFocus.length).toBe(0);
    TestBed.inject(ApplicationRef).tick();
    expect(fixture.componentInstance.swiperFocus.length).toBe(1);
    expect(fixture.componentInstance.swiperMobile.length).toBe(1);
    expect(fixture.componentInstance.swiper).toBeDefined();
  }));

  it('não permite que o callback de uma instância destruída afete outra instância', fakeAsync(() => {
    load();
    const old = observers[0];
    fixture.destroy();
    createFixture();
    load('Produto B');
    emit(old, false);
    expect(fixture.componentInstance.isBuyButtonVisible).toBeTrue();
  }));

  it('mantém uma subscription por temporizador e libera todas na destruição', fakeAsync(() => {
    load();
    load('Produto B');
    expect(offer2.observers.length).toBe(1);
    expect(offer3.observers.length).toBe(1);
    expect(service.accountant_Time2).toHaveBeenCalledTimes(1);
    expect(service.accountant_Time3).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(offer2.observers.length).toBe(0);
    expect(offer3.observers.length).toBe(0);
    expect(params.observers.length).toBe(0);
    expect(swipers.every(instance => instance.destroy.calls.count() === 1)).toBeTrue();
  }));

  it('não mantém o produto antigo nem cria observer para produto inexistente', fakeAsync(() => {
    load();
    params.next({ productName: 'Inexistente' });
    products[1].next(productData);
    fixture.detectChanges();
    tick();
    expect(fixture.nativeElement.querySelector('.product_Box')).toBeNull();
    expect(images.length).toBe(1);
    expect(fixture.componentInstance.produto).toBeUndefined();
  }));

  it('tolera uma lista de imagens vazia sem exceção na inicialização', fakeAsync(() => {
    expect(() => load('Produto A', [])).not.toThrow();
    expect(fixture.componentInstance.actual_Url).toBe('');
    expect(fixture.nativeElement.querySelector('.product_Box')).not.toBeNull();
    expect(() => fixture.componentInstance.changeSlide(0)).not.toThrow();
  }));

  it('usa handlers Angular nas setas sem acumular listeners entre produtos', fakeAsync(() => {
    load();
    fixture.nativeElement.querySelector('.arrow_Back').click();
    expect(fixture.componentInstance.swiperFocus[0].slideNext).toHaveBeenCalledTimes(1);
    load('Produto B');
    fixture.nativeElement.querySelector('.arrow_Top').click();
    expect(fixture.componentInstance.swiperFocus[0].slidePrev).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(() => fixture.componentInstance.changeSlide(0)).not.toThrow();
  }));
});
