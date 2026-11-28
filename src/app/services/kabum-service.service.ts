import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FilterRouteContext } from './product-filter-state.service';
import { API_ORIGIN, createApiBaseUrl } from './api-configuration';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KabumServiceService implements OnDestroy {

  private readonly apiUrl: string;

  offer_Time1: string = '';
  offer_Time2: string = '';
  offer_Time3: string = '';

  private readonly offerTimers = Array.from({ length: 3 }, () => ({
    consumers: 0,
    expired: false,
    update: undefined as (() => void) | undefined,
    interval: undefined as ReturnType<typeof setInterval> | undefined
  }));
  private destroyed = false;

  private offerTime1Subject: Subject<string> = new ReplaySubject<string>(1);
  offerTime1$: Observable<string> = this.createOfferStream(0, this.offerTime1Subject);

  private offerTime2Subject: Subject<string> = new ReplaySubject<string>(1);
  offerTime2$: Observable<string> = this.createOfferStream(1, this.offerTime2Subject);

  private offerTime3Subject: Subject<string> = new ReplaySubject<string>(1);
  offerTime3$: Observable<string> = this.createOfferStream(2, this.offerTime3Subject);
  
  
  private productMainNameSource: BehaviorSubject<string>;
  productMainName$: Observable<string>;

  private filterNameSource: BehaviorSubject<string>;
  filterName$: Observable<string>;

  private subsectionNameSource: BehaviorSubject<string>;
  subsectionName$: Observable<string>;

  private parentNameSource: BehaviorSubject<string>;
  parentName$: Observable<string>;

  private lastName: any;

  constructor(private http: HttpClient, private router: Router, @Inject(API_ORIGIN) apiOrigin: string = environment.apiOrigin) {
    this.apiUrl = createApiBaseUrl(apiOrigin);
    const savedName = localStorage.getItem('filterName') || '';
    this.filterNameSource = new BehaviorSubject<string>(savedName);
    this.filterName$ = this.filterNameSource.asObservable();

    const savedSubsectionName = localStorage.getItem('subsectionName') || '';
    this.subsectionNameSource = new BehaviorSubject<string>(savedSubsectionName);
    this.subsectionName$ = this.subsectionNameSource.asObservable();

    const savedParentName = localStorage.getItem('parentName') || '';
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
    return this.http.get<any[]>(this.apiUrl + "/products")
  }

  getProductCategory(): Observable<any[]> {
    
    return this.http.get<any[]>(this.apiUrl + "/productCategory")
  }
  

  changeFilterName(name: string) {
    return this.navigateFilter({ filterName: name, subsectionName: '', parentName: '' }).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  changeSubsectionName(name: string, filterName = this.currentFilterContext().filterName) {
    return this.navigateFilter({ filterName, subsectionName: name, parentName: '' }).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  changeParentName(name: string, context = this.currentFilterContext()) {
    return this.navigateFilter({ ...context, parentName: name }).then(() => {
      // Lógica adicional após a navegação, se necessário
    });
  }

  private currentFilterContext(): FilterRouteContext {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) { route = route.firstChild; }
    return { filterName: route.params['filterName'] || '', subsectionName: route.params['subsectionName'] || '', parentName: route.params['parentName'] || '' };
  }

  private navigateFilter(context: FilterRouteContext): Promise<boolean> {
    if (!context.filterName || (context.parentName && !context.subsectionName)) { return Promise.resolve(false); }
    const keys = ['filterName', 'subsectionName', 'parentName'] as const;
    const sources = [this.filterNameSource, this.subsectionNameSource, this.parentNameSource];
    keys.forEach((key, index) => {
      if (context[key]) { localStorage.setItem(key, context[key]); }
      else { localStorage.removeItem(key); }
      sources[index].next(context[key]);
    });
    return this.router.navigate(['/Filter', ...keys.map(key => context[key]).filter(Boolean)]);
  }

  changeProductMainName(name: string) {
    localStorage.setItem('productName', name);
    this.productMainNameSource.next(name);
    return this.router.navigate(['/Product', name]);
  }

  registerProductVisit(id: number): Observable<void> {

    const url = `${this.apiUrl}/products/${id}/visits`;
    return this.http.post<void>(url, null);
  }
  
  getDadosImages(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/images")
  }

  getDadosBrands(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/brands")
  }

  getDadosDepartments(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/departments")
  }
  
  getDadosSection(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/section")
  }

  getDadosSubsection(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/subsection")
  }

  getDadosCategories(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl + "/categories")
  }

  private createOfferStream(index: number, subject: Subject<string>): Observable<string> {
    return new Observable<string>(subscriber => {
      if (this.destroyed) {
        subscriber.complete();
        return;
      }
      const timer = this.offerTimers[index];
      timer.consumers++;
      if (timer.consumers === 1 && !timer.expired) {
        timer.update?.();
      }
      const subscription = subject.subscribe(subscriber);
      this.scheduleOfferTimer(index);
      return () => {
        subscription.unsubscribe();
        timer.consumers--;
        if (timer.consumers === 0) {
          this.stopOfferTimer(index);
        }
      };
    });
  }

  private scheduleOfferTimer(index: number): void {
    const timer = this.offerTimers[index];
    if (!this.destroyed && timer.consumers > 0 && timer.update && !timer.expired && timer.interval === undefined) {
      timer.interval = setInterval(timer.update, 1000);
    }
  }

  private stopOfferTimer(index: number): void {
    const timer = this.offerTimers[index];
    if (timer.interval !== undefined) {
      clearInterval(timer.interval);
      timer.interval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.offerTimers.forEach((timer, index) => {
      this.stopOfferTimer(index);
      timer.update = undefined;
    });
    [this.offerTime1Subject, this.offerTime2Subject, this.offerTime3Subject].forEach(subject => subject.complete());
  }

  accountant_Time1(): string {
    const timer = this.offerTimers[0];
    if (this.destroyed || timer.update) {
      if (!this.destroyed && !timer.expired && timer.consumers === 0) {
        timer.update?.();
      }
      return this.offer_Time1;
    }

    
    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2025-01-06T09:59:47');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      if (this.destroyed) {
        return;
      }
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        timer.expired = true;
        this.stopOfferTimer(0);
        this.offer_Time1 = '00D 00 : 00 : 00';
        this.offerTime1Subject.next(this.offer_Time1);
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

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    timer.update = updateTimer;
    updateTimer();

    // Atualiza o temporizador a cada segundo
    this.scheduleOfferTimer(0);

    return this.offer_Time1;
   
  }

  accountant_Time2(): string {
    const timer = this.offerTimers[1];
    if (this.destroyed || timer.update) {
      if (!this.destroyed && !timer.expired && timer.consumers === 0) {
        timer.update?.();
      }
      return this.offer_Time2;
    }

    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-12-30T15:30:20');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      if (this.destroyed) {
        return;
      }
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        timer.expired = true;
        this.stopOfferTimer(1);
        this.offer_Time2 = '00D 00 : 00 : 00';
        this.offerTime2Subject.next(this.offer_Time2);
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

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    timer.update = updateTimer;
    updateTimer();

    // Atualiza o temporizador a cada segundo
    this.scheduleOfferTimer(1);
    return this.offer_Time2;
   
  }

  accountant_Time3(): string {
    const timer = this.offerTimers[2];
    if (this.destroyed || timer.update) {
      if (!this.destroyed && !timer.expired && timer.consumers === 0) {
        timer.update?.();
      }
      return this.offer_Time3;
    }

    // Defina a data-alvo para o temporizador
    const targetDate = new Date('2024-12-14T20:00:00');

    // Função para atualizar o temporizador
    const updateTimer = () => {
      if (this.destroyed) {
        return;
      }
      // Obtém a data e hora atual
      const currentDate = new Date();

      // Calcula a diferença entre a data atual e a data-alvo em milissegundos
      const difference = targetDate.getTime() - currentDate.getTime();

      // Verifica se a data-alvo já foi atingida
      if (difference <= 0) {
        timer.expired = true;
        this.stopOfferTimer(2);
        this.offer_Time3 = '00D 00 : 00 : 00';
        this.offerTime3Subject.next(this.offer_Time3);
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

    // Atualiza o temporizador pela primeira vez para evitar um atraso inicial
    timer.update = updateTimer;
    updateTimer();

    // Atualiza o temporizador a cada segundo
    this.scheduleOfferTimer(2);
    return this.offer_Time3;
   
  }
  
  
}
