import { Component, ChangeDetectorRef } from '@angular/core';
import { OnInit} from '@angular/core';


@Component({
  selector: 'app-banner-pair',
  templateUrl: './banner-pair.component.html',
  styleUrl: './banner-pair.component.css'
})
export class BannerPairComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef) {}

  testando: string = '';
  ngOnInit(): void {
    this.contador()
  }

  contador() {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-05-05T02:41:00');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        clearInterval(timerInterval);
        console.log('Tempo esgotado!');
        return;
      }

      // Calcula os componentes do tempo restante
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Exibe o tempo restante
     // Exibe o tempo restante
     this.testando = `Tempo restante: ${days} dias, ${hours} horas, ${minutes} minutos, ${seconds} segundos`;

     this.cdr.detectChanges();

    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
   
  }
}
