import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter,  NgZone } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Route, Router, ActivatedRoute } from '@angular/router';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { filter, first } from 'rxjs';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';


declare function swiper_Filter(): any

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit, AfterViewInit {
  CategoryFilter: any;
  name: string = '';
  param: string = '';
  section: any[] = [];
  products: any[] = []
  subsection: any[] = [];
  categories: any[] = [];
  productCategory: any[] = []
  auxPcProduct: any[] = []
  idSearch: any;
  searchSection: boolean = false;
  searchSubsection: boolean = false;
  categoriesSearch: any[] = []
  categoriesRelacionadas: any[] = []
  categoriesGrouped: { [key: string]: any } = {};
  convertCategoriesGrouped: any[] = []
  newVisits: any;
  product: any[] = [];
  changeDisplay: any
  filterProduct: any[] = [];
  auxProduct: any[] = []
  auxFilter: any[] = []
  nameGroup: any[] = []
  filterName: any
  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';
  tempoRestante1Subscription: Subscription | undefined;
  tempoRestante2Subscription: Subscription | undefined;
  tempoRestante3Subscription: Subscription | undefined;
  value: any;
  highValue: any;
  testa: any = 0
  ngxSlide: any = 0
  options: Options = {
    floor: 0, // Define um valor padrão para floor
    ceil: 2000,
    step: 1,
    translate: (value: number, label: LabelType): string => {
      return `R$ ${value}`;
    }
  };
  
  

 

  

  constructor(
    private productService: KabumServiceService,
    private sectionService: KabumServiceService,
    private subsectionService: KabumServiceService,
    private categoriesService: KabumServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private stateService: KabumServiceService,
    private productCategoryService: KabumServiceService,
    private commandSource: KabumServiceService,
    private route: ActivatedRoute,
    private timerService: KabumServiceService
    
  ) {

   
  }

  ngOnInit(): void {

    this.route.params.subscribe(async params => {
      let name = ''
      if(decodeURIComponent(params['parentName'] || '')){
        name = decodeURIComponent(params['parentName'] || '');
      }

      else if(decodeURIComponent(params['subsectionName'] || '')){
        name = decodeURIComponent(params['subsectionName'] || '');
      }

      else if(decodeURIComponent(params['filterName'] || '')){
        name = decodeURIComponent(params['filterName'] || '');
      }



      
      
      this.categoriesSearch = []
      if (name) {
        this.name = name; 
        this.testa = 1
        await this.loadData();
        this.testa = 0
        this.cdr.detectChanges();

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
    });
  
    window.scrollTo(0, 0);
    this.value = this.options.floor;
    this.highValue = this.options.ceil;
    this.changeDisplay = this.commandSource.command$.subscribe(
      command => {
        this.updateNavigationDisplay(command);
      }
    );
  }

  /*
    this.route.paramMap.subscribe(params => {
      
      this.filterName = params.get('filterName');
     
    });

    this.stateService.currentFilterName.subscribe(async name => {
      
      this.name = name;
      if (this.name) {
        await this.loadData();
      }
    });*/

  private async loadData() {
    try {
      await this.getDadosDoServico();
      await this.getProductCaategory();
      const sectionValues = await this.getDadosSection();
      
      // Verifique se sectionValues é um array e tem pelo menos dois elementos
      if (Array.isArray(sectionValues) && sectionValues.length >= 2) {
        this.options = {  
          ...this.options,
          floor: sectionValues[0], // Define o floor como o primeiro elemento do array
          ceil: sectionValues[1] // Define o ceil como o segundo elemento do array
        };
        this.value = sectionValues[0];
        this.highValue = sectionValues[1];
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }


  ngAfterViewInit(): void {
  
    
  }

  updateNavigationDisplay(display: string): void {
    const navigation = document.querySelector(".teste") as HTMLElement;
    if (navigation) {
      navigation.style.display = display;
    }
  }

  getDadosDoServico() {
    this.productService.getDados().subscribe(
      (data: any[]) => {
        this.products = data;
},
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

    
  }

  getProductCaategory(){

    this.productCategoryService.getProductCategory().subscribe(
      (data: any[]) => {
        this.productCategory = data;
},
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }

  updateVisits(a:any) {
    const productId = a; 

    this.productService.updateProductVisits(productId, this.newVisits)
      .subscribe(
        () => {
        
          this.productService.getDados().subscribe(data => {
            
          });
        },
        error => {
          console.error('Erro ao atualizar valor de visitas:', error);
         
        }
      );
  }


 async getDadosSection(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.sectionService.getDadosSection().subscribe(
        (data: any[]) => {
          this.section = data;
          this.getDadosSubsection().then(values => {
            resolve(values); // Resolvendo a Promise com o valor mínimo
          }).catch(error => {
            reject(error);
          });
        },
        (error: any) => {
          console.error('Erro ao obter dados do serviço:', error);
          reject(error);
        }
      );
    });
  }
  

  async getDadosSubsection(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.subsectionService.getDadosSubsection().subscribe(
        (data: any[]) => {
          this.subsection = data;
          this.getDadosCategories().then(values => {     
            resolve(values); // Resolvendo a Promise com o vetor de valores
          }).catch(error => {
            reject(error);
          });
        },
        (error: any) => {
          console.error('Erro ao obter dados do serviço:', error);
          reject(error);
        }
      );
    });
  }
  
  

  async getDadosCategories(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
    
       this.categoriesService.getDadosCategories().subscribe(
        (data: any[]) => {
          this.categories = data;
          const values: number[] = this.SearchSection();
          resolve(values); // Resolvendo a Promise com o vetor de valores
        },
        (error: any) => {
          console.error('Erro ao obter dados do serviço:', error);
          reject(error);
        }
      );
    });
  }
  
  SearchSection():number[]{
    this.searchSection = false;
    this.searchSubsection = false;
    this.categoriesRelacionadas = []
    this.product = []
    if (!this.searchSection) {
      for (let sc of this.section) {
        /*verifica se o nome encontra o nome em section*/
      
        if (sc.name === this.name) {
    
          this.idSearch = sc;
          this.searchSection = true;
 /*se encontrar equivalencia ele procura equivalencias na segunda classe em subsection table*/
          for(let sbc of this.subsection){

            if(this.idSearch.id == sbc.scId){
              this.categoriesRelacionadas.push(sbc)
            }

          }

          for(let pt of this.products){

            if(pt.scId == this.idSearch.id){
                this.product.push(pt)
            }

          }

          
 /*roda todas as categories pra encontrar a equivalencia do id com os id da foreigh key em categories*/
          for(let ct of this.categories){

            if(this.idSearch.id == ct.scId && !ct.parentId){
             
              this.SearchSort(ct)
             /*envia o ct encontrado, que é um name de uma classe de categorias, para que ele seja ordenado com os seus subcategorias equivalentes */
            }
          }
          break; // Adicionado para sair do loop após encontrar a correspondência
        }
      }

      if (!this.searchSection) {
        
        for (let sbc of this.subsection) {
         
          if (sbc.name === this.name) {
            this.idSearch = sbc;
            this.searchSubsection = true;

            if(this.idSearch.scId){
            
              for(let sbc of this.subsection){

                if(this.idSearch.id == sbc.parentId){
                  this.categoriesRelacionadas.push(sbc)
                }
    
              }
           
          
            }
            
            for(let ct of this.categories){

              if(this.idSearch.id == ct.sbcId && !ct.parentId){
                this.SearchSort(ct)
              }

            }
            for(let pt of this.products){

              if(pt.sbcId == this.idSearch.id){
                  this.product.push(pt)


              }
  
            }
            break; // Adicionado para sair do loop após encontrar a correspondência
          }
        }
      }
    }
    
    
    let values: number[] = []

    this.filterProduct = cloneDeep(this.product)
   
    if(this.product.length > 0){
      values = [this.product[0].price, this.product[0].price];
      for(let pt of this.product){

        if(pt.price < values[0]){
          values[0] = pt.price
        }
  
        if(pt.price > values[1]){
          values[1] = pt.price
        }
      }
    }

    else{
      values[0] = 0
      values[1] = 1000
    }
   
this.groupCategoriesByParent()

return values

  }

  SearchSort(ct: any){

    this.categoriesSearch.push(ct)
    
    if(ct.scId){
      
      for(let ct2 of this.categories){

        if(ct2.scId){
    
          if(ct2.scId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
        
      }
    }

    else if(ct.sbcId){
      
      for(let ct2 of this.categories){

        if(ct2.sbcId){
  
          if(ct2.sbcId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
    
      }
    }
   
  }


  groupCategoriesByParent() {
    this.categoriesGrouped = this.categoriesSearch.reduce((acc, category) => {
      if (category.parentId === 0) {
        acc[category.id] = { ...category, children: [] };
      } else {
        if (!acc[category.parentId]) {
          acc[category.parentId] = { children: [] };
        }
        acc[category.parentId].children.push(category);
      }
      return acc;
    }, {});

    setTimeout(() => {
      this.initLess();
    }, 0);

    setTimeout(()=>{
      swiper_Filter()
    },0)

    let i = 0
    for (const key in this.categoriesGrouped) {
      if (this.categoriesGrouped.hasOwnProperty(key)) {
        const group = this.categoriesGrouped[key];
        this.convertCategoriesGrouped[i] = group.name
        i += 1
        group.children.forEach((child: any) => {
          this.convertCategoriesGrouped[i] = child.id
          i += 1
         
        });
      }
    }


    
  }

  initLess(){
    const categories_Box = document.querySelectorAll(".categories_Box_Items") as NodeListOf<HTMLElement>
    const related_Items = document.querySelector(".related_Items") as HTMLElement
    const related_Item = related_Items.querySelectorAll(".related_Item") as NodeListOf<HTMLElement>


    if(related_Item.length > 5){

      related_Items.style.height = "145px"
   
      const father = related_Items.parentElement as HTMLElement

      const seeMore = father.querySelector(".seeMore") as HTMLElement
      seeMore.style.display = "block"
      
    }

    categories_Box.forEach(box => {
      const height = box.offsetHeight;

      if(height > 120){

        const father = box.parentElement as HTMLElement

        const seeMore = father.querySelector(".seeMore") as HTMLElement

        seeMore.style.display = "block"

        box.style.height = '100px'
      }
  });
  
  }

  seeMore(event: Event){
    
    const buttonMore = event.target as HTMLElement

    const father = buttonMore.parentElement as HTMLElement

    if(father.classList.contains("categories_Related")){
      
      const related_Items = father.querySelector(".related_Items") as HTMLElement

      const buttonLess = father.querySelector(".seeLess") as HTMLElement

      related_Items.style.height = 'auto'

      buttonMore.style.display = 'none'

      buttonLess.style.display = 'block'
   }

   else{

    const categories_Box = father.querySelector(".categories_Box_Items") as HTMLElement

    const buttonLess = father.querySelector(".seeLess") as HTMLElement

    categories_Box.style.height = "auto"

    buttonLess.style.display = "block"
  
    buttonMore.style.display = "none"
   }
    

  }

  seeLess(event: Event){

    const buttonLess = event.target as HTMLElement

    const father = buttonLess.parentElement as HTMLElement

    if(father.classList.contains("categories_Related")){
      
      const related_Items = father.querySelector(".related_Items") as HTMLElement

      const buttonMore = father.querySelector(".seeMore") as HTMLElement

      related_Items.style.height = '145px'

      buttonMore.style.display = 'block'

      buttonLess.style.display = 'none'
   }
   
   else{

    const categories_Box = father.querySelector(".categories_Box_Items") as HTMLElement

    const buttonMore = father.querySelector(".seeMore") as HTMLElement

    categories_Box.style.height = "100px"

    buttonLess.style.display = "none"
    
    buttonMore.style.display = "block"

   }
    

  }

   teste(event: Event){
   
    const el = event.target as HTMLElement

    const el2 = el.parentElement as HTMLElement
   
    const father = el2.parentElement as HTMLElement
   
    const after = father.querySelector(".categories_box_Title span") as HTMLElement
    
    if (father.offsetHeight > 45){
     

      father.style.height = "38px"
     /*coloca display none em todos menos no title, para que tenha o tamanho do title apenas*/
        after.classList.add("rotated")
               
    }

    else{

      if(after.classList.contains("rotated")){

        after.classList.remove("rotated")
     
      }

      father.style.height = "auto"

    }

  
  }


  filter_Section(newName: string) {
    let subsection: boolean = false

    for(let sbc of this.subsection){

      if(sbc.parentId != 0 && sbc.name == newName){
        this.stateService.changeParentName(newName)
        break
      }

      else if(sbc.parentId == 0 && sbc.name == newName){
        this.stateService.changeSubsectionName(newName)
        break
      }

    }

    window.scrollTo(0, 0);
    
  }

  onMinInputChange(event: any) {
    const value = parseFloat(event) || 0; // Converte o valor para um número float ou define como 0 se for inválido
    this.value = value;
  }

  onMaxInputChange(event: any) {
    
    const inputElement = event.target as HTMLInputElement;
    
   
    
  }

onValueChange(event: any): void {
  if(event == -1){
  
    this.filterProduct = cloneDeep(this.filterProduct.filter(pt => {
      return pt.price >= this.value && pt.price <= this.highValue;
    }));
  

  
  }

  else{

    this.filterProduct = cloneDeep(this.product.filter(pt => {
      return pt.price >= this.value && pt.price <= this.highValue;
    }));
  

  }

}

onCheckboxChange(category: any, groupName: any) {
  
 this.CategoryFilter = category
 this.auxPcProduct = []
  
  if(category == -1){


    let auxProduct: any[] = []
    this.filterProduct = []
    let state: boolean = false
    let count = 0
    
  
    if(this.auxFilter.length == 0){
     this.filterProduct = cloneDeep(this.product)
    
    }  
  
  else{
  
    this.filterProduct = cloneDeep(this.product)
   
    let stateAfterLoop: Boolean = false
    let sizeOff: any[] = [] 
    for(let aux of this.auxFilter){
    state = false
  
    for(let pc of this.productCategory){
    
     if(pc.ctId == aux){
      this.auxPcProduct.push(pc)
      state = true
     
     }
    
    }

    if(!state && !(sizeOff.includes(aux))){
      sizeOff.push(aux)
    }

    
    }

      state = false
      const size = this.auxFilter.length
  
      this.filterProduct = this.filterProduct.filter(fp => {
        state = false
          let parent: any[] = []
          let count = 0
          
          for(let pc of this.auxPcProduct){
          
            if(!(parent.includes(this.categories[pc.ctId - 1].parentId))){

              parent.push(this.categories[pc.ctId - 1].parentId)
           
            }
            
          }

          let newCount = 0
          for(let aux of sizeOff){

            if(parent.includes(this.categories[aux - 1].parentId)){
              newCount -= 1
            }
          }
        
           
          
          const size = parent.length + sizeOff.length + newCount
    
          for(let pc of this.auxPcProduct){
    
    
            if(pc.idProduct == fp.idProduct){
              count += 1
            }
    
          }
    
          if(count >= size){
    
            return fp
          
          }
      
        })
  
  }
  
  
  }

  else{
    let state: boolean = false
    let count = 0
    
    for(let af of this.auxFilter){
      
      if(af == category.id){
        this.auxFilter.splice(count, 1)
        state = true
      }
    count +=1
    }
  
    if(!state){
      
      this.auxFilter.push(category.id)
      
    }
  
    if(this.auxFilter.length == 0){
  
      for(let i = this.nameGroup.length - 1; i>=0; i--){

        if(this.nameGroup[i] == groupName){
       
          this.nameGroup.splice(i, 1)
          break
        }
  
      }

    }
    
  
  else{
    let sizeOff: any[] = [] 
    for(let aux of this.auxFilter){
    state = false
  
    for(let pc of this.productCategory){
    
     if(pc.ctId == aux){
      
      this.auxPcProduct.push(pc)
      state = true
     
    }

    
    }

    if(!state && !(sizeOff.includes(aux))){
      sizeOff.push(aux)
    }

    }


    if(this.auxPcProduct.length == 0){
      this.filterProduct = []
    }
    else{
      this.filterProduct = this.filterProduct.filter(fp => {
        state = false
          let parent: any[] = []
          let count = 0
          
          for(let pc of this.auxPcProduct){
          
            if(!(parent.includes(this.categories[pc.ctId - 1].parentId))){
           
              parent.push(this.categories[pc.ctId - 1].parentId)
           
            }
            
          }

          let newCount = 0
          for(let aux of sizeOff){

            if(parent.includes(this.categories[aux - 1].parentId)){
              newCount -= 1
            }
          }
              
          const size = parent.length + sizeOff.length + newCount
    
          for(let pc of this.auxPcProduct){
    
    
            if(pc.idProduct == fp.idProduct){
              count += 1
            }
    
          }
    
          if(count >= size){
    
            return fp
          
          }
        })
    }  
  }

  }

  }

filterAll(number: number, subcategory: any, event: any){
  switch(number){

    case 1:
    this.onCheckboxChange(-1, -2)
    this.onValueChange(-1)
    
    break;

    case 2:
    this.onValueChange(-2)
    this.onCheckboxChange(subcategory, event)
    
    break;
  }
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


clickMobileFilter(){
  this.ngxSlide = 1
  const filter = document.querySelector(".filter_Mobile") as HTMLElement
  const overlay = document.querySelector(".overlay") as HTMLElement


  window.scrollTo(0,0)
  filter.style.display = "block"
  overlay.style.display = "block"
}

closeAp(){
  this.ngxSlide = 0
  const filter = document.querySelector(".filter_Mobile") as HTMLElement
  const overlay = document.querySelector(".overlay") as HTMLElement

  filter.style.display = "none"
  overlay.style.display = "none"
}



}
