import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, OnInit, ElementRef,QueryList, OnDestroy, ViewChildren, ViewChild, NgZone, Injector, afterNextRender, AfterRenderRef, AfterRenderPhase} from '@angular/core';
import { KabumServiceService } from '../../../services/kabum-service.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { resolveCatalogName } from '../../../routing/catalog-route';
declare function swiperProductMain(): any;
import Swiper from 'swiper';
import { A11y, Navigation } from 'swiper/modules';

@Component({
  selector: 'app-product-main',
  templateUrl: './product-main.component.html',
  styleUrl: './product-main.component.css'
})
export class ProductMainComponent implements OnInit, OnDestroy{
  private readonly visibilityDestroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly productChanged = new Subject<void>();
  private readonly injector = inject(Injector);
  private viewInitialization?: AfterRenderRef;
  private loadVersion = 0;
  private destroyed = false;
  private siblingsReady = false;
  isBuyButtonVisible = true;

  dadosProductAll: any[] = [];
  produto: any;
  images_Product: any[] = [];
  zoom: boolean = true
  actual_Url: string = ''
  offer_Time2: string = '';
  offer_Time3: string = '';
  tempoRestante2Subscription: Subscription | undefined;
  tempoRestante3Subscription: Subscription | undefined;
  departments: any[] = [];
  siblingsList: any[] = []
  imageSinbling: any[] = [];
  changeDisplay: any
  controller: number = 0
  swiper: any
  swiperFocus: any = []
  swiperMobile: any = []
  private observedTarget?: HTMLElement;
  private observer?: IntersectionObserver;

  @ViewChild('observedElement')
  set observedElement(element: ElementRef<HTMLElement> | undefined) {
    this.disconnectObserver();
    this.observedTarget = element?.nativeElement;
    this.initializeObserver();
  }

  constructor(private productAll: KabumServiceService,  private imagesService: KabumServiceService, private elementRef: ElementRef, private timerService: KabumServiceService, private departService: KabumServiceService, 
    private commandSource: KabumServiceService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.route.params.pipe(takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(params => {
      this.productChanged.next();
      this.loadVersion++;
      this.resetProductView();
      this.produto = undefined;
      this.images_Product = [];
      this.isBuyButtonVisible = true;
      
      this.controller = 1
      this.departments = [];
      this.siblingsList = []
      this.imageSinbling = [];
      this.actual_Url = ''
      const name = params['productName'] || '';

      this.getDadosProductAll(name);
    });

    this.tempoRestante2Subscription = this.timerService.offerTime2$.subscribe(
      tempo => this.offer_Time2= tempo
    );
    this.timerService.accountant_Time2(); 

    this.tempoRestante3Subscription = this.timerService.offerTime3$.subscribe(
      tempo => this.offer_Time3 = tempo
    );
    this.timerService.accountant_Time3(); 
      
    this.changeDisplay = this.commandSource.command$.pipe(takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
      command => {
        this.updateNavigationDisplay(command);
      }
    );

   
  }

  private initializeObserver(): void {
    if (this.destroyed || !this.observedTarget?.isConnected || this.observer) {
      return;
    }
    const options: IntersectionObserverInit = {
      root: null, // Usa a viewport do navegador como o root
      rootMargin: '0px', // Margem ao redor da root
      threshold: 0.9 // Percentual de visibilidade necessário para disparar o callback
    };
    const observer = new IntersectionObserver(entries => {
      if (this.destroyed || this.observer !== observer || !this.observedTarget?.isConnected) {
        return;
      }
      this.zone.run(() => this.handleIntersection(entries));
    }, options);
    this.observer = observer;
    observer.observe(this.observedTarget);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    if (this.destroyed || !this.observedTarget?.isConnected) {
      return;
    }
    entries.forEach(entry => {
      if (entry.target === this.observedTarget) {
        this.isBuyButtonVisible = entry.isIntersecting;
      }
    });
  }

  private disconnectObserver(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private resetProductView(): void {
    this.viewInitialization?.destroy();
    this.viewInitialization = undefined;
    this.disconnectObserver();
    for (const swiper of new Set([...this.swiperFocus, ...this.swiperMobile, this.swiper])) {
      if (swiper && !swiper.destroyed) {
        swiper.destroy(true, true);
      }
    }
    this.swiperFocus = [];
    this.swiperMobile = [];
    this.swiper = undefined;
    this.siblingsReady = false;
  }


  swiperMove(name: string){

    switch(name){
      case 'arrow_Top':

        this.swiperFocus[0]?.slidePrev()

      break;

      case'arrow_Back':

      this.swiperFocus[0]?.slideNext()

      break;

    }
  
  }


  updateNavigationDisplay(display: string): void {
    const navigation = this.elementRef.nativeElement.querySelector(".product_Box") as HTMLElement;
    if (navigation) {
      navigation.style.display = display;
    }
  }
  
  ngOnDestroy(): void {
    this.destroyed = true;
    this.loadVersion++;
    this.productChanged.next();
    this.productChanged.complete();
    this.resetProductView();

    if (this.tempoRestante2Subscription) {
      this.tempoRestante2Subscription.unsubscribe();
    }
    
    if (this.tempoRestante3Subscription) {
      this.tempoRestante3Subscription.unsubscribe();
    }
  }

  getDadosProductAll(name: string){
    this.productAll.getDados().pipe(takeUntil(this.productChanged), takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
      (data: any[]) => {
        this.dadosProductAll = data;

        const resolvedName = resolveCatalogName(name, this.dadosProductAll.map(product => product.name_Product));
        this.produto = this.dadosProductAll.find(product => product.name_Product === resolvedName);
        this.controller = 0;
        if (!this.produto) {
          return;
        }

        this.getDadosServiceImages();

      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }

  private scheduleViewInitialization(): void {
    this.viewInitialization?.destroy();
    const version = this.loadVersion;
    this.viewInitialization = afterNextRender(() => {
      this.viewInitialization = undefined;
      if (this.destroyed || version !== this.loadVersion || !this.produto) {
        return;
      }
      const swiperFocus = this.elementRef.nativeElement.querySelectorAll(".swiper_Focus")
      const swiperMobile = this.elementRef.nativeElement.querySelectorAll(".swiper_MobileMain")

      const swiperParams2 = {
        simulateTouch: true,
        allowTouchMove: true,
        slidesPerView: 'auto',
        spaceBetween: 0,
        touchReleaseOnEdges: true,
        breakpoints:{
          1020:{
            simulateTouch: true,
            allowTouchMove: true,
          }
        },
        on: {
          init() {/*trava a inicilização e inicia por aqui */
            // ...
          },

          slideChange: () => {
          if (!this.destroyed && version === this.loadVersion && this.swiperMobile[0]) {
            this.changeSlide(this.swiperMobile[0].activeIndex);
          }

          },

        }
      }

      swiperMobile.forEach((el: any)=>{
        if (this.swiperMobile.includes(el.swiper)) {
          return;
        }
        Object.assign(el, swiperParams2)
        el.initialize();
        this.swiperMobile.push(el.swiper);

      })


      const swiperParams = {
        simulateTouch: false,
        allowTouchMove: false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        breakpoints:{
          1020:{
            simulateTouch: false,
            allowTouchMove: false,
          }
        },
        on: {
          init() {/*trava a inicilização e inicia por aqui */
            // ...
          },
        }
      }
      swiperFocus.forEach((el: any)=>{
        if (this.swiperFocus.includes(el.swiper)) {
          return;
        }
        Object.assign(el, swiperParams)
        el.initialize();
        this.swiperFocus.push(el.swiper);

      })
      this.initializeObserver();
      if (this.siblingsReady) {
        const element = this.elementRef.nativeElement.querySelector('.swiper_All') as HTMLElement | null;
        if (element) {
          if (!this.swiper || this.swiper.destroyed) {
            this.swiper = this.createRelatedSwiper(element);
          } else {
            this.swiper.update();
          }
        }
      }
    }, { injector: this.injector, phase: AfterRenderPhase.MixedReadWrite });
  }

  private createRelatedSwiper(element: HTMLElement): Swiper {
    Swiper.use([A11y, Navigation]);
    const controls = element.parentElement!;
    return new Swiper(element, {
      a11y: { slideRole: '', slideLabelMessage: '' },
      slidesPerView: 'auto',
      spaceBetween: 40,
      slidesOffsetBefore: 15,
      slidesOffsetAfter: 15,
      navigation: {
        prevEl: controls.querySelector<HTMLElement>('.siblings_Back'),
        nextEl: controls.querySelector<HTMLElement>('.siblings_Next')
      }
    });
  }

changeSlide(a: any){

  if (this.destroyed) {
    return;
  }
  const radios = (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('.swiper_Radio');

    const radio = radios[a];

    const swiper = this.swiperMobile[0];
    if (!radio || !swiper || swiper.destroyed) {
      return;
    }
    radio.checked = true;
    if (swiper.activeIndex !== a) {
      swiper.slideTo(a);
    }

}

  getDadosServiceImages(){
    this.imagesService.getDadosImages().pipe(takeUntil(this.productChanged), takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
      (data: any[])=> {
        this.images_Product= data.filter(image =>{
          if(this.produto.idProduct == image.productId){
              
              return true;
          }
          
          return false;
        });

        this.getDadosDepartments()  
        this.start(this.images_Product[0]?.imageUrl ?? '');
        this.scheduleViewInitialization();
                
      },
      (error: any)=>{
        console.error('Erro ao receber dados do serviço', error)
      }
    )
    
  }

  getDadosDepartments() {
    this.departService.getDadosDepartments().pipe(takeUntil(this.productChanged), takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
      (data: any[]) => {
        this.departments = data;
        this.siblingsProduct(this.departments)
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }

      
    );

    
  }


  siblingsProduct(department: any[]){

   let Break = 0
   let idSiblings: any[] = []

    for(let dtu of department){

      if(this.produto.idProduct == dtu.productId){

        for(let dt of department){
          
          if( (dtu.productId != dt.productId) && (dtu.dtName == dt.dtName) && (dtu.dtCategory2 == dt.dtCategory2)){

                idSiblings.push(dt.productId)

          }

        }

      }
      
    }

    for(let pt of this.dadosProductAll){

      for(let iS  of idSiblings){

        if((iS == pt.idProduct) && (this.produto.maker == pt.maker) ){
          
          this.siblingsList.push(pt)
          
        }

      }

    }

   this.siblingsReady = true;
   this.scheduleViewInitialization();
  }

  zoom_Focus(){
    const zoomOut = document.querySelector("ng-magnizoom") as HTMLElement
    const zoomIn = document.querySelector(".item_Focus img") as HTMLElement
    if(this.zoom){
      
      zoomOut.style.opacity = "0"
      zoomOut.style.width = "0"
      zoomOut.style.height = "0"
      zoomIn.style.opacity = "1"
      zoomIn.style.width = "53%"
      zoomIn.style.height = "90%"
      this.zoom = false
      
    }
    else{
      zoomOut.style.opacity = "1"
      zoomOut.style.width = "101%"
      zoomOut.style.height = "101%"
      zoomIn.style.opacity = "0"
      zoomIn.style.width = "0"
      zoomIn.style.height = "0"
      this.zoom = true
    }
   
  }

  start(actual_Url: string){
   this.actual_Url = actual_Url
   
  }

  zoom_Focus_Enter(){

    const zoomOut = document.querySelector("ng-magnizoom") as HTMLElement
    const zoomIn = document.querySelector(".item_Focus img") as HTMLElement
    zoomOut.style.opacity = "1"
    zoomOut.style.width = "101%"
    zoomOut.style.height = "101%"
    zoomIn.style.opacity = "0"
    zoomIn.style.width = "0"
    zoomIn.style.height = "0"
    this.zoom = true
    
  }

  zoom_Focus_Leave(){
    const zoomOut = document.querySelector("ng-magnizoom") as HTMLElement
    const zoomIn = document.querySelector(".item_Focus img") as HTMLElement
    zoomOut.style.opacity = "0"
    zoomOut.style.width = "0"
    zoomOut.style.height = "0"
    zoomIn.style.opacity = "1"
    zoomIn.style.width = "53%"
    zoomIn.style.height = "90%"
    this.zoom = true
  }

  change_Focus(imgUrl:string){
    if( this.actual_Url != imgUrl){

      this.actual_Url = imgUrl
      
    }
    

    

  }

  changeProductName(name: string, event?: Event){
    if (this.destroyed || !name || event?.defaultPrevented || this.swiper?.allowClick === false) {
      event?.preventDefault();
      return;
    }
  
    this.departService.changeProductMainName(name)
    window.scrollTo(0, 0);
  }

}


