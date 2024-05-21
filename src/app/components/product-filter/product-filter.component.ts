import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css'] // Corrigido de 'styleUrl' para 'styleUrls'
})
export class ProductFilterComponent implements OnInit {
  name: string = '';
  section: any[] = [];
  subsection: any[] = [];
  categories: any[] = [];
  idSearch: any;
  searchSection: boolean = false;
  searchSubsection: boolean = false;
  categoriesSearch: any[] = []
  categoriesSort: any[] = []
  categoriesRelacionadas: any[] = []

  constructor(
    private sectionService: KabumServiceService,
    private subsectionService: KabumServiceService,
    private categoriesService: KabumServiceService
  ) {}

  ngOnInit(): void {
    this.name = history.state.name;
    this.getDadosSection();
  }

  getDadosSection() {
    this.sectionService.getDadosSection().subscribe(
      (data: any[]) => {
        this.section = data;
        this.getDadosSubsection();
        console.log('Dados no componente:', this.section);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );
  }

  getDadosSubsection() {
    this.subsectionService.getDadosSubsection().subscribe(
      (data: any[]) => {
        this.subsection = data;
        this.getDadosCategories();
        console.log('Dados no componente:', this.subsection);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );
  }

  getDadosCategories() {
    this.categoriesService.getDadosCategories().subscribe(
      (data: any[]) => {
        this.categories = data;
        this.SearchSection();
        console.log('Dados no componente:', this.categories);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );
  }

  SearchSection() {
    this.searchSection = false;
    this.searchSubsection = false;

    if (!this.searchSection) {
      for (let sc of this.section) {
        if (sc.name === this.name) {
          this.idSearch = sc;
          this.searchSection = true;

          for(let sbc of this.subsection){

            if(this.idSearch.id == sbc.scId){
              this.categoriesRelacionadas.push(sbc)
            }

          }

          for(let ct of this.categories){

            if(this.idSearch.id == ct.scId && !ct.parentId){
             
              this.SearchSort(ct)
            
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
            break; // Adicionado para sair do loop após encontrar a correspondência
          }
        }
      }
    }


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


}
