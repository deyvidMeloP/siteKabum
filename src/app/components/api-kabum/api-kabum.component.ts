import { Component, OnInit,  OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Router } from '@angular/router';

declare function TesteHello(): any;

@Component({
  selector: 'app-api-kabum',
  templateUrl: './api-kabum.component.html',
  styleUrls: ['./api-kabum.component.css']
})

export class ApiKabumComponent implements OnInit{
 
 
  dadosDoServico: any[] = [];
  dadosDoServicoImages: any[] = [];
  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';
  tempoRestante1Subscription: Subscription | undefined;
  tempoRestante2Subscription: Subscription | undefined;
  tempoRestante3Subscription: Subscription | undefined;
  newVisits: any;
  swiper: any;
  swiperProduct: any;
  product_Swiper: any = [];

  constructor(private dadosService: KabumServiceService, private dadosServiceImages: KabumServiceService, private router: Router, private timerService: KabumServiceService) { }
  
  ngOnInit(): void {
    this.getDadosDoServico();
    this.getDadosServiceImages();
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

  ngOnDestroy(): void {
    if (this.tempoRestante1Subscription) {
      this.tempoRestante1Subscription.unsubscribe();
    }

    if (this.tempoRestante2Subscription) {
      this.tempoRestante2Subscription.unsubscribe();
    }
    if (this.tempoRestante3Subscription) {
      this.tempoRestante3Subscription.unsubscribe();
    }
  }
  


  getDadosDoServico() {
    this.dadosService.getDados().subscribe(
      (data: any[]) => {
        this.dadosDoServico = data;
        setTimeout(()=>{

          const product_Swiper = document.querySelectorAll(".swiper")
                    
          const swiperParams = {
            slidesPerView: 'auto',
            breakpoints: {
              1024: {
                slidesPerView: 'auto',
                spaceBetween: 0
              },
            },
            on: {
              init() {/*trava a inicilização e inicia por aqui */
                // ...
              },

              resize() {
                console.log('Swiper resized');
                const screenWidth = window.innerWidth;
                console.log('Screen width:', screenWidth);
              },
            },
          };

          product_Swiper.forEach((el: any, index) => {
            
            Object.assign(el, swiperParams);
            
            el.initialize();
            
            this.product_Swiper.push(el.swiper);
          });
    

          const backButton = document.querySelector(".IconBackward")
          const nextButton = document.querySelector(".IconForward")
    
          if(backButton){
    
            backButton.addEventListener('click', (event)=> this.swipeMove(backButton.classList.value))
        
            
          }
      
          if(nextButton){
           
            nextButton.addEventListener('click', (event)=> this.swipeMove(nextButton.classList.value))
          
          }
    
        }, 0)
        console.log(this.dadosDoServico[0].imageUrl)
        console.log('Dados no componente:', this.dadosDoServico);
        },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

    
  }

  swipeMove(className: string){

    switch(className){

      case "IconBackward":
        
        if(this.product_Swiper[0]){
        
          this.product_Swiper[0].slidePrev();

        }
      break;

      case "IconForward":
       
        if(this.product_Swiper[0]){
          
          this.product_Swiper[0].slideNext();

        }
      break;
      }

  }

  getDadosServiceImages(){
    this.dadosServiceImages.getDadosImages().subscribe(
      (data: any[])=> {
        const uniqueProducts = new Set<number>();
        this.dadosDoServicoImages = data.filter(image =>{
          if(!uniqueProducts.has(image.productId)){
            uniqueProducts.add(image.productId);
            return true;
          }
     
          return false;
          
        })
        },
      (error: any)=>{
        console.error('Erro ao receber dados do serviço', error)
      }
      
    )

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

      window.scrollTo(0, 0);
      this.dadosService.changeProductMainName(produto.name_Product)
     
  }

  

    


 
  
}


