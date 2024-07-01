import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Router } from '@angular/router';

declare function swiper_Section(): any;


@Component({
  selector: 'app-banner-pair',
  templateUrl: './banner-pair.component.html',
  styleUrl: './banner-pair.component.css'
})
export class BannerPairComponent implements OnInit, AfterViewInit {
  cont: any = 0
  nameSub: any[] = []
  dadosDoServiceBrands: any[] = [];
  produtoAll: any[] = [];
  produto: any[] = [];
  section: any[] = [];
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
  mostSearch:any = [];
  newVisits: any;
  constructor(
    private dadosService: KabumServiceService,
    private departService: KabumServiceService, private dadosServiceBrands: KabumServiceService,  private router: Router, private dadosProdutos: KabumServiceService, private timerService: KabumServiceService, 
    private stateService: KabumServiceService, private sectionService: KabumServiceService,
    private subSectionService: KabumServiceService,) {
 
   
  }

  testando: string = '';
  ngOnInit(): void {
    this.getDadosDoServico();
    this.getDadosBrands()
    this.getDadosDepartments()
    this.getDadosSection()
    this.getDadosSubsection()
    this.tempoRestante1Subscription = this.timerService.offerTime1$.subscribe(
      tempo => this.offer_Time1= tempo
    );
    this.timerService.accountant_Time1(); 

    this.tempoRestante2Subscription = this.timerService.offerTime2$.subscribe(
      tempo => this.offer_Time2= tempo
    );
    this.timerService.accountant_Time2(); 

    this.tempoRestante3Subscription = this.timerService.offerTime3$.subscribe(
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

      case "marker_Next":

      if(this.marker_Swiper[index]){
          
        this.marker_Swiper[index].slideNext();

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

    this.subSectionService.getDadosSubsection().subscribe(
  
      (data: any[]) =>{
  
        this.subSection = data       
  
      },
  
      (error: any)=>{
        console.error('Erro ao obter dados do serviço:', error);
      }
  
  
    )
  }
  getDadosDoServico() {
    this.dadosProdutos.getDados().subscribe(
      (data: any[]) => {
        this.produtoAll = data;
        this.produto = this.produtoAll
        this.MostSearch()
        console.log('Dados no componente:', this.produtoAll);
        },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }

  teste(){

    this.cont +=1
    this.submenu_Click(this.cont)
  

  }

  MostSearch(){
    const visits: number[] = []

    for(let product of this.produtoAll){

      if (product && typeof product.visits === 'number') {
        visits.push(product.visits);
      } else {
        console.warn('Produto sem a propriedade visits ou visits não é um número:', product);
      }
     

      
    }
console.log("rim")
    const value = visits.length
    for(let i = 0; i < value; i++){

      const max = Math.max(...visits)

      const index = visits.indexOf(max)
      
      this.mostSearch.push(this.produtoAll[index])
     
      visits[index] = - 1
      
    }

    setTimeout(()=>{

      const marker_Swiper = document.querySelectorAll(".marker_Swiper")
           
      const product_Swiper = document.querySelectorAll(".swiper_Product")

      marker_Swiper.forEach((el)=>{

        this.marker_Swiper.push((el as any).swiper)
       
      })

      const swiperParams = {
        updateOnWindowResize: true,
        
        on: {
          init() {/*trava a inicilização e inicia por aqui */
            // ...
          },
        },
      };

      product_Swiper.forEach((el: any, index) => {
        Object.assign(el, swiperParams);
        el.initialize();
        this.product_Swiper.push(el.swiper);
      });

      const backButton = document.querySelectorAll(".marker_Back")
      const nextButton = document.querySelectorAll(".marker_Next")

      const IconBackwardPair = document.querySelectorAll(".IconBackwardPair")
      const IconForwardPair = document.querySelectorAll(".IconForwardPair")

  
      if(backButton){

        backButton.forEach((el, index)=>{
       
          el.addEventListener('click', (event)=> this.swipeMove(el.classList.value, index))
       
        })
        
      }
  
      if(nextButton){
       
        nextButton.forEach((el, index)=>{
       
          el.addEventListener('click', (event)=> this.swipeMove(el.classList.value, index))
       
        })
      
      }

      if(IconBackwardPair){
      
        IconBackwardPair.forEach((el, index)=>{
      
          el.addEventListener('click', (event)=> this.swipeMove(el.classList.value, index))
      
        })
     
      }

      if(IconForwardPair){
     
        IconForwardPair.forEach((el, index)=>{
     
          el.addEventListener('click', (event)=> this.swipeMove(el.classList.value, index))
        })
      }

    }, 0)
  }
  submenu_Click(scId: number){
    const submenu_Opt = document.querySelector(".submenu_Opt") as HTMLElement
  this.nameSub = []
   submenu_Opt.style.display = "none"
  for(let subsection of this.subSection){
  
    if(subsection.scId == scId){
  
      this.nameSub.push(subsection.name)
      console.log(subsection.name)
  
    }
  
  
  
    submenu_Opt.style.display = "flex"
   
  }
  
  
   
    
  }

  getDadosSection(){
   
    this.sectionService.getDadosSection().subscribe(
      (data: any[]) => {
        this.section = data;
        swiper_Section()
        setTimeout(()=>{
          this.adjusts()
        },0)
        console.log('Dados no componente:', this.section);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }
  

  adjusts(){

    const departmentsSection = document.querySelectorAll(".departments_Item") as NodeListOf<HTMLElement>


    departmentsSection.forEach((el)=>{

     const h1 = (el.querySelector("h1") as HTMLElement).innerText
     let te = el.querySelector("img") as HTMLElement
     
     if(h1 == "CASA INTELIGENTE"){

        
        te.style.width = "90%"
        el.style.width = "10vw"
       
     }

     else if(h1 == "CELULAR & SMARTPHONE"){
   
      
      te.style.width = "75%"
      el.style.width = "12vw"
   
    }

    else if(h1 == "TABLETS, IPADS E E-READERS"){

      te.style.width = "64.6%"
      el.style.width = "14vw"

    }
    })
  }
  

  getDadosBrands() {
    this.dadosServiceBrands.getDadosBrands().subscribe(
      (data: any[]) => {
        this.dadosDoServiceBrands = data;
        console.log('Dados no componente:', this.dadosDoServiceBrands);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }
  
  getDadosDepartments() {
    this.departService.getDadosDepartments().subscribe(
      (data: any[]) => {
        this.departments = data;
        console.log('Dados no componente:', this.departments);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }

      
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

    this.newVisits = produto.visits + 1
      
   this.dadosService.updateProductVisits(produto.idProduct, this.newVisits)
     .subscribe(
       () => {
       
         this.dadosService.getDados().subscribe(data => {
           
         });
       },
       error => {
         console.error('Erro ao atualizar valor de visitas:', error);
        
       }
     );

     this.router.navigateByUrl('/Product', { state: { produto: produto } })
    
 }

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


  NavigationPage(name: string){

    
    this.stateService.changeFilterName(name);
    this.router.navigateByUrl('/Filter');
     

  }

}
