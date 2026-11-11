import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, Subject } from 'rxjs';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { FooterComponent } from './components/footer/footer.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Layout dos departamentos do BannerPair', () => {
  let banner: ComponentFixture<BannerPairComponent>;
  let footer: ComponentFixture<FooterComponent>;
  let sections: Subject<any[]>;
  let outside: HTMLElement;

  beforeEach(async () => {
    spyOn(BannerPairComponent.prototype, 'ngOnInit').and.stub();
    spyOn(window as any, 'swiper_Section').and.stub();
    sections = new Subject<any[]>();
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent, FooterComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [{
        provide: KabumServiceService,
        useValue: { getDadosSection: () => sections.asObservable(), command$: EMPTY }
      }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    footer = TestBed.createComponent(FooterComponent);
    footer.detectChanges();
    banner = TestBed.createComponent(BannerPairComponent);
    banner.detectChanges();
    document.body.append(footer.nativeElement, banner.nativeElement);
    outside = document.createElement('div');
    outside.className = 'departments_Item adjustDepartmentItem';
    outside.style.width = '321px';
    document.body.appendChild(outside);
    banner.componentInstance.getDadosSection();
  });

  afterEach(() => {
    sections.complete();
    outside.remove();
  });

  function render(names: Array<string | null | undefined>): HTMLElement[] {
    sections.next(names.map((name, id) => ({ id, name, url: '' })));
    banner.detectChanges();
    footer.detectChanges();
    return Array.from(banner.nativeElement.querySelectorAll('.departments_Swiper .departments_Item'));
  }

  it('renderiza com o footer e elementos externos sem título ou imagem', fakeAsync(() => {
    const footerItem = footer.nativeElement.querySelector('.departments_Item') as HTMLElement;
    expect(footerItem.querySelector('h1')).toBeNull();
    expect(footerItem.querySelector('img')).toBeNull();
    const originalFooter = footerItem.getAttribute('style');
    expect(() => {
      render(['CASA INTELIGENTE']);
      tick();
    }).not.toThrow();
    expect(footerItem.getAttribute('style')).toBe(originalFooter);
    expect(outside.style.width).toBe('321px');
  }));

  for (const [name, itemWidth, imageWidth] of [
    ['CASA INTELIGENTE', '10vw', '90%'],
    ['CELULAR & SMARTPHONE', '12vw', '75%'],
    ['TABLETS, IPADS E E-READERS', '14vw', '64.6%']
  ]) {
    it(`preserva as dimensões de ${name}`, () => {
      const [item] = render([name]);
      expect(item.style.width).toBe(itemWidth);
      expect(item.querySelector('img')!.style.width).toBe(imageWidth);
    });
  }

  it('mantém o estilo padrão quando o nome não tem ajuste ou está ausente', () => {
    for (const item of render(['HARDWARE', '', null, undefined])) {
      expect(item.style.width).toBe('');
      expect(item.querySelector('img')!.style.width).toBe('');
    }
  });

  it('remove as dimensões especiais quando o departamento muda', () => {
    const [item] = render(['CASA INTELIGENTE']);
    banner.componentInstance.section[0].name = 'HARDWARE';
    banner.detectChanges();
    expect(item.style.width).toBe('');
    expect(item.querySelector('img')!.style.width).toBe('');
  });

  it('não consulta títulos ou imagens para atualizar as dimensões', () => {
    const [item] = render(['CASA INTELIGENTE']);
    item.querySelector('h1')!.remove();
    item.querySelector('img')!.remove();
    banner.componentInstance.section[0].name = 'CELULAR & SMARTPHONE';
    expect(() => banner.detectChanges()).not.toThrow();
    expect(item.style.width).toBe('12vw');
  });

  it('acompanha listas vazias e múltiplas atualizações assíncronas', fakeAsync(() => {
    for (const size of [0, 1, 20, 0, 3]) {
      setTimeout(() => render(Array.from({ length: size }, (_, id) => `Departamento ${id}`)));
      tick();
      expect(banner.nativeElement.querySelectorAll('.departments_Swiper .departments_Item').length).toBe(size);
    }
  }));
});
