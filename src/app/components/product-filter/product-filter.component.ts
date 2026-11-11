import { AfterRenderRef, DestroyRef, ElementRef, Injector, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter,  NgZone } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { filter, first } from 'rxjs';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { catchError, distinctUntilChanged, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { FormControl } from '@angular/forms';
import { filterCatalogByCategories, groupFilterCategories, indexFilterCategories } from './category-relations';
import { FilterRouteContext, ProductFilterStateService, filterContextKey } from '../../services/product-filter-state.service';


declare function swiper_Filter(): any

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit, AfterViewInit {
  private readonly visibilityDestroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewInjector = inject(Injector);
  private viewInitialization?: AfterRenderRef;
  private filterCarousel?: { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void };
  private destroyed = false;
  private readonly filterState = inject(ProductFilterStateService);
  private filterContext?: FilterRouteContext;
  private catalogReady = false;
  loadError = '';
  categoryIssues: string[] = [];
  private hierarchyIssues: string[] = [];
  CategoryFilter: any;
  name: string = '';
  param: string = '';
  section: any[] = [];
  products: any[] = []
  subsection: any[] = [];
  categories: any[] = [];
  productCategory: any[] = []
  auxPcProduct: any[] = []
  idSearch: any;
  searchSection: boolean = false;
  searchSubsection: boolean = false;
  categoriesSearch: any[] = []
  categoriesRelacionadas: any[] = []
  categoriesGrouped: { [key: string]: any } = {};
  convertCategoriesGrouped: any[] = []
  product: any[] = [];
  changeDisplay: any
  isContentVisible = true;
  filterProduct: any[] = [];
  auxProduct: any[] = []
  auxFilter: any[] = []
  nameGroup: any[] = []
  filterName: any
  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';
  readonly minPriceControl = new FormControl<number | null>(null);
  readonly maxPriceControl = new FormControl<number | null>(null);
  get value(): any { return this.minPriceControl.value; }
  set value(value: any) { this.minPriceControl.setValue(value ?? null, { emitEvent: false }); }
  get highValue(): any { return this.maxPriceControl.value; }
  set highValue(value: any) { this.maxPriceControl.setValue(value ?? null, { emitEvent: false }); }
  testa: any = 0
  ngxSlide: any = 0
  options: Options = {
    floor: 0, // Define um valor padrão para floor
    ceil: 2000,
    step: 1,
    enforceStep: false,
    translate: (value: number, label: LabelType): string => {
      return `R$ ${value}`;
    }
  };
  
  

 

  

  constructor(
    private productService: KabumServiceService,
    private sectionService: KabumServiceService,
    private subsectionService: KabumServiceService,
    private categoriesService: KabumServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private stateService: KabumServiceService,
    private productCategoryService: KabumServiceService,
    private commandSource: KabumServiceService,
    private route: ActivatedRoute
    
  ) {

   
  }

  ngOnInit(): void {
    this.visibilityDestroyRef.onDestroy(() => {
      this.destroyed = true;
      this.catalogReady = false;
      this.cancelViewInitialization();
    });
    this.startOfferCountdown();
    this.route.params.pipe(
      map(params => ({
        filterName: decodeURIComponent(params['filterName'] || ''),
        subsectionName: decodeURIComponent(params['subsectionName'] || ''),
        parentName: decodeURIComponent(params['parentName'] || '')
      })),
      distinctUntilChanged((previous, current) => filterContextKey(previous) === filterContextKey(current)),
      switchMap(context => {
        this.rememberFilters();
        this.cancelViewInitialization();
        this.filterContext = context;
        const name = context.parentName || context.subsectionName || context.filterName;
        this.name = name;
        this.resetCatalog();
        this.loadError = '';
        this.testa = name ? 1 : 0;
        return name ? this.loadData().pipe(
          catchError(() => {
            this.loadError = 'Não foi possível carregar os produtos. Tente novamente mais tarde.';
            return of(null);
          })
        ) : of(null);
      }),
      takeUntilDestroyed(this.visibilityDestroyRef)
    ).subscribe(data => {
      if (data) {
        this.products = data.products;
        this.productCategory = data.productCategory;
        this.section = data.section;
        this.subsection = data.subsection;
        this.categories = data.categories;
        const [floor, ceil] = this.SearchSection();
        this.options = { ...this.options, floor, ceil };
        this.minPriceControl.reset(floor, { emitEvent: false });
        this.maxPriceControl.reset(ceil, { emitEvent: false });
        this.catalogReady = true;
        this.restoreFilters();
      }
      this.testa = 0;
    });
    window.scrollTo(0, 0);
    this.changeDisplay = this.commandSource.command$.pipe(takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
      command => this.updateNavigationDisplay(command)
    );
  }

  /*
    this.route.paramMap.subscribe(params => {
      
      this.filterName = params.get('filterName');
     
    });

    this.stateService.currentFilterName.subscribe(async name => {
      
      this.name = name;
      if (this.name) {
        await this.loadData();
      }
    });*/

  private loadData() {
    return forkJoin({
      products: this.productService.getDados(),
      productCategory: this.productCategoryService.getProductCategory(),
      section: this.sectionService.getDadosSection(),
      subsection: this.subsectionService.getDadosSubsection(),
      categories: this.categoriesService.getDadosCategories()
    });
  }

  private resetCatalog(): void {
    this.catalogReady = false;
    this.products = [];
    this.productCategory = [];
    this.section = [];
    this.subsection = [];
    this.categories = [];
    this.categoryIssues = [];
    this.hierarchyIssues = [];
    this.product = [];
    this.filterProduct = [];
    this.categoriesSearch = [];
    this.categoriesRelacionadas = [];
    this.categoriesGrouped = {};
    this.convertCategoriesGrouped = [];
    this.auxFilter = [];
    this.auxPcProduct = [];
    this.auxProduct = [];
    this.nameGroup = [];
    this.idSearch = undefined;
    this.CategoryFilter = undefined;
    this.searchSection = false;
    this.searchSubsection = false;
    this.ngxSlide = 0;
    this.options = { ...this.options, floor: 0, ceil: 1000 };
    this.minPriceControl.reset(0, { emitEvent: false });
    this.maxPriceControl.reset(1000, { emitEvent: false });
  }

  private startOfferCountdown(): void {
    const deadlines = [1, 2, 3].map(months => {
      const date = new Date();
      return date.setMonth(date.getMonth() + months);
    });
    timer(0, 1000).pipe(takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(() => {
      const values = deadlines.map(deadline => {
        const seconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        const days = Math.floor(seconds / 86400).toString().padStart(2, '0');
        const hours = Math.floor(seconds % 86400 / 3600).toString().padStart(2, '0');
        const minutes = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0');
        const remaining = (seconds % 60).toString().padStart(2, '0');
        return days + 'D ' + hours + ' : ' + minutes + ' : ' + remaining;
      });
      [this.offer_Time1, this.offer_Time2, this.offer_Time3] = values;
    });
  }

  private cancelViewInitialization(): void {
    this.viewInitialization?.destroy();
    this.viewInitialization = undefined;
    this.filterCarousel?.destroy(true, true);
    this.filterCarousel = undefined;
  }

  private scheduleViewInitialization(): void {
    this.cancelViewInitialization();
    this.viewInitialization = afterNextRender(() => {
      this.viewInitialization = undefined;
      if (this.destroyed) { return; }
      const container = this.host.nativeElement.querySelector<HTMLElement & {
        swiper?: { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void }
      }>('.marker_Swiper');
      if (!container) { return; }
      this.initLess();
      swiper_Filter();
      this.filterCarousel = container.swiper;
    }, { injector: this.viewInjector });
  }

  ngAfterViewInit(): void {


  }

  updateNavigationDisplay(display: string): void {
    this.isContentVisible = display !== 'none';
  }

  SearchSection(): number[] {
    this.searchSection = false;
    this.searchSubsection = false;
    this.categoriesRelacionadas = [];
    this.categoriesSearch = [];
    const contextualSelection = this.resolveRouteSelection();
    this.idSearch = contextualSelection?.entity ?? this.section.find(section => section.name === this.name);
    if (this.idSearch && (contextualSelection?.section ?? true)) {
      this.searchSection = true;
      this.categoriesRelacionadas = this.subsection.filter(subsection => subsection.scId === this.idSearch.id);
    } else {
      this.idSearch = contextualSelection?.entity ?? this.subsection.find(subsection => subsection.name === this.name);
      this.searchSubsection = !!this.idSearch;
      if (this.idSearch?.scId) {
        this.categoriesRelacionadas = this.subsection.filter(subsection => subsection.parentId === this.idSearch.id);
      }
    }
    const scope = this.searchSection ? 'scId' : 'sbcId';
    this.product = this.idSearch ? [...new Map(this.products
      .filter(product => product[scope] === this.idSearch.id)
      .map(product => [product.idProduct, product])).values()] : [];
    if (this.idSearch) {
      this.categoriesSearch = this.categories.filter(category => category[scope] === this.idSearch.id)
        .map(category => ({ ...category, selected: false }));
    }
    this.filterProduct = cloneDeep(this.product);
    this.groupCategoriesByParent();
    return this.product.length ? this.product.reduce(([minimum, maximum], product) =>
      [Math.min(minimum, product.price), Math.max(maximum, product.price)],
      [this.product[0].price, this.product[0].price]) : [0, 1000];
  }

  private resolveRouteSelection(): { entity: any; section: boolean } | undefined {
    const context = this.filterContext;
    if (!context?.filterName) { return undefined; }
    const section = this.section.find(item => item.name === context.filterName);
    if (!section) { return undefined; }
    if (!context.subsectionName && !context.parentName) { return { entity: section, section: true }; }
    const subsection = this.subsection.find(item => item.name === context.subsectionName && item.scId === section.id && !item.parentId);
    if (!subsection) { return undefined; }
    if (!context.parentName) { return { entity: subsection, section: false }; }
    const child = this.subsection.find(item => item.name === context.parentName && item.parentId === subsection.id);
    return child ? { entity: child, section: false } : undefined;
  }

  private restoreFilters(): void {
    const snapshot = this.filterContext ? this.filterState.get(this.filterContext) : undefined;
    if (snapshot) {
      const validIds = new Set(Object.values(this.categoriesGrouped).flatMap(group => group.children.map((category: any) => category.id)));
      const { byId } = indexFilterCategories(this.categories);
      this.auxFilter = [...new Set(snapshot.categoryIds)].filter(id => validIds.has(id) && byId.has(id));
      const floor = this.options.floor ?? 0;
      const ceil = this.options.ceil ?? 1000;
      const minimum = Math.min(ceil, Math.max(floor, Number.isFinite(snapshot.minimumPrice) ? snapshot.minimumPrice : floor));
      const maximum = Math.min(ceil, Math.max(floor, Number.isFinite(snapshot.maximumPrice) ? snapshot.maximumPrice : ceil));
      this.minPriceControl.reset(Math.min(minimum, maximum), { emitEvent: false });
      this.maxPriceControl.reset(Math.max(minimum, maximum), { emitEvent: false });
    }
    this.applyCatalogFilters();
  }

  private rememberFilters(): void {
    if (!this.catalogReady || !this.filterContext || !this.idSearch) { return; }
    if (!this.auxFilter.length && this.value === this.options.floor && this.highValue === this.options.ceil) {
      this.filterState.clear(this.filterContext);
      return;
    }
    this.filterState.set({
      context: this.filterContext,
      categoryIds: this.auxFilter,
      minimumPrice: this.value,
      maximumPrice: this.highValue
    });
  }

  groupCategoriesByParent(): void {
    const { groups, issues } = groupFilterCategories(this.categoriesSearch);
    this.categoriesGrouped = groups;
    this.hierarchyIssues = issues;
    this.reportCategoryIssues(issues);
    this.convertCategoriesGrouped = Object.values(groups).flatMap(group => [group.name, ...group.children.map(child => child.id)]);
    this.scheduleViewInitialization();
  }

  private reportCategoryIssues(issues: string[]): void {
    const next = [...new Set(issues)].sort();
    if (next.length && JSON.stringify(next) !== JSON.stringify(this.categoryIssues)) {
      console.warn('Dados de categorias inconsistentes:', next);
    }
    this.categoryIssues = next;
  }

  initLess(){
    const categories_Box = this.host.nativeElement.querySelectorAll<HTMLElement>(".categories_Box_Items")
    const related_Items = this.host.nativeElement.querySelector<HTMLElement>(".related_Items");
    if (!related_Items) { return; }
    const related_Item = related_Items.querySelectorAll(".related_Item") as NodeListOf<HTMLElement>


    if(related_Item.length > 5){

      related_Items.style.height = "145px"
   
      const father = related_Items.parentElement as HTMLElement

      const seeMore = father.querySelector(".seeMore") as HTMLElement
      seeMore.style.display = "block"
      
    }

    categories_Box.forEach(box => {
      const height = box.offsetHeight;

      if(height > 120){

        const father = box.parentElement as HTMLElement

        const seeMore = father.querySelector(".seeMore") as HTMLElement

        seeMore.style.display = "block"

        box.style.height = '100px'
      }
  });
  
  }

  seeMore(event: Event){
    
    const buttonMore = event.target as HTMLElement

    const father = buttonMore.parentElement as HTMLElement

    if(father.classList.contains("categories_Related")){
      
      const related_Items = father.querySelector(".related_Items") as HTMLElement

      const buttonLess = father.querySelector(".seeLess") as HTMLElement

      related_Items.style.height = 'auto'

      buttonMore.style.display = 'none'

      buttonLess.style.display = 'block'
   }

   else{

    const categories_Box = father.querySelector(".categories_Box_Items") as HTMLElement

    const buttonLess = father.querySelector(".seeLess") as HTMLElement

    categories_Box.style.height = "auto"

    buttonLess.style.display = "block"
  
    buttonMore.style.display = "none"
   }
    

  }

  seeLess(event: Event){

    const buttonLess = event.target as HTMLElement

    const father = buttonLess.parentElement as HTMLElement

    if(father.classList.contains("categories_Related")){
      
      const related_Items = father.querySelector(".related_Items") as HTMLElement

      const buttonMore = father.querySelector(".seeMore") as HTMLElement

      related_Items.style.height = '145px'

      buttonMore.style.display = 'block'

      buttonLess.style.display = 'none'
   }
   
   else{

    const categories_Box = father.querySelector(".categories_Box_Items") as HTMLElement

    const buttonMore = father.querySelector(".seeMore") as HTMLElement

    categories_Box.style.height = "100px"

    buttonLess.style.display = "none"
    
    buttonMore.style.display = "block"

   }
    

  }

   teste(event: Event){
   
    const el = event.target as HTMLElement

    const el2 = el.parentElement as HTMLElement
   
    const father = el2.parentElement as HTMLElement
   
    const after = father.querySelector(".categories_box_Title span") as HTMLElement
    
    if (father.offsetHeight > 45){
     

      father.style.height = "38px"
     /*coloca display none em todos menos no title, para que tenha o tamanho do title apenas*/
        after.classList.add("rotated")
               
    }

    else{

      if(after.classList.contains("rotated")){

        after.classList.remove("rotated")
     
      }

      father.style.height = "auto"

    }

  
  }


  filter_Section(newName: string) {
    let subsection: boolean = false

    for(let sbc of this.subsection){

      if(sbc.parentId != 0 && sbc.name == newName){
        this.stateService.changeParentName(newName)
        break
      }

      else if(sbc.parentId == 0 && sbc.name == newName){
        this.stateService.changeSubsectionName(newName)
        break
      }

    }

    window.scrollTo(0, 0);
    
  }

  onMinInputChange(event: any) {
    const value = parseFloat(event) || 0; // Converte o valor para um número float ou define como 0 se for inválido
    this.value = value;
    this.applyPriceRange(true);
  }

  onMaxInputChange(value: number | null) {
    this.highValue = value;
    this.applyPriceRange(false);
  }

  private applyPriceRange(changedMinimum: boolean): void {
    const floor = this.options.floor ?? 0;
    const ceil = this.options.ceil ?? 2000;
    let minimum = Math.min(ceil, Math.max(floor, Number.isFinite(this.value) ? this.value : floor));
    let maximum = Math.min(ceil, Math.max(floor, Number.isFinite(this.highValue) ? this.highValue : ceil));
    if (minimum > maximum) {
      if (changedMinimum) { minimum = maximum; }
      else { maximum = minimum; }
    }
    this.value = minimum;
    this.highValue = maximum;
    this.filterAll(1, 0, null);
  }

  clearFilters(): void {
    for (const group of Object.values(this.categoriesGrouped)) {
      for (const category of group.children ?? []) {
        category.selected = false;
      }
    }
    this.auxFilter = [];
    this.auxPcProduct = [];
    this.auxProduct = [];
    this.nameGroup = [];
    this.minPriceControl.reset(this.options.floor ?? 0, { emitEvent: false });
    this.maxPriceControl.reset(this.options.ceil ?? 2000, { emitEvent: false });
    this.filterAll(1, 0, null);
    this.CategoryFilter = undefined;
    if (this.filterContext) { this.filterState.clear(this.filterContext); }
  }

onValueChange(event: any): void {
  this.applyCatalogFilters();
}

onCheckboxChange(category: any, groupName: any): void {
  if (category !== -1) {
    this.CategoryFilter = category;
    this.auxFilter = this.auxFilter.includes(category.id)
      ? this.auxFilter.filter(id => id !== category.id)
      : [...this.auxFilter, category.id];
  }
  this.applyCatalogFilters();
}

private applyCatalogFilters(): void {
  this.auxFilter = [...new Set(this.auxFilter)];
  const result = filterCatalogByCategories(this.product, this.categories, this.productCategory, this.auxFilter);
  this.auxPcProduct = result.links;
  this.nameGroup = result.groupNames;
  for (const group of Object.values(this.categoriesGrouped)) {
    for (const category of group.children ?? []) {
      category.selected = this.auxFilter.includes(category.id);
    }
  }
  this.reportCategoryIssues([...this.hierarchyIssues, ...result.issues]);
  this.filterProduct = cloneDeep(result.products.filter(product => product.price >= this.value && product.price <= this.highValue));
  this.rememberFilters();
}

filterAll(number: number, subcategory: any, event: any): void {
  if (number === 2) { this.onCheckboxChange(subcategory, event); }
  else if (number === 1) { this.applyCatalogFilters(); }
}

enterProductItem(event: MouseEvent){
     
  const targetElem = event.currentTarget as HTMLElement;
  const elm_Leave= targetElem.querySelector('.product_Buy') as HTMLElement;
  elm_Leave.style.display = 'none'

  const elm_Enter = targetElem.querySelector(".product_Buy_Enter") as HTMLElement
  elm_Enter.style.display = 'flex'

  const elm_Discount_Stock = targetElem.querySelector(".product_Discount_Stock") as HTMLElement
  elm_Discount_Stock.style.display = 'none'


}

leaveProductItem(event: MouseEvent){
    
  const targetElem = event.currentTarget as HTMLElement;
  const elm_Leave = targetElem.querySelector(".product_Buy") as HTMLElement
  elm_Leave.style.display = 'flex'

  const elm_Enter = targetElem.querySelector(".product_Buy_Enter") as HTMLElement
  elm_Enter.style.display = 'none'

  const elm_Discount_Stock = targetElem.querySelector(".product_Discount_Stock") as HTMLElement
  elm_Discount_Stock.style.display = 'flex'

}


clickMobileFilter(){
  this.ngxSlide = 1
  const filter = document.querySelector(".filter_Mobile") as HTMLElement
  const overlay = document.querySelector(".overlay") as HTMLElement


  window.scrollTo(0,0)
  filter.style.display = "block"
  overlay.style.display = "block"
}

closeAp(){
  this.ngxSlide = 0
  const filter = document.querySelector(".filter_Mobile") as HTMLElement
  const overlay = document.querySelector(".overlay") as HTMLElement

  filter.style.display = "none"
  overlay.style.display = "none"
}



}
