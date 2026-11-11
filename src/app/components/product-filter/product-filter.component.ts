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
  loadError = '';
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
      this.cancelViewInitialization();
    });
    this.startOfferCountdown();
    this.route.params.pipe(
      map(params => decodeURIComponent(params['parentName'] || params['subsectionName'] || params['filterName'] || '')),
      distinctUntilChanged(),
      switchMap(name => {
        this.cancelViewInitialization();
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
    this.products = [];
    this.productCategory = [];
    this.section = [];
    this.subsection = [];
    this.categories = [];
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

  SearchSection():number[]{
    this.searchSection = false;
    this.searchSubsection = false;
    this.categoriesRelacionadas = []
    this.product = []
    if (!this.searchSection) {
      for (let sc of this.section) {
        /*verifica se o nome encontra o nome em section*/
      
        if (sc.name === this.name) {
    
          this.idSearch = sc;
          this.searchSection = true;
 /*se encontrar equivalencia ele procura equivalencias na segunda classe em subsection table*/
          for(let sbc of this.subsection){

            if(this.idSearch.id == sbc.scId){
              this.categoriesRelacionadas.push(sbc)
            }

          }

          for(let pt of this.products){

            if(pt.scId == this.idSearch.id){
                this.product.push(pt)
            }

          }

          
 /*roda todas as categories pra encontrar a equivalencia do id com os id da foreigh key em categories*/
          for(let ct of this.categories){

            if(this.idSearch.id == ct.scId && !ct.parentId){
             
              this.SearchSort(ct)
             /*envia o ct encontrado, que é um name de uma classe de categorias, para que ele seja ordenado com os seus subcategorias equivalentes */
            }
          }
          break; // Adicionado para sair do loop após encontrar a correspondência
        }
      }

      if (!this.searchSection) {
        
        for (let sbc of this.subsection) {
         
          if (sbc.name === this.name) {
            this.idSearch = sbc;
            this.searchSubsection = true;

            if(this.idSearch.scId){
            
              for(let sbc of this.subsection){

                if(this.idSearch.id == sbc.parentId){
                  this.categoriesRelacionadas.push(sbc)
                }
    
              }
           
          
            }
            
            for(let ct of this.categories){

              if(this.idSearch.id == ct.sbcId && !ct.parentId){
                this.SearchSort(ct)
              }

            }
            for(let pt of this.products){

              if(pt.sbcId == this.idSearch.id){
                  this.product.push(pt)


              }
  
            }
            break; // Adicionado para sair do loop após encontrar a correspondência
          }
        }
      }
    }
    
    
    let values: number[] = []

    this.filterProduct = cloneDeep(this.product)
   
    if(this.product.length > 0){
      values = [this.product[0].price, this.product[0].price];
      for(let pt of this.product){

        if(pt.price < values[0]){
          values[0] = pt.price
        }
  
        if(pt.price > values[1]){
          values[1] = pt.price
        }
      }
    }

    else{
      values[0] = 0
      values[1] = 1000
    }
   
this.groupCategoriesByParent()

return values

  }

  SearchSort(ct: any){

    this.categoriesSearch.push(ct)
    
    if(ct.scId){
      
      for(let ct2 of this.categories){

        if(ct2.scId){
    
          if(ct2.scId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
        
      }
    }

    else if(ct.sbcId){
      
      for(let ct2 of this.categories){

        if(ct2.sbcId){
  
          if(ct2.sbcId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
    
      }
    }
   
  }


  groupCategoriesByParent() {
    this.categoriesGrouped = this.categoriesSearch.reduce((acc, category) => {
      if (category.parentId === 0) {
        acc[category.id] = { ...category, children: [] };
      } else {
        if (!acc[category.parentId]) {
          acc[category.parentId] = { children: [] };
        }
        acc[category.parentId].children.push(category);
      }
      return acc;
    }, {});

    this.scheduleViewInitialization();

    let i = 0
    for (const key in this.categoriesGrouped) {
      if (this.categoriesGrouped.hasOwnProperty(key)) {
        const group = this.categoriesGrouped[key];
        this.convertCategoriesGrouped[i] = group.name
        i += 1
        group.children.forEach((child: any) => {
          this.convertCategoriesGrouped[i] = child.id
          i += 1
         
        });
      }
    }


    
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
  }

onValueChange(event: any): void {
  if(event == -1){
  
    this.filterProduct = cloneDeep(this.filterProduct.filter(pt => {
      return pt.price >= this.value && pt.price <= this.highValue;
    }));
  

  
  }

  else{

    this.filterProduct = cloneDeep(this.product.filter(pt => {
      return pt.price >= this.value && pt.price <= this.highValue;
    }));
  

  }

}

onCheckboxChange(category: any, groupName: any) {
  
 this.CategoryFilter = category
 this.auxPcProduct = []
  
  if(category == -1){


    let auxProduct: any[] = []
    this.filterProduct = []
    let state: boolean = false
    let count = 0
    
  
    if(this.auxFilter.length == 0){
     this.filterProduct = cloneDeep(this.product)
    
    }  
  
  else{
  
    this.filterProduct = cloneDeep(this.product)
   
    let stateAfterLoop: Boolean = false
    let sizeOff: any[] = [] 
    for(let aux of this.auxFilter){
    state = false
  
    for(let pc of this.productCategory){
    
     if(pc.ctId == aux){
      this.auxPcProduct.push(pc)
      state = true
     
     }
    
    }

    if(!state && !(sizeOff.includes(aux))){
      sizeOff.push(aux)
    }

    
    }

      state = false
      const size = this.auxFilter.length
  
      this.filterProduct = this.filterProduct.filter(fp => {
        state = false
          let parent: any[] = []
          let count = 0
          
          for(let pc of this.auxPcProduct){
          
            if(!(parent.includes(this.categories[pc.ctId - 1].parentId))){

              parent.push(this.categories[pc.ctId - 1].parentId)
           
            }
            
          }

          let newCount = 0
          for(let aux of sizeOff){

            if(parent.includes(this.categories[aux - 1].parentId)){
              newCount -= 1
            }
          }
        
           
          
          const size = parent.length + sizeOff.length + newCount
    
          for(let pc of this.auxPcProduct){
    
    
            if(pc.idProduct == fp.idProduct){
              count += 1
            }
    
          }
    
          if(count >= size){
    
            return fp
          
          }
      
        })
  
  }
  
  
  }

  else{
    let state: boolean = false
    let count = 0
    
    for(let af of this.auxFilter){
      
      if(af == category.id){
        this.auxFilter.splice(count, 1)
        state = true
      }
    count +=1
    }
  
    if(!state){
      
      this.auxFilter.push(category.id)
      
    }
  
    if(this.auxFilter.length == 0){
  
      for(let i = this.nameGroup.length - 1; i>=0; i--){

        if(this.nameGroup[i] == groupName){
       
          this.nameGroup.splice(i, 1)
          break
        }
  
      }

    }
    
  
  else{
    let sizeOff: any[] = [] 
    for(let aux of this.auxFilter){
    state = false
  
    for(let pc of this.productCategory){
    
     if(pc.ctId == aux){
      
      this.auxPcProduct.push(pc)
      state = true
     
    }

    
    }

    if(!state && !(sizeOff.includes(aux))){
      sizeOff.push(aux)
    }

    }


    if(this.auxPcProduct.length == 0){
      this.filterProduct = []
    }
    else{
      this.filterProduct = this.filterProduct.filter(fp => {
        state = false
          let parent: any[] = []
          let count = 0
          
          for(let pc of this.auxPcProduct){
          
            if(!(parent.includes(this.categories[pc.ctId - 1].parentId))){
           
              parent.push(this.categories[pc.ctId - 1].parentId)
           
            }
            
          }

          let newCount = 0
          for(let aux of sizeOff){

            if(parent.includes(this.categories[aux - 1].parentId)){
              newCount -= 1
            }
          }
              
          const size = parent.length + sizeOff.length + newCount
    
          for(let pc of this.auxPcProduct){
    
    
            if(pc.idProduct == fp.idProduct){
              count += 1
            }
    
          }
    
          if(count >= size){
    
            return fp
          
          }
        })
    }  
  }

  }

  }

filterAll(number: number, subcategory: any, event: any){
  switch(number){

    case 1:
    this.onCheckboxChange(-1, -2)
    this.onValueChange(-1)
    
    break;

    case 2:
    this.onValueChange(-2)
    this.onCheckboxChange(subcategory, event)
    
    break;
  }
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
