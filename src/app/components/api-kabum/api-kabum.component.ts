import { Component, OnInit, ViewChild } from '@angular/core';
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
  
  constructor(private dadosService: KabumServiceService, private dadosServiceImages: KabumServiceService) { }
  
  ngOnInit(): void {
    this.getDadosDoServico();
    this.getDadosServiceImages();
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
            TesteHello()
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


    


 
  
}


