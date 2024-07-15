import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {

  section: any[] = []
  constructor(
    private sectionService: KabumServiceService,

  ){}

  ngOnInit(): void {
    this.getDadosSection()
  }
  getDadosSection(){
   
    this.sectionService.getDadosSection().subscribe(
      (data: any[]) => {
        this.section = data;
        console.log('Dados no componente:', this.section);
      },
      (error: any) => {
        console.error('Erro ao obter dados do serviço:', error);
      }
    );

  }
}
