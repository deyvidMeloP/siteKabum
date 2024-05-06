import { Component, OnInit} from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';

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

  constructor(private dadosService: KabumServiceService, private dadosServiceImages: KabumServiceService) { }
  
  ngOnInit(): void {
    this.getDadosDoServico();
    this.getDadosServiceImages();
    this.accountant_Time1();
    this.accountant_Time2();
    this.accountant_Time3();
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
            TesteHello()
            return true;
          }
          TesteHello()
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


  accountant_Time1() {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-06-03T09:59:47');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        clearInterval(timerInterval);
        console.log('Tempo esgotado!');
        return;
      }

      // Calcula os componentes do tempo restante
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time1 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;

    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
   
  }

  accountant_Time2() {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-05-07T15:30:20');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        clearInterval(timerInterval);
        console.log('Tempo esgotado!');
        return;
      }

      // Calcula os componentes do tempo restante
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time2 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;

    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
   
  }

  accountant_Time3() {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-05-10T20:00:00');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        clearInterval(timerInterval);
        console.log('Tempo esgotado!');
        return;
      }

      // Calcula os componentes do tempo restante
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time3 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;

    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
   
  }

    


 
  
}


