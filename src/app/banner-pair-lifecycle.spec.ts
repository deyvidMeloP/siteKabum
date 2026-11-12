import { CommonModule } from '@angular/common';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Ciclo de vida do BannerPair', () => {
  let fixture: ComponentFixture<BannerPairComponent>;
  let service: any;
  let responses: Record<string, Subject<any[]>>;
  let offers: Subject<string>[];
  let swipers: any[];
  let initialized: HTMLElement[];
  let originalInitialize: PropertyDescriptor | undefined;
  let outside: HTMLElement;
  const picture = 'data:image/png;base64,AA==';
  const products = (count: number) => Array.from({ length: count }, (_, index) => ({
    idProduct: index + 1, name_Product: `Produto ${index + 1}`, price: 100, discount: 0,
    stock_Quantity: 10, visits: count - index, imageUrl: picture
  }));

  function createFixture(): void {
    fixture = TestBed.createComponent(BannerPairComponent);
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    responses = Object.fromEntries(['products', 'brands', 'departments', 'section', 'subsection'].map(key => [key, new Subject<any[]>()]));
    offers = [new Subject<string>(), new Subject<string>(), new Subject<string>()];
    swipers = []; initialized = [];
    originalInitialize = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'initialize');
    Object.defineProperty(HTMLElement.prototype, 'initialize', {
      configurable: true,
      value: function(this: HTMLElement & { swiper: any }) {
        if (this.tagName !== 'SWIPER-CONTAINER') { throw new Error('Elemento incompatível'); }
        initialized.push(this);
        const instance: any = {
          destroyed: false, activeIndex: 0,
          update: jasmine.createSpy('update'), slidePrev: jasmine.createSpy('slidePrev'),
          slideNext: jasmine.createSpy('slideNext'), slideTo: jasmine.createSpy('slideTo'),
          enable: jasmine.createSpy('enable'), disable: jasmine.createSpy('disable'),
          destroy: jasmine.createSpy('destroy').and.callFake(() => instance.destroyed = true)
        };
        this.swiper = instance; swipers.push(instance);
      }
    });
    service = {
      getDados: () => responses['products'].asObservable(),
      getDadosBrands: () => responses['brands'].asObservable(),
      getDadosDepartments: () => responses['departments'].asObservable(),
      getDadosSection: () => responses['section'].asObservable(),
      getDadosSubsection: () => responses['subsection'].asObservable(),
      offerTime1$: offers[0].asObservable(), offerTime2$: offers[1].asObservable(), offerTime3$: offers[2].asObservable(),
      accountant_Time1: jasmine.createSpy(), accountant_Time2: jasmine.createSpy(), accountant_Time3: jasmine.createSpy(),
      changeFilterName: jasmine.createSpy(), changeProductMainName: jasmine.createSpy(),
      registerProductVisit: jasmine.createSpy().and.callFake(() => new Subject<void>())
    };
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent], imports: [CommonModule, RouterTestingModule],
      providers: [{ provide: KabumServiceService, useValue: service }], schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    outside = document.createElement('div'); outside.className = 'marker_Swiper';
    document.body.appendChild(outside); createFixture();
  });

  afterEach(() => {
    fixture.destroy(); outside.remove();
    Object.values(responses).forEach(response => response.complete()); offers.forEach(offer => offer.complete());
    if (originalInitialize) { Object.defineProperty(HTMLElement.prototype, 'initialize', originalInitialize); }
    else { delete (HTMLElement.prototype as any).initialize; }
  });

  function render(): void { fixture.detectChanges(); TestBed.inject(ApplicationRef).tick(); tick(); }
  function load(count = 8, sections = 3): void {
    responses['products'].next(products(count));
    responses['section'].next(Array.from({ length: sections }, (_, index) => ({ id: index + 1, name: `Seção ${index + 1}`, url: picture })));
    responses['brands'].next([]); responses['departments'].next([]); responses['subsection'].next([]);
    render();
  }

  it('inicializa somente os cinco elementos da própria view após a renderização', fakeAsync(() => {
    expect(initialized.length).toBe(0); load();
    expect(initialized.length).toBe(5);
    expect(initialized.every(element => fixture.nativeElement.contains(element))).toBeTrue();
    expect((outside as any).swiper).toBeUndefined();
    expect(fixture.componentInstance.marker_Swiper.length).toBe(2);
    expect(fixture.componentInstance.product_Swiper.length).toBe(2);
    expect(fixture.componentInstance.departments_Swiper.length).toBe(1);
  }));

  it('não consulta o documento para inicializar carrosséis', fakeAsync(() => {
    const query = spyOn(document, 'querySelectorAll').and.callThrough(); load();
    expect(query.calls.allArgs().some(args => /marker_Swiper|swiper_Product|departments_Swiper/.test(String(args[0])))).toBeFalse();
  }));

  it('não executa a função global de departamentos', fakeAsync(() => {
    const legacy = spyOn(window as any, 'swiper_Section'); load(); expect(legacy).not.toHaveBeenCalled();
  }));

  it('cancela as cinco consultas quando a Home é destruída antes das respostas', () => {
    expect(Object.values(responses).every(response => response.observed)).toBeTrue();
    fixture.destroy(); expect(Object.values(responses).every(response => !response.observed)).toBeTrue();
    Object.values(responses).forEach(response => response.next([{ id: 1 }]));
    expect(fixture.componentInstance.produtoAll).toEqual([]); expect(initialized.length).toBe(0);
  });

  it('encerra as três inscrições de ofertas e ignora emissões posteriores', () => {
    offers.forEach((offer, index) => offer.next(`Oferta ${index}`));
    fixture.destroy(); offers.forEach(offer => offer.next('Depois'));
    expect(offers.every(offer => !offer.observed)).toBeTrue();
    expect(fixture.componentInstance.offer_Time1).toBe('Oferta 0');
    expect(fixture.componentInstance.tempoRestante1Subscription?.closed).toBeTrue();
    expect(fixture.componentInstance.tempoRestante2Subscription?.closed).toBeTrue();
    expect(fixture.componentInstance.tempoRestante3Subscription?.closed).toBeTrue();
  });

  it('cancela a inicialização se a resposta chega imediatamente antes da destruição', fakeAsync(() => {
    responses['products'].next(products(8)); responses['section'].next([]);
    expect((fixture.componentInstance as any).viewInitialization).toBeDefined();
    fixture.destroy(); TestBed.inject(ApplicationRef).tick(); tick();
    expect(initialized.length).toBe(0);
    expect((fixture.componentInstance as any).viewInitialization).toBeUndefined();
  }));

  it('destrói a referência do callback agendado', () => {
    responses['products'].next(products(8)); const scheduled = (fixture.componentInstance as any).viewInitialization;
    const cancel = spyOn(scheduled, 'destroy').and.callThrough(); fixture.destroy(); expect(cancel).toHaveBeenCalled();
  });

  it('não agenda outro callback depois da destruição', fakeAsync(() => {
    fixture.destroy(); (fixture.componentInstance as any).scheduleViewInitialization();
    TestBed.inject(ApplicationRef).tick(); tick();
    expect((fixture.componentInstance as any).viewInitialization).toBeUndefined(); expect(initialized.length).toBe(0);
  }));

  it('libera todas as instâncias e referências ao sair da Home', fakeAsync(() => {
    load(); fixture.destroy();
    expect(swipers.length).toBe(5); swipers.forEach(swiper => expect(swiper.destroy).toHaveBeenCalledOnceWith(true, true));
    expect(fixture.componentInstance.product_Swiper).toEqual([]); expect(fixture.componentInstance.marker_Swiper).toEqual([]);
    expect(fixture.componentInstance.departments_Swiper).toEqual([]);
  }));

  it('não destrói duas vezes instâncias já liberadas pela biblioteca', fakeAsync(() => {
    load(); swipers[0].destroyed = true; fixture.destroy(); expect(swipers[0].destroy).not.toHaveBeenCalled();
    swipers.slice(1).forEach(swiper => expect(swiper.destroy).toHaveBeenCalledTimes(1));
  }));

  it('reutiliza instâncias sem acumular referências a cada resposta', fakeAsync(() => {
    load(); const originals = [...fixture.componentInstance.product_Swiper];
    for (let i = 0; i < 3; i++) { responses['products'].next(products(12)); render(); }
    expect(initialized.length).toBe(5); expect(fixture.componentInstance.product_Swiper).toEqual(originals);
    expect(fixture.componentInstance.product_Swiper.length).toBe(2);
  }));

  it('atualiza os slides somente depois de renderizar a resposta', fakeAsync(() => {
    load(1); const swiper = fixture.componentInstance.product_Swiper[0]; swiper.update.calls.reset();
    responses['products'].next(products(12)); expect(swiper.update).not.toHaveBeenCalled(); render();
    expect(swiper.update).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelectorAll('.swiper_Product')[0].querySelectorAll('swiper-slide').length).toBe(12);
  }));

  it('coalesce respostas anteriores à mesma renderização', fakeAsync(() => {
    responses['products'].next(products(1)); const first = (fixture.componentInstance as any).viewInitialization;
    const cancel = spyOn(first, 'destroy').and.callThrough(); responses['section'].next([]); render();
    expect(cancel).toHaveBeenCalled(); expect(initialized.length).toBe(5);
  }));

  it('inicializa departamentos quando sua resposta chega após a de produtos', fakeAsync(() => {
    responses['products'].next(products(8)); render(); expect(initialized.length).toBe(4);
    responses['section'].next([{ id: 1, name: 'HARDWARE', url: picture }]); render();
    expect(initialized.length).toBe(5); expect(fixture.nativeElement.querySelectorAll('.departments_Item').length).toBe(1);
  }));

  it('inicializa produtos quando sua resposta chega após a de departamentos', fakeAsync(() => {
    responses['section'].next([]); render(); expect(initialized.length).toBe(3);
    responses['products'].next(products(8)); render(); expect(initialized.length).toBe(5);
  }));

  for (const count of [0, 1, 3, 12]) {
    it(`mantém os carrosséis com ${count} produtos`, fakeAsync(() => {
      load(count); expect(initialized.length).toBe(5);
      expect(fixture.nativeElement.querySelectorAll('.swiper_Product')[0].querySelectorAll('swiper-slide').length).toBe(count);
      expect(fixture.componentInstance.produtoAll.length).toBe(count);
    }));
  }

  for (const count of [0, 1, 10]) {
    it(`mantém o carrossel com ${count} departamentos`, fakeAsync(() => {
      load(8, count); expect(fixture.componentInstance.departments_Swiper.length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.departments_Item').length).toBe(count);
    }));
  }

  it('mantém cada seta vinculada à instância correta uma única vez', fakeAsync(() => {
    load(); const component = fixture.componentInstance;
    for (let i = 0; i < 2; i++) {
      const pairs: Array<[string, any, string]> = [
        ['.marker_Back', component.marker_Swiper[i], 'slidePrev'], ['.marker_Next', component.marker_Swiper[i], 'slideNext'],
        ['.IconBackwardPair', component.product_Swiper[i], 'slidePrev'], ['.IconForwardPair', component.product_Swiper[i], 'slideNext']
      ];
      for (const [selector, swiper, method] of pairs) {
        (fixture.nativeElement.querySelectorAll(selector)[i] as HTMLElement).dispatchEvent(new MouseEvent('click'));
        expect(swiper[method]).toHaveBeenCalledTimes(1);
      }
    }
    (fixture.nativeElement.querySelector('.departments_Back') as HTMLElement).dispatchEvent(new MouseEvent('click'));
    (fixture.nativeElement.querySelector('.departments_Next') as HTMLElement).dispatchEvent(new MouseEvent('click'));
    expect(component.departments_Swiper[0].slidePrev).toHaveBeenCalledTimes(1);
    expect(component.departments_Swiper[0].slideNext).toHaveBeenCalledTimes(1);
  }));

  it('não duplica listeners após atualizar as respostas', fakeAsync(() => {
    load(); responses['products'].next(products(10)); render(); const swiper = fixture.componentInstance.product_Swiper[0];
    (fixture.nativeElement.querySelector('.IconForwardPair') as HTMLElement).dispatchEvent(new MouseEvent('click'));
    expect(swiper.slideNext).toHaveBeenCalledTimes(1);
  }));

  it('remove os handlers Angular dos elementos antigos ao destruir a Home', fakeAsync(() => {
    load(); const button = fixture.nativeElement.querySelector('.IconForwardPair') as HTMLElement;
    const move = spyOn(fixture.componentInstance, 'swipeMove').and.callThrough(); fixture.destroy();
    button.dispatchEvent(new MouseEvent('click')); expect(move).not.toHaveBeenCalled();
  }));

  it('cria novas instâncias ao retornar à Home sem reutilizar as destruídas', fakeAsync(() => {
    load(); const previous = [...swipers]; fixture.destroy(); createFixture(); load();
    expect(swipers.length).toBe(10); expect(fixture.componentInstance.product_Swiper.length).toBe(2);
    previous.forEach(swiper => expect(swiper.destroy).toHaveBeenCalledTimes(1));
    expect(fixture.componentInstance.product_Swiper.every((swiper: any) => !previous.includes(swiper))).toBeTrue();
  }));

  it('suporta ciclos rápidos repetidos sem listeners ou instâncias antigas', fakeAsync(() => {
    for (let cycle = 0; cycle < 4; cycle++) {
      load(); const old = [...fixture.componentInstance.marker_Swiper, ...fixture.componentInstance.product_Swiper, ...fixture.componentInstance.departments_Swiper];
      fixture.destroy(); old.forEach(swiper => expect(swiper.destroyed).toBeTrue()); createFixture();
    }
    load(); expect(initialized.length).toBe(25); expect(fixture.componentInstance.product_Swiper.length).toBe(2);
  }));

  it('não acessa a instância antes de renderizar uma seleção de indicador', fakeAsync(() => {
    expect(() => fixture.componentInstance.filter_Marker('highlight', { target: { innerText: 'TODOS' } })).not.toThrow();
    load(); expect(fixture.componentInstance.product_Swiper[0].slideTo).toHaveBeenCalledOnceWith(0, 0);
  }));

  it('reaplica indicadores sobre os slides renderizados e preserva a regra existente', fakeAsync(() => {
    load(8); const component = fixture.componentInstance;
    component.filter_Marker('highlight', { target: { innerText: 'TODOS' } }); render();
    expect(component.product_Swiper[0].enable).toHaveBeenCalled();
    component.filter_Marker('search', { target: { innerText: 'HARDWARE' } }); render();
    expect(component.product_Swiper[1].disable).toHaveBeenCalled();
    expect(component.product_Swiper[1].slideTo).toHaveBeenCalledOnceWith(0, 0);
  }));

  it('ignora o indicador depois da destruição sem alterar a lista', fakeAsync(() => {
    load(); const previous = fixture.componentInstance.produto; fixture.destroy();
    fixture.componentInstance.filter_Marker('highlight', { target: { innerText: 'HARDWARE' } });
    expect(fixture.componentInstance.produto).toBe(previous);
  }));

  it('mantém as navegações por departamento e produto', fakeAsync(() => {
    load(); fixture.componentInstance.NavigationPage('HARDWARE'); expect(service.changeFilterName).toHaveBeenCalledOnceWith('HARDWARE');
    fixture.componentInstance.navegarParaProductMain(products(1)[0]);
    expect(service.registerProductVisit).toHaveBeenCalledOnceWith(1); expect(service.changeProductMainName).toHaveBeenCalledOnceWith('Produto 1');
  }));
});

describe('Cancelamento HTTP do BannerPair', () => {
  it('cancela as cinco requisições reais do HttpClient ao destruir a Home', async () => {
    spyOn(KabumServiceService.prototype, 'accountant_Time1').and.returnValue('');
    spyOn(KabumServiceService.prototype, 'accountant_Time2').and.returnValue('');
    spyOn(KabumServiceService.prototype, 'accountant_Time3').and.returnValue('');
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent], imports: [CommonModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    const fixture = TestBed.createComponent(BannerPairComponent); fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController), requests = http.match(request => request.method === 'GET');
    expect(requests.length).toBe(5); fixture.destroy(); expect(requests.every(request => request.cancelled)).toBeTrue();
    http.verify();
  });
});
