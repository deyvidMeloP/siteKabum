import { Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import { KabumServiceService } from '../../../services/kabum-service.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
declare function swiperProductMain(): any;
declare function siblings_Swiper(): any;

@Component({
  selector: 'app-product-main',
  templateUrl: './product-main.component.html',
  styleUrl: './product-main.component.css'
})
export class ProductMainComponent implements OnInit{

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

  constructor(private productAll: KabumServiceService,  private imagesService: KabumServiceService, private elementRef: ElementRef, private timerService: KabumServiceService, private departService: KabumServiceService, 
    private commandSource: KabumServiceService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.route.params.subscribe(async params => {
      this.controller = 1
      this.departments = [];
      this.siblingsList = []
      this.imageSinbling = [];
      this.actual_Url = ''
      let name = ''
      if(decodeURIComponent(params['productName'] || '')){
        name = decodeURIComponent(params['productName'] || '');
      }

     await this.getDadosProductAll(name);
      this.controller = 0
  
    this.tempoRestante2Subscription = this.timerService.offerTime2$.subscribe(
      tempo => this.offer_Time2= tempo
    );
    this.timerService.accountant_Time2(); 

    this.tempoRestante3Subscription = this.timerService.offerTime3$.subscribe(
      tempo => this.offer_Time3 = tempo
    );
    this.timerService.accountant_Time3(); 

      
    })


    this.changeDisplay = this.commandSource.command$.subscribe(
      command => {
        this.updateNavigationDisplay(command);
      }
    );
  }


  updateNavigationDisplay(display: string): void {
    const navigation = document.querySelector(".product_Box") as HTMLElement;
    if (navigation) {
      navigation.style.display = display;
    }
  }
  
  ngOnDestroy(): void {

    if (this.tempoRestante2Subscription) {
      this.tempoRestante2Subscription.unsubscribe();
    }
    
    if (this.tempoRestante3Subscription) {
      this.tempoRestante3Subscription.unsubscribe();
    }
  }

  getDadosProductAll(name: string){
    this.productAll.getDados().subscribe(
      (data: any[]) => {
        this.dadosProductAll = data;

        for(let product of this.dadosProductAll){
          if(product.name_Product == name){
            this.produto = product
            break
          }
        }

        this.getDadosServiceImages();
  
        console.log('Dados no componente:', this.dadosProductAll);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

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

        this.getDadosDepartments()  
        this.start(this.images_Product[0].imageUrl)
                
        
        
        
      },
      (error: any)=>{
        console.error('Erro ao receber dados do serviço', error)
      }
    )
    
  }

  getDadosDepartments() {
    this.departService.getDadosDepartments().subscribe(
      (data: any[]) => {
        this.departments = data;
        this.siblingsProduct(this.departments)
        console.log('Dados no componente:', this.departments);
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
  
   siblings_Swiper()
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
   swiperProductMain()
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

  changeProductName(name: string){
  
    this.departService.changeProductMainName(name)
    window.scrollTo(0, 0);
  }

}


