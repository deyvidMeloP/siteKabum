import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Route, Router } from '@angular/router';
import { Options, LabelType } from '@angular-slider/ngx-slider';

declare function swiper_Filter(): any

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css'] // Corrigido de 'styleUrl' para 'styleUrls'
})
export class ProductFilterComponent implements OnInit, AfterViewInit {
  name: string = '';
  section: any[] = [];
  products: any[] = []
  subsection: any[] = [];
  categories: any[] = [];
  idSearch: any;
  searchSection: boolean = false;
  searchSubsection: boolean = false;
  categoriesSearch: any[] = []
  categoriesRelacionadas: any[] = []
  categoriesGrouped: { [key: string]: any } = {};
  newVisits: any;
  product: any[] = [];
  filterProduct: any[] = [];
  
  value: any
  highValue: number = 7699;
  a: any
  options: Options = {
    floor: 0, // Define um valor padrão para floor
    ceil: 2000,
    step: 0,
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
    
  ) {
    this.stateService.currentFilterName.subscribe(async name => {
      this.name = name;
      if (this.name) {
        await this.getDadosDoServico();
        const sectionValues = await this.getDadosSection();
        // Verifique se sectionValues é um array e tem pelo menos dois elementos
        if (Array.isArray(sectionValues) && sectionValues.length >= 2) {
          this.options = {
            ...this.options,
            floor: sectionValues[0], // Define o floor como o primeiro elemento do array
            ceil: sectionValues[1] // Define o ceil como o segundo elemento do array
          };
        }
      }
    });
  }

  ngOnInit(): void {

    window.scrollTo(0, 0);
  
  }

  ngAfterViewInit(): void {
  
    
  }

  testanddo(): number{
    return 250
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


  getDadosSection(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.sectionService.getDadosSection().subscribe(
        (data: any[]) => {
          this.section = data;
          this.getDadosSubsection().then(values => {
            console.log('Dados no componente:', this.section);
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
  

  getDadosSubsection(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.subsectionService.getDadosSubsection().subscribe(
        (data: any[]) => {
          this.subsection = data;
          this.getDadosCategories().then(values => {
            console.log('Dados no componente:', this.subsection);       
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
  
  

  getDadosCategories(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.categoriesService.getDadosCategories().subscribe(
        (data: any[]) => {
          this.categories = data;
          const values: number[] = this.SearchSection();
          console.log('Dados no componente:', this.categories);
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
    

    let values: number[] = [this.product[0].price, this.product[0].price];

    this.filterProduct = this.product
    for(let pt of this.product){
      if(pt.price < values[0]){
        values[0] = pt.price
      }

      if(pt.price > values[1]){
        values[1] = pt.price
      }
    }
   
this.groupCategoriesByParent()

this.value = values[0]

return values

  }

  SearchSort(ct: any){

    this.categoriesSearch.push(ct)
    
    if(ct.scId){
      
      for(let ct2 of this.categories){

        if(ct2.scId){
    
          console.log(ct2.parentId)
  
          if(ct2.scId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
        
      }
    }

    else if(ct.sbcId){
      
      for(let ct2 of this.categories){

        if(ct2.sbcId){
    
          console.log(ct2.parentId)
  
          if(ct2.sbcId == this.idSearch.id && ct2.parentId == ct.id){
            
            this.categoriesSearch.push(ct2)
        
          }
        
        }   
    
      }
    }
   
  }

  testando(){
    this.options = {
      floor: this.value,
      ceil: 2000,
      step: 0,
      translate: (value: number, label: LabelType): string => {
        return `R$ ${value}`;
      }
    };
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
    
  }

  onCheckboxChange(category: any) {
    if (category.selected && category.name == "AM2") {
      alert(`${category.name} foi marcado!`);
    } 
    console.log('Categoria alterada:', category);
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
      console.log(`Width of the box: ${height}px`);
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
    this.stateService.changeFilterName(newName);
    window.location.reload();
    window.scrollTo(0, 0);
    this.router.navigateByUrl('/Filter').then(() => {
    });
    
  }
  onMinInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value; // Obter o valor do input
    this.value = parseInt(value, 10) || 0; // Converte o valor para um número inteiro ou define como 0 se for inválido
   
    
}

onMaxInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value; 
    // Obter o valor do input
    this.highValue = parseInt(value, 10) || 0; // Converte o valor para um número inteiro ou define como 0 se for inválido
}

onValueChange(event: any): void {
  console.log('Products:', this.product);
  console.log('Value:', this.value, 'High Value:', this.highValue);
  
  this.filterProduct = this.product.filter(pt => {
    console.log('Product Price:', pt.price, 'Value:', this.value, 'High Value:', this.highValue);
    return pt.price >= this.value && pt.price <= this.highValue;
  });
  
  console.log('Filtered Products:', this.filterProduct);

}

}
