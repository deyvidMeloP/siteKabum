import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {

  section: any[] = []
  isVisible: boolean = true
  constructor(
    private sectionService: KabumServiceService,
    private commandNav: KabumServiceService

  ){}

  ngOnInit(): void {
    this.getDadosSection()

    this.commandNav.command$.subscribe(

      command =>{
        if(command == 'none'){

          this.isVisible = false

        }

        else if(command == 'flex'){
          this.isVisible = true
        }
      }


    )
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

  clickNavbar(){

    this.isVisible = false
  
    this.commandNav.sendNavbar('flex')
  }

  
}
