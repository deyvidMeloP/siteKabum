import { AfterRenderRef, ElementRef, Injector, OnDestroy, QueryList, ViewChildren, afterNextRender, Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { OnInit} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import type { SwiperContainer } from 'swiper/element';
import type { Swiper } from 'swiper';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';



@Component({
  selector: 'app-banner-pair',
  templateUrl: './banner-pair.component.html',
  styleUrl: './banner-pair.component.css'
})
export class BannerPairComponent implements OnInit, AfterViewInit, OnDestroy {
  cont: any = 0
  nameSub: any[] = []
  dadosDoServiceBrands: any[] = [];
  produtoAll: any[] = [];
  produto: any[] = [];
  section: any[] = [];
  readonly departmentLayouts = new Map([
    ['CASA INTELIGENTE', { itemWidth: '10vw', imageWidth: '90%' }],
    ['CELULAR & SMARTPHONE', { itemWidth: '12vw', imageWidth: '75%' }],
    ['TABLETS, IPADS E E-READERS', { itemWidth: '14vw', imageWidth: '64.6%' }]
  ]);
  departments: any[] = [];
  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';
  tempoRestante1Subscription: Subscription | undefined;
  tempoRestante2Subscription: Subscription | undefined;
  tempoRestante3Subscription: Subscription | undefined;
  swiper: any;
  subSection: any = [];
  marker_Swiper: any = [];
  product_Swiper: any = [];
  departments_Swiper: any = [];
  mostSearch:any = [];
  swiperMobile: any = []
  @ViewChildren('pairSwiper', { read: ElementRef }) private carouselElements?: QueryList<ElementRef<SwiperContainer>>;
  private readonly destroy$ = new Subject<void>();
  private readonly managedSwipers = new Set<Swiper>();
  private readonly pendingProductResets = new Set<number>();
  private viewInitialization?: AfterRenderRef;
  private destroyed = false;
  private productsLoaded = false;
  private sectionsLoaded = false;
  constructor(
    private dadosService: KabumServiceService,
    private departService: KabumServiceService, private dadosServiceBrands: KabumServiceService,  private router: Router, private dadosProdutos: KabumServiceService, private timerService: KabumServiceService, 
    private stateService: KabumServiceService, private sectionService: KabumServiceService,
    private subSectionService: KabumServiceService, private readonly viewInjector?: Injector) {
 
   
  }

  testando: string = '';
  ngOnInit(): void {
    this.getDadosDoServico();
    this.getDadosBrands()
    this.getDadosDepartments()
    this.getDadosSection()
    this.getDadosSubsection()
    this.tempoRestante1Subscription = this.timerService.offerTime1$.pipe(takeUntil(this.destroy$)).subscribe(
      tempo => this.offer_Time1= tempo
    );
    this.timerService.accountant_Time1(); 

    this.tempoRestante2Subscription = this.timerService.offerTime2$.pipe(takeUntil(this.destroy$)).subscribe(
      tempo => this.offer_Time2= tempo
    );
    this.timerService.accountant_Time2(); 

    this.tempoRestante3Subscription = this.timerService.offerTime3$.pipe(takeUntil(this.destroy$)).subscribe(
      tempo => this.offer_Time3 = tempo
    );
    this.timerService.accountant_Time3(); 

    

    
  }

  ngAfterViewInit(): void {
  
   /*

    const swiperContainer = document.querySelector('a');
  
      this.swiper = (swiperContainer as any).swiper;
      const backButto = document.querySelector('.Volta');
     
      if (backButto) {
        backButto.addEventListener('click', this.swipeBack.bind(this));
      }

      const swiper_Marker = document.querySelector('')
      
    */
  }



  ngOnDestroy(): void {
    this.destroyed = true;
    this.viewInitialization?.destroy();
    this.viewInitialization = undefined;
    this.destroy$.next();
    this.destroy$.complete();
    for (const swiper of this.managedSwipers) {
      if (!swiper.destroyed) { swiper.destroy(true, true); }
    }
    this.managedSwipers.clear();
    this.marker_Swiper = [];
    this.product_Swiper = [];
    this.departments_Swiper = [];
    this.pendingProductResets.clear();
  }

  private scheduleViewInitialization(): void {
    if (this.destroyed || !this.viewInjector) { return; }
    this.viewInitialization?.destroy();
    this.viewInitialization = afterNextRender(() => {
      this.viewInitialization = undefined;
      if (this.destroyed) { return; }
      this.initializeSwipers();
    }, { injector: this.viewInjector });
  }

  private initializeGroup(className: string, params: object): Swiper[] {
    return (this.carouselElements?.toArray() ?? [])
      .map(reference => reference.nativeElement)
      .filter(element => element.isConnected && element.tagName === 'SWIPER-CONTAINER' && element.classList.contains(className))
      .map(element => {
        if (!element.swiper || element.swiper.destroyed) {
          Object.assign(element, params);
          element.initialize();
        }
        const swiper = element.swiper;
        this.managedSwipers.add(swiper);
        swiper.update();
        return swiper;
      });
  }

  private initializeSwipers(): void {
    const swiperParams2 = {
      simulateTouch: true,
      allowTouchMove: true,
      breakpoints:{
        1020:{
          simulateTouch: false,
          allowTouchMove: false
        }
      },
      on: {
        init() {/*trava a inicilização e inicia por aqui */
          // ...
        }
      }
    };
    const swiperParams3 = {
      slidesPerView: 'auto',
      breakpoints:{
        1020:{
          spaceBetween: 0
        }
      },
      on: {
        init() {/*trava a inicilização e inicia por aqui */
          // ...
        }
      }
    };
    const swiperParams = {
      updateOnWindowResize: true,

      on: {
        init() {/*trava a inicilização e inicia por aqui */
          // ...
        },
      },
    };
    this.marker_Swiper = this.initializeGroup('marker_Swiper', swiperParams2);
    if (this.sectionsLoaded) {
      this.departments_Swiper = this.initializeGroup('departments_Swiper', swiperParams3);
    }
    if (this.productsLoaded) {
      this.product_Swiper = this.initializeGroup('swiper_Product', swiperParams);
    }
    for (const index of this.pendingProductResets) {
      const swiper = this.product_Swiper[index];
      if (!swiper) { continue; }
      const count = index === 0 ? this.produto.length : this.mostSearch.length;
      swiper.slideTo(0, 0);
      if (count <= (index === 0 ? 5 : 4)) { swiper.disable(); }
      else { swiper.enable(); }
      this.pendingProductResets.delete(index);
    }
  }

  swipeMove(className: string, index: any){
    
    switch(className){

      case "IconBackwardPair":
        
        if(this.product_Swiper[index]){
        
          this.product_Swiper[index].slidePrev();

        }
      break;

      case "IconForwardPair":
       
        if(this.product_Swiper[index]){
          
          this.product_Swiper[index].slideNext();

        }
      break;

      case "marker_Back":

      if(this.marker_Swiper[index]){
          
        this.marker_Swiper[index].slidePrev();

      }

      break;

      case "departments_Back":

      if(this.departments_Swiper[index]){
          
        this.departments_Swiper[index].slidePrev();

      }

      break;
      
      case "departments_Next":

      if(this.departments_Swiper[index]){
          
        this.departments_Swiper[index].slideNext();

      }

      break;
    }

  }

  swipeNext(index: any): void {
   
    if (this.marker_Swiper[index]) {
     
      this.marker_Swiper[index].slideNext();

    }
  }

  getDadosSubsection(){

    this.subSectionService.getDadosSubsection().pipe(takeUntil(this.destroy$)).subscribe(
  
      (data: any[]) =>{
  
        this.subSection = data       
  
      }
  
    )
  }
  getDadosDoServico() {
    this.dadosProdutos.getDados().pipe(takeUntil(this.destroy$)).subscribe(
      (data: any[]) => {
        this.produtoAll = data;
        this.produto = this.produtoAll;
        this.MostSearch('TODOS');
        this.productsLoaded = true;
        this.scheduleViewInitialization();
      }
    );
  }

  teste(){

    this.cont +=1
    this.submenu_Click(this.cont)
  

  }

  MostSearch(filter: string){
    const departmentIds = new Set(this.departments
      .filter(department => department.dtName.toLocaleUpperCase() === filter)
      .map(department => department.productId));

    this.mostSearch = this.produtoAll
      .filter(product => product && Number.isFinite(product.visits)
        && (filter === 'TODOS' || departmentIds.has(product.idProduct)))
      .map(product => cloneDeep(product))
      .sort((a, b) => b.visits - a.visits);
  }

  submenu_Click(scId: number){
    const submenu_Opt = document.querySelector(".submenu_Opt") as HTMLElement
  this.nameSub = []
   submenu_Opt.style.display = "none"
  for(let subsection of this.subSection){
  
    if(subsection.scId == scId){
  
      this.nameSub.push(subsection.name)
  
    }
  
  
  
    submenu_Opt.style.display = "flex"
   
  }
  
  
   
    
  }

  getDadosSection(){
   
    this.sectionService.getDadosSection().pipe(takeUntil(this.destroy$)).subscribe(
      (data: any[]) => {
        this.section = data;
        this.sectionsLoaded = true;
        this.scheduleViewInitialization();
      },
    );

  }
  

  getDadosBrands() {
    this.dadosServiceBrands.getDadosBrands().pipe(takeUntil(this.destroy$)).subscribe(
      (data: any[]) => {
        this.dadosDoServiceBrands = data;
      },
    );

  }
  
  getDadosDepartments() {
    this.departService.getDadosDepartments().pipe(takeUntil(this.destroy$)).subscribe(
      (data: any[]) => {
        this.departments = data;
      },

      
    );

    
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

  navegarParaProductMain(produto: any) {
    this.dadosService.registerProductVisit(produto.idProduct).subscribe({
      error: error => console.error('Erro ao registrar visita:', error)
    });

    const name: string = produto.name_Product
    this.stateService.changeProductMainName(name)
    window.scrollTo(0, 0);
    
 }

 filter_Marker(category: string ,event: any){
    if (this.destroyed) { return; }

  const filter = event.target.innerText
  

  switch(category){
    case 'highlight':
    
    this.produto = []

    if(filter == 'TODOS'){

      this.produto = this.produtoAll
    }

    else{

      let name: string = '' 
      let aux = []
      
      for(let dtp of this.departments){

        name = dtp.dtName
        
        name =  name.toLocaleUpperCase()

        if(filter == name){

          aux.push(dtp.productId)
      
        }
      }

      for(let pd of this.produtoAll){

        for(let idProduct of aux){

          if(pd.idProduct == idProduct){
  
           this.produto.push(pd)
           
          }
  
        }

      }

    }
    
    this.pendingProductResets.add(0);
    this.scheduleViewInitialization();

    break;

    case 'search':
  
    this.MostSearch(filter)

    this.pendingProductResets.add(1);
    this.scheduleViewInitialization();

    break;

  }
 
 }

 /*
  change_Marker(pos: number){
    let deptType: any[] = []
    this.produto = []

    switch(pos){

      case 1:
        for(let dtp of this.departments){
    
            deptType.push(dtp.productId)
            
        
        }
  
        break;

      case 2:

        for(let dtp of this.departments){

          if(dtp.dtName == "Áudio"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;

        case 3:

        for(let dtp of this.departments){

          if(dtp.dtName == "Computadores"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;

        case 4:

        for(let dtp of this.departments){

          if(dtp.dtName == "Conectividade"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;

        case 5:

        for(let dtp of this.departments){

          if(dtp.dtName == "Eletroportáteis"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;

        case 6:

        for(let dtp of this.departments){

          if(dtp.dtName == "Espaço Gamer"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;
      
        case 7:

        for(let dtp of this.departments){

          if(dtp.dtName == "Games"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;
        
        case 8:

        for(let dtp of this.departments){

          if(dtp.dtName == "Hardware"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;
        
        case 9:

        for(let dtp of this.departments){

          if(dtp.dtName == "Periféricos"){
    
            deptType.push(dtp.productId)
            
          }
        
        }

        break;
        
        case 10:

        for(let dtp of this.departments){

          if(dtp.dtName == "Projetores"){
    
            deptType.push(dtp.productId)
            
          }
        
        }
        break;
        

    }

    
    for(let pt of this.produtoAll){


      for(let deptT of deptType){

        if(pt.idProduct == deptT){

          this.produto.push(pt)

        }

      }
     
    }


  
  }

*/
  NavigationPage(name: string){

    this.stateService.changeFilterName(name);

  }

}
