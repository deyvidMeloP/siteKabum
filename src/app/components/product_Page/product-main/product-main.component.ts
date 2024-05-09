import { Component, OnInit, ElementRef   } from '@angular/core';
import { KabumServiceService } from '../../../services/kabum-service.service';

@Component({
  selector: 'app-product-main',
  templateUrl: './product-main.component.html',
  styleUrl: './product-main.component.css'
})
export class ProductMainComponent implements OnInit{
  produto: any;
  images_Product: any[] = [];
  zoom: boolean = true
  actual_Url: string = ''

  constructor(private imagesService: KabumServiceService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.produto = history.state.produto;
    this.getDadosServiceImages()
  }

  getDadosServiceImages(){
    this.imagesService.getDadosImages().subscribe(  
      (data: any[])=> {
        this.images_Product= data.filter(image =>{
          if(this.produto.idProduct == image.productId){
              return true;
          }
          
          return false;
        });

        this.start(this.images_Product[0].imageUrl)
      
        
      },
      (error: any)=>{
        console.error('Erro ao receber dados do serviço', error)
      }
    )
 
    
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

}
