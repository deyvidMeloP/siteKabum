import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Semântica dos controles de carrossel', () => {
  let banner: ComponentFixture<BannerPairComponent>;
  let product: ComponentFixture<ProductMainComponent>;

  beforeEach(async () => {
    spyOn(BannerPairComponent.prototype, 'ngOnInit').and.stub();
    spyOn(BannerPairComponent.prototype as any, 'initializeSwipers').and.stub();
    spyOn(ProductMainComponent.prototype, 'ngOnInit').and.stub();
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent, ProductMainComponent],
      imports: [CommonModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: KabumServiceService, useValue: {} },
        { provide: ActivatedRoute, useValue: { params: EMPTY } }
      ]
    }).compileComponents();
    banner = TestBed.createComponent(BannerPairComponent);
    product = TestBed.createComponent(ProductMainComponent);
    const products = [1, 2, 3].map(id => ({ idProduct: id, name_Product: 'Produto ' + id, price: id * 100, discount: 10, visits: 10 - id }));
    Object.assign(banner.componentInstance, {
      produtoAll: products, produto: [...products], mostSearch: [...products], section: [{ name: 'Hardware' }],
      departments: [{ productId: 1, dtName: 'Hardware' }, { productId: 2, dtName: 'Computadores' }]
    });
    Object.assign(product.componentInstance, {
      controller: 0, produto: products[0], actual_Url: 'one.png',
      images_Product: [{ imageUrl: 'one.png' }, { imageUrl: 'two.png' }], siblingsList: products.slice(1)
    });
    banner.detectChanges(); product.detectChanges();
  });

  afterEach(() => { banner.destroy(); product.destroy(); });

  function button(fixture: ComponentFixture<unknown>, selector: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(selector);
  }

  for (const [selector, label] of [
    ['.marker_Back', 'Categorias anteriores de Destaque Ninja'],
    ['.marker_Next', 'Próximas categorias de Destaque Ninja'],
    ['.IconBackwardPair', 'Produto anterior de Destaque Ninja'],
    ['.IconForwardPair', 'Próximo produto de Destaque Ninja'],
    ['.departments_Back', 'Departamento anterior'],
    ['.departments_Next', 'Próximo departamento']
  ]) {
    it('identifica o botão ' + label, () => {
      const control = button(banner, selector);
      expect(control.tagName).toBe('BUTTON'); expect(control.type).toBe('button');
      expect(control.getAttribute('aria-label')).toBe(label);
      expect(control.getAttribute('role')).toBeNull();
      expect(control.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
      expect(control.querySelector('svg')!.getAttribute('focusable')).toBe('false');
    });
  }

  it('distingue os nomes dos dois conjuntos de setas', () => {
    for (const control of Array.from(banner.nativeElement.querySelectorAll('.most_Search .carousel_Control')) as HTMLButtonElement[]) {
      expect(control.getAttribute('aria-label')).toContain('Mais Procurados');
    }
  });

  it('desabilita setas de conjuntos sem dados', () => {
    Object.assign(banner.componentInstance, { produto: [], mostSearch: [], section: [] }); banner.detectChanges();
    for (const control of Array.from(banner.nativeElement.querySelectorAll('.IconBackwardPair,.IconForwardPair,.departments_Back,.departments_Next')) as HTMLButtonElement[]) {
      expect(control.disabled).toBeTrue();
    }
  });

  it('retira da interação setas sem avanço disponível', () => {
    banner.detectChanges();
    expect(button(banner, '.IconForwardPair').disabled).toBeTrue();
    expect(button(banner, '.IconBackwardPair').disabled).toBeTrue();
    expect(button(banner, '.departments_Next').disabled).toBeTrue();
  });

  it('mantém um único binding por ativação de seta', () => {
    const move = spyOn(banner.componentInstance, 'swipeMove');
    banner.componentInstance.produto = Array.from({ length: 6 }, () => banner.componentInstance.produtoAll[0]); banner.detectChanges();
    button(banner, '.IconForwardPair').click(); expect(move).toHaveBeenCalledOnceWith('IconForwardPair', 0);
  });

  it('expõe categorias como botões de seleção sem tabindex positivo', () => {
    const controls = Array.from(banner.nativeElement.querySelectorAll('.category_Control')) as HTMLButtonElement[];
    expect(controls.length).toBe(26);
    for (const control of controls) {
      expect(control.type).toBe('button'); expect(control.tabIndex).toBe(0);
      expect(control.getAttribute('aria-label')).toContain(control.innerText);
      expect(['true', 'false']).toContain(control.getAttribute('aria-pressed')!);
    }
  });

  for (const [group, index] of [['highlight', 0], ['search', 1]] as const) {
    it('sincroniza a seleção de ' + group + ' com os IDs exibidos', () => {
      const carousel = banner.nativeElement.querySelectorAll('.marker_Swiper')[index] as HTMLElement;
      const controls = Array.from(carousel.querySelectorAll<HTMLButtonElement>('button'));
      controls.find(control => control.innerText === 'COMPUTADORES')!.click(); banner.detectChanges();
      expect(banner.componentInstance.selectedMarkers[group]).toBe('COMPUTADORES');
      const products = group === 'highlight' ? banner.componentInstance.produto : banner.componentInstance.mostSearch;
      expect(products.map((p: { idProduct: number }) => p.idProduct)).toEqual([2]);
      expect(controls.find(control => control.innerText === 'COMPUTADORES')!.getAttribute('aria-pressed')).toBe('true');
      expect(controls.find(control => control.innerText === 'TODOS')!.getAttribute('aria-pressed')).toBe('false');
    });
  }

  it('atualiza a op??o anunciada quando uma resposta restaura o cat?logo inteiro', () => {
    const service = TestBed.inject(KabumServiceService);
    (service as any).getDados = () => of(banner.componentInstance.produtoAll);
    banner.componentInstance.selectedMarkers.highlight = 'HARDWARE';
    banner.componentInstance.selectedMarkers.search = 'COMPUTADORES';
    banner.componentInstance.getDadosDoServico(); banner.detectChanges();
    expect(banner.componentInstance.selectedMarkers).toEqual({ highlight: 'TODOS', search: 'TODOS' });
  });

  it('ignora cliques cancelados sem alterar a opção ativa', () => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true }); event.preventDefault();
    button(banner, '.category_Control').dispatchEvent(event);
    expect(banner.componentInstance.selectedMarkers.highlight).toBe('TODOS');
  });

  it('não seleciona uma categoria após arraste', () => {
    banner.componentInstance.marker_Swiper = [{ allowClick: false }];
    const controls = banner.nativeElement.querySelectorAll('.category_Control');
    controls[2].dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(banner.componentInstance.selectedMarkers.highlight).toBe('TODOS');
  });

  it('permite ativação nativa de teclado sem depender do último ponteiro', () => {
    banner.componentInstance.marker_Swiper = [{ allowClick: false }];
    (banner.nativeElement.querySelectorAll('.category_Control')[2] as HTMLButtonElement).click();
    expect(banner.componentInstance.selectedMarkers.highlight).toBe('COMPUTADORES');
  });

  it('revela o indicador focado sem reorganizar o loop', () => {
    const control = button(banner, '.category_Control');
    spyOn(control, 'matches').and.returnValue(true);
    const slide = control.closest('swiper-slide'), move = jasmine.createSpy('slideTo');
    const host = { scrollLeft: 100 };
    banner.componentInstance.marker_Swiper = [{ slides: [slide], el: host, slideTo: move }];
    banner.componentInstance.revealMarker({ target: control } as unknown as FocusEvent, 0);
    expect(move).toHaveBeenCalledOnceWith(0, 0); expect(host.scrollLeft).toBe(0);
  });

  it('não movimenta indicadores ao receber foco do ponteiro', () => {
    const control = button(banner, '.category_Control'); spyOn(control, 'matches').and.returnValue(false);
    const move = jasmine.createSpy('slideTo'); banner.componentInstance.marker_Swiper = [{ slideTo: move }];
    banner.componentInstance.revealMarker({ target: control } as unknown as FocusEvent, 0);
    expect(move).not.toHaveBeenCalled();
  });

  it('remove os bindings dos botões ao destruir a Home', () => {
    const control = button(banner, '.marker_Next'), move = spyOn(banner.componentInstance, 'swipeNext');
    banner.destroy(); control.click(); expect(move).not.toHaveBeenCalled();
  });

  for (const [selector, label] of [
    ['.arrow_Top', 'Imagens anteriores do produto'], ['.arrow_Back', 'Próximas imagens do produto'],
    ['.siblings_Back', 'Produto relacionado anterior'], ['.siblings_Next', 'Próximo produto relacionado']
  ]) {
    it('usa botão nativo para ' + label, () => {
      const control = button(product, selector);
      expect(control.tagName).toBe('BUTTON'); expect(control.type).toBe('button');
      expect(control.getAttribute('aria-label')).toBe(label);
      expect(control.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    });
  }

  it('desabilita as setas da galeria quando não há imagens', () => {
    product.componentInstance.images_Product = []; product.detectChanges();
    expect(button(product, '.arrow_Top').disabled).toBeTrue();
    expect(button(product, '.arrow_Back').disabled).toBeTrue();
  });

  it('seleciona miniaturas com nome e estado sincronizados', () => {
    const controls = product.nativeElement.querySelectorAll('.gallery_Thumbnail') as NodeListOf<HTMLButtonElement>;
    expect(controls[1].getAttribute('aria-label')).toBe('Mostrar imagem 2 de 2');
    controls[1].click(); product.detectChanges();
    expect(product.componentInstance.actual_Url).toBe('two.png');
    expect(controls[1].getAttribute('aria-pressed')).toBe('true'); expect(controls[0].getAttribute('aria-pressed')).toBe('false');
  });

  for (const selector of ['.gallery_Thumbnail', '.siblings_Slide']) {
    it('revela o foco local em ' + selector + ' sem agendamento', () => {
      const control = button(product, selector), slide = control.closest<HTMLElement>('.swiper-slide, swiper-slide');
      spyOn(control, 'matches').and.returnValue(true);
      const move = jasmine.createSpy('slideTo'), el = { scrollLeft: 20, scrollTop: 30 };
      product.componentInstance.revealSlide({ target: control } as unknown as FocusEvent, { slides: [slide], el, slideTo: move } as any);
      expect(move).toHaveBeenCalledOnceWith(0, 0); expect(el.scrollLeft).toBe(0); expect(el.scrollTop).toBe(0);
    });
  }

  it('não movimenta a galeria por foco de ponteiro', () => {
    const control = button(product, '.gallery_Thumbnail'); spyOn(control, 'matches').and.returnValue(false);
    const move = jasmine.createSpy('slideTo');
    product.componentInstance.revealSlide({ target: control } as unknown as FocusEvent, { slideTo: move } as any);
    expect(move).not.toHaveBeenCalled();
  });

  it('ignora foco retido após destruir o produto', () => {
    const control = button(product, '.gallery_Thumbnail'); spyOn(control, 'matches').and.returnValue(true);
    const move = jasmine.createSpy('slideTo'); product.destroy();
    product.componentInstance.revealSlide({ target: control } as unknown as FocusEvent, { slideTo: move } as any);
    expect(move).not.toHaveBeenCalled();
  });

  it('nomeia os rádios móveis sem remover sua semântica nativa', () => {
    const controls = product.nativeElement.querySelectorAll('.swiper_Radio') as NodeListOf<HTMLInputElement>;
    expect(controls.length).toBe(2);
    expect(controls[1].getAttribute('aria-label')).toBe('Mostrar imagem 2 de 2');
    expect(controls[1].type).toBe('radio'); expect(controls[1].getAttribute('role')).toBeNull();
  });
});