import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER } from 'rxjs';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { ApiKabumComponent } from './components/api-kabum/api-kabum.component';
import { KabumServiceService } from './services/kabum-service.service';

describe('Temporizadores compartilhados das ofertas', () => {
  let service: KabumServiceService;
  let intervals: jasmine.Spy;
  let cleared: jasmine.Spy;
  const fixtures: Array<{ destroy(): void }> = [];
  const seconds = (text: string) => {
    const [days, hours, minutes, remaining] = text.match(/\d+/g)!.map(Number);
    return days * 86400 + hours * 3600 + minutes * 60 + remaining;
  };
  const start = (index: number): string => [
    () => service.accountant_Time1(), () => service.accountant_Time2(), () => service.accountant_Time3()
  ][index]();
  const stream = (index: number) => [service.offerTime1$, service.offerTime2$, service.offerTime3$][index];
  const consume = (index: number) => {
    const values: string[] = [];
    const subscription = stream(index).subscribe(value => values.push(value));
    return { values, subscription };
  };
  const advance = (milliseconds: number) => tick(milliseconds);
  const setTime = (date: Date) => {
    const clock = (window as any).Zone.current.get('FakeAsyncTestZoneSpec');
    clock.setFakeBaseSystemTime(date.getTime() - clock.getCurrentTickTime());
  };
  function itWithClock(description: string, body: () => void): void {
    it(description, fakeAsync(() => {
      setTime(new Date(2024, 0, 15, 12));
      intervals = spyOn(window, 'setInterval').and.callThrough();
      cleared = spyOn(window, 'clearInterval').and.callThrough();
      try { body(); } finally {
        fixtures.splice(0).forEach(fixture => fixture.destroy());
        service.ngOnDestroy();
      }
    }));
  }
  const active = () => (service as any).offerTimers.filter((timer: any) => timer.interval !== undefined).length;

  beforeEach(async () => {
    service = new KabumServiceService({} as HttpClient, {} as Router);
    for (const method of ['getDados', 'getDadosImages', 'getDadosBrands', 'getDadosDepartments', 'getDadosSection', 'getDadosSubsection'] as const) {
      spyOn(service, method).and.returnValue(NEVER);
    }
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent, ProductMainComponent, ApiKabumComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: KabumServiceService, useValue: service },
        { provide: ActivatedRoute, useValue: { params: NEVER } }
      ]
    }).overrideTemplate(BannerPairComponent, '').overrideTemplate(ProductMainComponent, '')
      .overrideTemplate(ApiKabumComponent, '').compileComponents();
  });

  afterEach(() => {
    fixtures.splice(0).forEach(fixture => fixture.destroy());
    service.ngOnDestroy();
  });

  function pair() {
    const fixture = TestBed.createComponent(BannerPairComponent);
    fixtures.push(fixture); fixture.detectChanges(); return fixture;
  }
  function detail() {
    const fixture = TestBed.createComponent(ProductMainComponent);
    fixtures.push(fixture); fixture.detectChanges(); return fixture;
  }

  for (let index = 0; index < 3; index++) {
    itWithClock(`inicializa imediatamente o contador ${index + 1} com o formato anterior`, () => {
      const consumer = consume(index);
      expect(start(index)).toMatch(/^\d{2,}D \d{2} : \d{2} : \d{2}$/);
      expect(consumer.values).toEqual([start(index)]);
      expect(intervals).toHaveBeenCalledTimes(1);
    });
    itWithClock(`não duplica o agendador ${index + 1} em chamadas repetidas`, () => {
      const consumer = consume(index); start(index); advance(2500);
      const last = consumer.values.at(-1);
      for (let n = 0; n < 10; n++) { expect(start(index)).toBe(last!); }
      expect(intervals).toHaveBeenCalledTimes(1);
      expect(consumer.values.length).toBe(3);
    });
    itWithClock(`avança o contador ${index + 1} uma vez por segundo sem reiniciar o prazo`, () => {
      const consumer = consume(index); const initial = seconds(start(index));
      advance(2000); start(index); advance(3000);
      expect(consumer.values.length).toBe(6);
      expect(consumer.values.map(seconds)).toEqual([0, 1, 2, 3, 4, 5].map(delta => initial - delta));
    });
    itWithClock(`suspende o contador ${index + 1} sem consumidores e retoma pelo mesmo prazo`, () => {
      const consumer = consume(index); const initial = seconds(start(index));
      advance(2000); consumer.subscription.unsubscribe(); expect(active()).toBe(0);
      advance(60000); const next = consume(index);
      expect(next.values.length).toBe(1); expect(seconds(next.values[0])).toBe(initial - 62);
      expect(start(index)).toBe(next.values[0]); expect(active()).toBe(1);
      advance(1000); expect(seconds(next.values.at(-1)!)).toBe(initial - 63);
    });
    itWithClock(`publica zero e encerra o contador ${index + 1} no término`, () => {
      const consumer = consume(index); const target = Date.now() + seconds(start(index)) * 1000;
      setTime(new Date(target - 1000)); advance(1000);
      expect(consumer.values.at(-1)).toBe('00D 00 : 00 : 00'); expect(active()).toBe(0);
      const count = consumer.values.length; advance(10000); start(index);
      expect(consumer.values.length).toBe(count); expect(active()).toBe(0);
    });
  }

  itWithClock('não cria intervalos ao construir o serviço ou apenas assinar', () => {
    consume(0); consume(1); consume(2); expect(intervals).not.toHaveBeenCalled();
  });
  itWithClock('inicializa os três contadores de forma independente', () => {
    const consumers = [0, 1, 2].map(consume); const first = [0, 1, 2].map(start);
    expect(new Set(first).size).toBe(3); expect(active()).toBe(3); advance(1000);
    consumers.forEach((consumer, index) => expect(seconds(consumer.values[1])).toBe(seconds(first[index]) - 1));
  });
  itWithClock('retorna o valor sem agendar trabalho se não há consumidores', () => {
    const value = start(0); expect(value).not.toBe(''); expect(intervals).not.toHaveBeenCalled();
    advance(5000); const consumer = consume(0); expect(seconds(consumer.values[0])).toBe(seconds(value) - 5);
  });
  itWithClock('compartilha um agendador e os mesmos valores entre vários consumidores', () => {
    const a = consume(1), b = consume(1); start(1); start(1); advance(3000);
    expect(a.values).toEqual(b.values); expect(a.values.length).toBe(4); expect(intervals).toHaveBeenCalledTimes(1);
  });
  itWithClock('reproduz imediatamente o último valor para uma segunda inscrição', () => {
    const a = consume(2); start(2); advance(2000); const b = consume(2);
    expect(b.values).toEqual([a.values.at(-1)!]); expect(a.values.length).toBe(3);
  });
  itWithClock('não interrompe o consumidor remanescente ao destruir outro', () => {
    const a = consume(1), b = consume(1); start(1); a.subscription.unsubscribe();
    const old = a.values.slice(); advance(3000);
    expect(active()).toBe(1); expect(a.values).toEqual(old); expect(b.values.length).toBe(4);
    b.subscription.unsubscribe(); expect(active()).toBe(0);
  });
  itWithClock('libera todos os intervalos quando os últimos consumidores saem', () => {
    const consumers = [0, 1, 2].map(consume); [0, 1, 2].forEach(start);
    consumers.forEach(c => c.subscription.unsubscribe()); expect(active()).toBe(0);
    expect(cleared).toHaveBeenCalledTimes(3); advance(60000);
    consumers.forEach(c => expect(c.values.length).toBe(1));
  });
  itWithClock('encerra inscrições e intervalos ao destruir o serviço', () => {
    const consumers = [0, 1, 2].map(consume); [0, 1, 2].forEach(start); service.ngOnDestroy();
    expect(consumers.every(c => c.subscription.closed)).toBeTrue(); expect(active()).toBe(0);
    advance(5000); consumers.forEach(c => expect(c.values.length).toBe(1));
  });
  itWithClock('não recria recursos nem aceita inscrições após destruir o serviço', () => {
    service.ngOnDestroy(); [0, 1, 2].forEach(start);
    expect(consume(0).subscription.closed).toBeTrue(); expect(intervals).not.toHaveBeenCalled();
  });
  itWithClock('tolera destruição repetida sem liberar duas vezes o mesmo intervalo', () => {
    consume(0); start(0); service.ngOnDestroy(); service.ngOnDestroy(); expect(cleared).toHaveBeenCalledTimes(1);
  });
  itWithClock('recalcula pelo relógio após uma suspensão longa do navegador', () => {
    const consumer = consume(0); const initial = seconds(start(0));
    setTime(new Date(Date.now() + 3600000)); advance(1000);
    expect(seconds(consumer.values.at(-1)!)).toBe(initial - 3601);
  });
  itWithClock('não retoma agendamento para uma oferta expirada enquanto estava sem consumidores', () => {
    const consumer = consume(0); start(0); consumer.subscription.unsubscribe();
    setTime(new Date(2030, 0, 1)); const next = consume(0);
    expect(next.values).toEqual(['00D 00 : 00 : 00']); expect(active()).toBe(0);
  });
  itWithClock('não publica valor antes da primeira inicialização', () => {
    const consumers = [0, 1, 2].map(consume); advance(10000);
    consumers.forEach(consumer => expect(consumer.values).toEqual([])); expect(active()).toBe(0);
  });
  itWithClock('mantém um único agendador durante recriações do BannerPair', () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const fixture = pair(); expect(active()).toBe(3); advance(1000); fixture.destroy(); expect(active()).toBe(0);
    }
    expect(intervals).toHaveBeenCalledTimes(15);
  });
  itWithClock('mantém dois agendadores durante recriações do ProductMain', () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const fixture = detail(); expect(active()).toBe(2); advance(1000); fixture.destroy(); expect(active()).toBe(0);
    }
    expect(intervals).toHaveBeenCalledTimes(10);
  });
  itWithClock('compartilha as ofertas entre BannerPair e ProductMain simultâneos', () => {
    const home = pair(), product = detail(); expect(active()).toBe(3); advance(2000);
    expect(home.componentInstance.offer_Time2).toBe(product.componentInstance.offer_Time2);
    home.destroy(); expect(active()).toBe(2); const previous = product.componentInstance.offer_Time2;
    advance(1000); expect(product.componentInstance.offer_Time2).not.toBe(previous);
    product.destroy(); expect(active()).toBe(0);
  });
  itWithClock('preserva o prazo e ignora componentes destruídos em Home → produto → Home', () => {
    const home = pair(); const first = seconds(home.componentInstance.offer_Time2); advance(1000); home.destroy();
    const old = home.componentInstance.offer_Time2; const product = detail(); advance(2000); product.destroy();
    const again = pair(); expect(seconds(again.componentInstance.offer_Time2)).toBe(first - 3);
    expect(home.componentInstance.offer_Time2).toBe(old); expect(active()).toBe(3);
  });
  itWithClock('compartilha as ofertas com o ApiKabum sem alterar seu contrato', () => {
    const home = pair(), api = TestBed.createComponent(ApiKabumComponent); fixtures.push(api); api.detectChanges();
    expect(active()).toBe(3); advance(1000);
    const instance = api.componentInstance as unknown as { offer_Time?: string[]; offer_Time1: string; offer_Time2: string; offer_Time3: string };
    expect(instance.offer_Time ?? [instance.offer_Time1, instance.offer_Time2, instance.offer_Time3]).toEqual([home.componentInstance.offer_Time1, home.componentInstance.offer_Time2, home.componentInstance.offer_Time3]);
    api.destroy(); expect(active()).toBe(3); home.destroy(); expect(active()).toBe(0);
  });
  itWithClock('atualiza o retorno público sem consumidores sem reiniciar ou agendar', () => {
    const value = seconds(start(0)); advance(5000);
    expect(seconds(start(0))).toBe(value - 5); expect(intervals).not.toHaveBeenCalled();
  });
  itWithClock('ignora um callback retido depois da destruição do serviço', () => {
    const consumer = consume(1); start(1);
    const callback = intervals.calls.mostRecent().args[0] as () => void;
    const value = service.offer_Time2; service.ngOnDestroy(); advance(5000); callback();
    expect(service.offer_Time2).toBe(value); expect(consumer.values).toEqual([value]);
  });
  itWithClock('formata corretamente a passagem entre dias, horas e minutos', () => {
    const consumer = consume(0); const target = Date.now() + seconds(start(0)) * 1000;
    setTime(new Date(target - 86401000)); advance(1000);
    expect(consumer.values.at(-1)).toBe('01D 00 : 00 : 00'); advance(1000);
    expect(consumer.values.at(-1)).toBe('00D 23 : 59 : 59');
    setTime(new Date(target - 61000)); advance(1000);
    expect(consumer.values.at(-1)).toBe('00D 00 : 01 : 00'); advance(1000);
    expect(consumer.values.at(-1)).toBe('00D 00 : 00 : 59');
  });

});
