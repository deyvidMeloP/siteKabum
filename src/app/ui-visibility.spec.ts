import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject, of } from 'rxjs';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Page visibility and responsive layout', () => {
  let navbar: ComponentFixture<NavbarComponent>;
  let footer: ComponentFixture<FooterComponent>;
  let filter: ComponentFixture<ProductFilterComponent>;
  let commands: Subject<string>;
  let navbarCommands: Subject<string>;
  let layoutListeners: Set<EventListener>;
  let mediaQuery: MediaQueryList;
  let frame: HTMLIFrameElement | undefined;

  beforeEach(async () => {
    // Stub before Angular resolves lifecycle hooks, not on an already compiled instance.
    spyOn(NavbarComponent.prototype, 'ngOnInit').and.stub();
    layoutListeners = new Set<EventListener>();
    mediaQuery = {
      media: '(max-width: 1020px)', matches: true,
      addEventListener: (_type: string, listener: EventListener) => layoutListeners.add(listener),
      removeEventListener: (_type: string, listener: EventListener) => layoutListeners.delete(listener)
    } as unknown as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery);
    commands = new Subject<string>();
    navbarCommands = new Subject<string>();
    const service = {
      command$: commands.asObservable(), commandNav$: navbarCommands.asObservable(),
      getDados: () => of([]), getDadosSection: () => of([]),
      getDadosSubsection: () => of([]),
      sendCommand: (value: string) => commands.next(value)
    };
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent, FooterComponent, ProductFilterComponent],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxSliderModule],
      providers: [
        { provide: KabumServiceService, useValue: service },
        { provide: ActivatedRoute, useValue: { params: EMPTY } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    navbar = TestBed.createComponent(NavbarComponent);
    // Isolate Swiper initialization; the responsive lifecycle in ngAfterViewInit still runs.
    // The real template, styles, view initialization and menu handlers still run.
    navbar.detectChanges();
    footer = TestBed.createComponent(FooterComponent);
    footer.detectChanges();
    filter = TestBed.createComponent(ProductFilterComponent);
    filter.detectChanges();
    // TestBed replaces its root element on each createComponent call.
    // Keep all three real component hosts attached for computed styles and global menu selectors.
    for (const fixture of [navbar, footer, filter]) {
      document.body.appendChild(fixture.nativeElement);
    }
  });

  afterEach(() => {
    frame?.remove();
    commands.complete();
    navbarCommands.complete();
  });

  function detectChanges(): void {
    footer.detectChanges();
    filter.detectChanges();
  }

  it('shows navbar, footer and filter by default', () => {
    expect(getComputedStyle(navbar.nativeElement.querySelector('.navbar')).display).toBe('flex');
    expect(getComputedStyle(footer.nativeElement.querySelector('footer')).display).not.toBe('none');
    const page = filter.nativeElement.querySelector('.product-filter-page');
    expect(getComputedStyle(page).display).toBe('flex');
    expect(getComputedStyle(page).backgroundColor).toBe('rgb(242, 243, 244)');
  });

  it('hides page content and footer when opening the menu, and restores them on close', () => {
    navbar.componentInstance.clickMenuMobile();
    detectChanges();
    expect(getComputedStyle(navbar.nativeElement.querySelector('.navbar')).display).toBe('flex');
    expect(getComputedStyle(navbar.nativeElement.querySelector('.menu_Hamburguer')).display).toBe('flex');
    expect(footer.nativeElement.querySelector('footer')).toBeNull();
    expect(getComputedStyle(filter.nativeElement.querySelector('.product-filter-page')).display).toBe('none');
    navbar.componentInstance.closeMenuMobile();
    detectChanges();
    expect(footer.nativeElement.querySelector('footer')).not.toBeNull();
    expect(getComputedStyle(filter.nativeElement.querySelector('.product-filter-page')).display).toBe('flex');
    expect(getComputedStyle(navbar.nativeElement.querySelector('.menu_Hamburguer')).display).toBe('none');
  });

  it('preserves hidden state when the filter view is recreated after loading', () => {
    filter.componentInstance.testa = 1;
    filter.detectChanges();
    commands.next('none');
    filter.componentInstance.testa = 0;
    detectChanges();
    expect(getComputedStyle(filter.nativeElement.querySelector('.product-filter-page')).display).toBe('none');
    commands.next('flex');
    detectChanges();
    expect(getComputedStyle(filter.nativeElement.querySelector('.product-filter-page')).display).toBe('flex');
  });

  it('uses the CSS viewport query and renders a layout change delivered outside Angular', () => {
    expect(window.matchMedia).toHaveBeenCalledOnceWith('(max-width: 1020px)');
    navbar.autoDetectChanges();
    footer.autoDetectChanges();
    filter.autoDetectChanges();
    navbar.componentInstance.clickMenuMobile();
    detectChanges();
    expect(footer.nativeElement.querySelector('footer')).toBeNull();
    TestBed.inject(NgZone).runOutsideAngular(() => {
      for (const listener of layoutListeners) {
        listener(new MediaQueryListEvent('change', { matches: false }));
      }
    });
    // No manual detectChanges or user interaction after the callback.
    expect(footer.nativeElement.querySelector('footer')).not.toBeNull();
    expect(getComputedStyle(filter.nativeElement.querySelector('.product-filter-page')).display).toBe('flex');
    expect(getComputedStyle(navbar.nativeElement.querySelector('.menu_Hamburguer')).display).toBe('none');
    expect(getComputedStyle(navbar.nativeElement.querySelector('.departments_Submenu')).display).toBe('none');
  });

  it('removes the layout listener and navbar command subscription on destruction', () => {
    expect(layoutListeners.size).toBe(1);
    // Exercise the original ngOnInit command subscription without starting Swiper timers.
    spyOn(window, 'setTimeout').and.returnValue(0);
    (NavbarComponent.prototype.ngOnInit as jasmine.Spy).and.callThrough();
    navbar.componentInstance.ngOnInit();
    const open = spyOn(navbar.componentInstance, 'clickMenuMobile').and.stub();
    spyOn(navbar.componentInstance, 'nextMobile').and.stub();
    navbarCommands.next('flex');
    expect(open).toHaveBeenCalledTimes(1);
    navbar.destroy();
    expect(layoutListeners.size).toBe(0);
    navbarCommands.next('flex');
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes destroyed page components from visibility changes', () => {
    const footerComponent = footer.componentInstance;
    const filterComponent = filter.componentInstance;
    footer.destroy();
    filter.destroy();
    commands.next('none');
    expect(footerComponent.isVisible).toBeTrue();
    expect(filterComponent.isContentVisible).toBeTrue();
  });

  for (const width of [375, 768, 1009, 1020, 1021, 1024, 1150, 1151, 1440]) {
    it(`renders real component markup and media queries at ${width}px`, () => {
      frame = document.createElement('iframe');
      frame.style.width = `${width}px`;
      frame.style.height = '900px';
      frame.style.border = '0';
      document.body.appendChild(frame);
      const doc = frame.contentDocument!;
      // Clone Angular-rendered markup and emitted styles into an independent viewport.
      // No app bootstrap or HTTP requests occur inside the frame.
      for (const style of Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))) {
        doc.head.appendChild(style.cloneNode(true));
      }
      doc.body.style.margin = '0';
      for (const fixture of [navbar, footer, filter]) {
        doc.body.appendChild(fixture.nativeElement.cloneNode(true));
      }
      const view = frame.contentWindow!;
      const style = (selector: string) => view.getComputedStyle(doc.querySelector(selector)!);
      expect(view.innerWidth).toBe(width);
      expect(style('.navbar').display).toBe('flex');
      expect(style('footer').display).not.toBe('none');
      expect(style('.product-filter-page').display).toBe('flex');
      expect(doc.querySelector('.navbar')!.getBoundingClientRect().height).toBeGreaterThan(0);
      expect(doc.querySelector('footer')!.getBoundingClientRect().height).toBeGreaterThan(0);
      expect(style('.navbar_Menu').display).toBe(width <= 1020 ? 'none' : 'flex');
      expect(style('.navbar_menuMobile').display).toBe(width <= 1020 ? 'flex' : 'none');
      expect(style('.items_Mobile').display).toBe(width <= 1020 ? 'block' : 'none');
      expect(style('.categories_Filter').display === 'none').toBe(width <= 1020);
      expect(style('.button_Sort_Mobile').display).toBe(width <= 1020 ? 'flex' : 'none');
    });
  }
});
