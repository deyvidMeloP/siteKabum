import { CUSTOM_ELEMENTS_SCHEMA, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { BannerComponent } from './components/banner/banner.component';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ApiKabumComponent } from './components/api-kabum/api-kabum.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Largura útil dos contêineres responsivos', () => {
  const components = [HomeComponent, BannerComponent, NavigationComponent, ApiKabumComponent,
    BannerPairComponent, NavbarComponent, FooterComponent, ProductMainComponent];
  let home: HTMLElement;
  let navbar: HTMLElement;
  let footer: HTMLElement;
  let product: HTMLElement;

  beforeEach(async () => {
    for (const component of components) {
      for (const hook of ['ngOnInit', 'ngAfterViewInit'] as const) {
        if (typeof (component.prototype as any)[hook] === 'function') {
          spyOn(component.prototype as any, hook).and.stub();
        }
      }
    }
    TestBed.configureTestingModule({
      declarations: components,
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [{ provide: KabumServiceService, useValue: { getDados: () => EMPTY } }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    TestBed.overrideTemplate(NavigationComponent,
      '<div class="navigation"><div class="navigation_pair"><app-api-kabum></app-api-kabum><app-banner-pair></app-banner-pair></div></div>');
    TestBed.overrideTemplate(ApiKabumComponent,
      '<div class="api_Sale"><div class="title_Sale">Ofertas</div><div class="box_All"></div></div>');
    const picture = '<img width="350" height="298" alt="Banner">';
    TestBed.overrideTemplate(BannerPairComponent,
      '<div class="banner_Pair"><div class="images_Banner">' + picture.repeat(2) +
      '</div><div class="banner_Departments">' + picture.repeat(3) + '</div></div>');
    TestBed.overrideTemplate(ProductMainComponent,
      '<div class="product_Box"><div class="box_Show_Information">' +
      '<h1 class="name_Product name_ProductMobile">Produto de teste</h1>' +
      '<div class="box_Show_All"><h1 class="name_Product">Produto de teste</h1></div>' +
      '<div class="box_Information"></div></div></div>');
    await TestBed.compileComponents();
    const create = (component: Type<unknown>): HTMLElement => {
      const fixture = TestBed.createComponent(component);
      fixture.detectChanges();
      return fixture.nativeElement;
    };
    home = create(HomeComponent);
    navbar = create(NavbarComponent);
    footer = create(FooterComponent);
    product = create(ProductMainComponent);
  });

  function inViewport(width: number, scrollbar: boolean, verify: (view: Document) => void): void {
    const frame = document.createElement('iframe');
    frame.style.cssText = `position:fixed;inset:0;border:0;height:900px;width:${width}px;z-index:10000`;
    document.body.appendChild(frame);
    try {
      const view = frame.contentDocument!;
      view.head.innerHTML = '<style>*{margin:0;padding:0;box-sizing:border-box}</style>';
      for (const style of Array.from(document.querySelectorAll('style'))) {
        view.head.appendChild(style.cloneNode(true));
      }
      view.documentElement.style.overflowY = scrollbar ? 'auto' : 'hidden';
      view.body.append(navbar.cloneNode(true), home.cloneNode(true), footer.cloneNode(true));
      const spacer = view.createElement('div');
      spacer.style.height = '1200px';
      view.body.appendChild(spacer);
      for (const image of Array.from(view.querySelectorAll('img'))) {
        if (!image.closest('app-banner, app-banner-pair')) {
          const logo = image.src.endsWith('/logo.svg');
          if (logo) {
            image.width = 155;
            image.height = 42;
          }
          image.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${logo ? 155 : 320}" height="${logo ? 42 : 240}"/>`;
          continue;
        }
        const banner = !!image.closest('.image');
        image.width = banner ? 3900 : 350;
        image.height = banner ? 1000 : 298;
        image.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}"/>`;
      }
      verify(view);
    } finally {
      frame.remove();
    }
  }

  for (const width of [375, 768, 1019, 1020, 1021, 1024, 1349, 1351, 1440]) {
    for (const scrollbar of [false, true]) {
      it(`acomoda Home e produto em ${width}px ${scrollbar ? 'com' : 'sem'} barra vertical`, () => {
        inViewport(width, scrollbar, view => {
          const root = view.documentElement;
          expect(root.clientWidth < width).toBe(scrollbar);
          expect(root.scrollWidth).withContext('Home').toBe(root.clientWidth);
          for (const selector of ['app-banner', '.slide_Images', '.navigation', '.api_Sale', '.banner_Pair',
            '.footer_Input', '.navbar_downMenu li']) {
            for (const element of Array.from(view.querySelectorAll(selector))) {
              const rect = element.getBoundingClientRect();
              if (!rect.width || !rect.height) continue;
              expect(rect.left).withContext(selector).toBeGreaterThanOrEqual(0);
              expect(rect.right).withContext(selector).toBeLessThanOrEqual(root.clientWidth);
            }
          }
          const slides = Array.from(view.querySelectorAll('.slide_Images .image'));
          expect(slides.length).toBe(11);
          const carousel = view.querySelector('.slide_Images')!.getBoundingClientRect();
          for (const slide of slides) {
            expect(slide.getBoundingClientRect().width).toBeCloseTo(carousel.width, 1);
            expect(slide.querySelector('img')!.getBoundingClientRect().width).toBeCloseTo(carousel.width, 1);
          }
          const pair = view.querySelector('.banner_Pair')!.getBoundingClientRect();
          expect(Math.abs(pair.left - (root.clientWidth - pair.right))).toBeLessThan(1);
          view.body.replaceChildren(product.cloneNode(true));
          expect(root.scrollWidth).withContext('ProductMain').toBe(root.clientWidth);
          for (const element of Array.from(view.querySelectorAll('.box_Show_Information, .name_Product'))) {
            const rect = element.getBoundingClientRect();
            if (!rect.width) continue;
            expect(rect.right).withContext(element.className).toBeLessThanOrEqual(root.clientWidth);
          }
        });
      });
    }
  }
});
