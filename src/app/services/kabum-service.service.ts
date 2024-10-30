import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class KabumServiceService {

  private apiUrl = 'http://localhost:8080/api/products';
  private apiUrlImages = 'http://localhost:8080/api/images';
  private apiUrlBrands = 'http://localhost:8080/api/brands';
  private apiUrlDepartments = 'http://localhost:8080/api/departments';
  private apiUrlSection = 'http://localhost:8080/api/section';
  private apiUrlSubsection = 'http://localhost:8080/api/subsection';
  private apiUrlCategories = 'http://localhost:8080/api/categories';
  private apiUrlProductCategory = 'http://localhost:8080/api/productCategory'

  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';

  private offerTime1Subject: Subject<string> = new Subject<string>();
  offerTime1$: Observable<string> = this.offerTime1Subject.asObservable();

  private offerTime2Subject: Subject<string> = new Subject<string>();
  offerTime2$: Observable<string> = this.offerTime2Subject.asObservable();

  private offerTime3Subject: Subject<string> = new Subject<string>();
  offerTime3$: Observable<string> = this.offerTime3Subject.asObservable();
  
  
  private productMainNameSource: BehaviorSubject<string>;
  productMainName$: Observable<string>;

  private filterNameSource: BehaviorSubject<string>;
  filterName$: Observable<string>;

  private subsectionNameSource: BehaviorSubject<string>;
  subsectionName$: Observable<string>;

  private parentNameSource: BehaviorSubject<string>;
  parentName$: Observable<string>;

  private lastName: any;

  constructor(private http: HttpClient, private router: Router) {
    const savedName = localStorage.getItem('filterName') || '';
    this.filterNameSource = new BehaviorSubject<string>(savedName);
    this.filterName$ = this.filterNameSource.asObservable();

    const savedSubsectionName = localStorage.getItem('subsectionName') || '';
    this.subsectionNameSource = new BehaviorSubject<string>(savedSubsectionName);
    this.subsectionName$ = this.subsectionNameSource.asObservable();

    const savedParentName = localStorage.getItem('subsectionName') || '';
    this.parentNameSource = new BehaviorSubject<string>(savedParentName)
    this.parentName$ = this.parentNameSource.asObservable()

    const savedproductMain = localStorage.getItem('productName') || '';
    this.productMainNameSource = new BehaviorSubject<string>(savedproductMain)
    this.productMainName$ = this.productMainNameSource.asObservable()


}

private commandSource = new Subject<string>();
command$ = this.commandSource.asObservable();

private commandNav = new Subject<string>();
commandNav$ = this.commandNav.asObservable();

sendCommand(command: string) {
  this.commandSource.next(command);
}

sendNavbar(command: string){

  this.commandNav.next(command)
}

  getDados(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  getProductCategory(): Observable<any[]> {
    
    return this.http.get<any[]>(this.apiUrlProductCategory).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }
  

  changeFilterName(name: string) {
    const encodedName = encodeURIComponent(name);
    localStorage.setItem('filterName', name);
    this.filterNameSource.next(name);
    this.router.navigate(['Filter', encodedName]).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  changeSubsectionName(name: string){
    const encodedName = encodeURIComponent(name);
    localStorage.setItem('subsectionName', name)
    let filterName = localStorage.getItem('filterName')
    let encodedfilter = filterName
    if(filterName){
      encodedfilter= encodeURIComponent(filterName);
    }
  
    this.subsectionNameSource.next(name);
    this.router.navigate(['Filter', encodedfilter, encodedName]).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  changeParentName(name: string){
    const encodedName = encodeURIComponent(name);
    localStorage.setItem('parentName', name)

   
   
    let filterName = localStorage.getItem('filterName')
    let subsectionName = localStorage.getItem('subsectionName')
   
    let encodedfilter = filterName, encodedSubsection = subsectionName
    if(filterName){
      encodedfilter = encodeURIComponent(filterName);
    }

    if(subsectionName){
      encodedSubsection = encodeURIComponent(subsectionName);
    }



   
    this.parentNameSource.next(name)
    this.router.navigate(['Filter', encodedfilter, encodedSubsection, encodedName]).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  changeProductMainName(name: string) {
    const encodedName = encodeURIComponent(name);
    localStorage.setItem('productName', name);
    this.productMainNameSource.next(name);
    this.router.navigate(['Product', encodedName])
  }

  updateProductVisits(id: number, visits: number): Observable<any> {

    const url = `${this.apiUrl}/${id}/visits`;
    return this.http.put(url, { visits }).pipe(
      tap(() => console.log('Visitas do produto atualizadas com sucesso!')),
      // Trate quaisquer erros aqui, se necessário
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

  getDadosDepartments(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlDepartments).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }
  
  getDadosSection(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlSection).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  getDadosSubsection(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlSubsection).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  getDadosCategories(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlCategories).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  accountant_Time1(): string {
    
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-11-03T09:59:47');

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
    const targetDate = new Date('2024-11-30T15:30:20');

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
    const targetDate = new Date('2024-11-14T20:00:00');

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
