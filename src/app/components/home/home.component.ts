import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  changeDisplay: any
  constructor(private commandSource: KabumServiceService) {}


  backgroundColor: string = '#870700';   
  ngOnInit(): void {
    alert("O SITE ESTÁ PASSANDO POR UMA MIGRAÇÃO DE NUVEM DO BANCO DE DADOS, DADOS PODEM DEMORAR 60 SEGUNDOS PARA CARREGAR E OUTRAS INFORMAÇÕES PODEM NÃO CARREGAR COMPLETAMENTE, TENTE RECARREGAR A PAGINA APÓS ESSE TEMPO. DESCULPE O TRANSTORNO")
    this.onStyleChange(this.backgroundColor)

    this.changeDisplay = this.commandSource.command$.subscribe(
      command => {
        this.updateNavigationDisplay(command);
      }
    );

  }
 
  updateNavigationDisplay(display: string): void {
    const navigation = document.querySelector(".navbar_Navigation") as HTMLElement;
    if (navigation) {
      navigation.style.display = display;
    }
  }
  onStyleChange(event: string) {

    this.backgroundColor = event;

  }
}
