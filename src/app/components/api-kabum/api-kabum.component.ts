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
        console.log('Dados no componente:', this.dadosDoServico);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

    
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
        TesteHello()},
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

      this.router.navigateByUrl('/Product', { state: { produto: produto } })
      /* para enviar mais de uma variavel: this.router.navigateByUrl('/Product', { state: { produto: produto, outraVariavel: outraVariavel } });*/
      
  }

  

    


 
  
}


