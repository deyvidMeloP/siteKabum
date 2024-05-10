import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KabumServiceService {

  private apiUrl = 'http://localhost:8080/api/products';
  private apiUrlImages = 'http://localhost:8080/api/images';
  private apiUrlBrands = 'http://localhost:8080/api/brands';
  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';

  private offerTime1Subject: Subject<string> = new Subject<string>();
  offerTime1$: Observable<string> = this.offerTime1Subject.asObservable();

  private offerTime2Subject: Subject<string> = new Subject<string>();
  offerTime2$: Observable<string> = this.offerTime2Subject.asObservable();

  private offerTime3Subject: Subject<string> = new Subject<string>();
  offerTime3$: Observable<string> = this.offerTime3Subject.asObservable();

  constructor(private http: HttpClient) { }

  getDados(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }
  
  getDadosImages(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlImages).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  getDadosBrands(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlBrands).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  accountant_Time1(): string {
    
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-06-03T09:59:47');

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
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time1 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
      this.offerTime1Subject.next(this.offer_Time1);
    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();

    return this.offer_Time1;
   
  }

  accountant_Time2(): string {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-05-30T15:30:20');

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
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time2 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
      this.offerTime2Subject.next(this.offer_Time2);
    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
    return this.offer_Time2;
   
  }

  accountant_Time3(): string {
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-05-10T20:00:00');

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
      const formattedDays = days.toString().padStart(2, '0')
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

     // Exibe o tempo restante
      this.offer_Time3 = `${formattedDays}D ${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
      this.offerTime3Subject.next(this.offer_Time3);
    };

    // Atualiza o temporizador a cada segundo
    const timerInterval = setInterval(updateTimer, 1000);

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    updateTimer();
    return this.offer_Time3;
   
  }

  
  
}
