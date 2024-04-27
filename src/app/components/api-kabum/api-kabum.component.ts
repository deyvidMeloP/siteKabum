import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-api-kabum',
  templateUrl: './api-kabum.component.html',
  styleUrls: ['./api-kabum.component.css']
})
export class ApiKabumComponent implements OnInit {
 
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
          }
          return false;
        })
      },
      (error: any)=>{
        console.error('Erro ao receber dados do serviço', error)
      }
    )
  }
  
  
}


