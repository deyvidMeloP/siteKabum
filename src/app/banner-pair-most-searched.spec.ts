import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import Swiper from 'swiper';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Indicadores de Mais Procurados', () => {
  let fixture: ComponentFixture<BannerPairComponent>;
  let swipers: Swiper[];
  let hosts: HTMLElement[];

  beforeEach(async () => {
    swipers = []; hosts = [];
    spyOn(BannerPairComponent.prototype, 'ngOnInit').and.stub();
    spyOn(BannerPairComponent.prototype as any, 'initializeSwipers').and.stub();
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent], imports: [CommonModule, RouterTestingModule],
      providers: [{ provide: KabumServiceService, useValue: {} }], schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(BannerPairComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.produtoAll = [1, 2, 3, 4].map(id => ({ idProduct: id, visits: 10 - id, price: id * 100 }));
    fixture.componentInstance.departments = [
      { productId: 1, dtName: 'Hardware' }, { productId: 2, dtName: 'Computadores' },
      { productId: 3, dtName: 'Celular & Smartphone' }, { productId: 4, dtName: 'Computadores' }
    ];
    fixture.componentInstance.MostSearch('TODOS');
    fixture.detectChanges();
  });

  afterEach(() => {
    swipers.forEach(swiper => { if (!swiper.destroyed) { swiper.destroy(true, true); } });
    hosts.forEach(host => host.remove());
    fixture.destroy();
  });

  function indicator(): HTMLElement {
    return fixture.nativeElement.querySelector('.most_Search .marker_Swiper');
  }

  function carousel(width: number): Swiper {
    const host = document.createElement('div');
    host.style.cssText = `width:${width}px;overflow:hidden;position:relative`;
    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';
    wrapper.style.display = 'flex';
    indicator().querySelectorAll('swiper-slide').forEach(slide => wrapper.appendChild(slide.cloneNode(true)));
    host.appendChild(wrapper); fixture.nativeElement.appendChild(host); hosts.push(host);
    const value = indicator().getAttribute('slides-per-view');
    const swiper = new Swiper(host, {
      slidesPerView: value === 'auto' ? 'auto' : Number(value || 1),
      spaceBetween: Number(indicator().getAttribute('space-between')),
      loop: indicator().getAttribute('loop') === 'true', speed: 0
    });
    swipers.push(swiper);
    return swiper;
  }

  it('usa dimensões automáticas nos dois conjuntos sem alterar o loop', () => {
    const elements = fixture.nativeElement.querySelectorAll('.marker_Swiper');
    expect(elements.length).toBe(2);
    for (const element of elements) {
      expect(element.getAttribute('slides-per-view')).toBe('auto');
      expect(element.getAttribute('loop')).toBe('true');
      expect(element.getAttribute('space-between')).toBe('9');
    }
  });

  for (const width of [375, 768, 1024, 1440]) {
    it(`calcula o espaçamento pelas larguras reais em ${width}px`, fakeAsync(() => {
      const swiper = carousel(width); tick(30);
      const grid = (swiper as Swiper & { slidesGrid: number[] }).slidesGrid;
      for (let i = 0; i < swiper.slides.length - 1; i++) {
        expect(grid[i + 1] - grid[i])
          .toBeCloseTo(swiper.slides[i].getBoundingClientRect().width + 9, 0);
      }
    }));

    it(`alcança todos os indicadores e mantém um slide visível em ${width}px`, fakeAsync(() => {
      const swiper = carousel(width), seen = new Set<number>(); tick(30);
      for (let step = 0; step < 26; step++) {
        const area = swiper.el.getBoundingClientRect();
        const visible = swiper.slides.filter(slide => {
          const item = slide.getBoundingClientRect();
          return item.left >= area.left - 1 && item.right <= area.right + 1;
        });
        expect(visible.length).toBeGreaterThan(0);
        visible.forEach(slide => seen.add(Number(slide.getAttribute('data-swiper-slide-index'))));
        swiper.slideNext(0); tick(30);
      }
      expect(seen.size).toBe(13);
      expect(swiper.slides.length).toBe(13);
      expect(new Set(swiper.slides).size).toBe(13);
    }));
  }

  function select(text: string, occurrence = 0): void {
    const slides = Array.from(indicator().querySelectorAll('swiper-slide'));
    const slide = slides.filter(element => element.textContent?.trim() === text)[occurrence];
    slide.querySelector('h1')!.click(); fixture.detectChanges(); tick();
  }

  it('seleciona categorias e TODOS com IDs exatos sem alterar Destaque Ninja', fakeAsync(() => {
    const previous = fixture.componentInstance.produto;
    select('COMPUTADORES'); expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([2, 4]);
    select('HARDWARE'); expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([1]);
    select('TODOS'); expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([1, 2, 3, 4]);
    expect(fixture.componentInstance.produto).toBe(previous);
  }));

  it('mantém o mesmo resultado nas duas ocorrências explícitas de celular', fakeAsync(() => {
    select('CELULAR & SMARTPHONE', 0);
    expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([3]);
    select('CELULAR & SMARTPHONE', 1);
    expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([3]);
  }));

  it('mantém a última seleção em mudanças rápidas', fakeAsync(() => {
    select('COMPUTADORES'); select('TODOS'); select('HARDWARE');
    expect(fixture.componentInstance.mostSearch.map((p: { idProduct: number }) => p.idProduct)).toEqual([1]);
  }));
});
