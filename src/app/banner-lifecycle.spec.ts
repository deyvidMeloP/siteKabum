import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BannerComponent } from './components/banner/banner.component';
import { KabumServiceService } from './services/kabum-service.service';

@Component({ template: '<div [style.background-color]="color"><app-banner (styleChange)="color = $event"></app-banner></div>' })
class BannerHostComponent { color = '#022b9a'; }

describe('Ciclo de vida do BannerComponent', () => {
  let fixture: ComponentFixture<BannerComponent>;
  let colors: string[];
  let parent: ComponentFixture<BannerHostComponent> | undefined;
  const expectedColors = ['#870700', '#022b9a', '#1a1c1e', '#ff6601', '#ff6a01', '#232834', '#880801', '#870700', '#001994', '#880801', '#880700'];

  beforeEach(async () => {
    colors = [];
    parent = undefined;
    await TestBed.configureTestingModule({
      declarations: [BannerComponent, BannerHostComponent], imports: [CommonModule],
      providers: [{ provide: KabumServiceService, useValue: { changeColorBanner: (color: string) => { colors.push(color); if (parent) { parent.componentInstance.color = color; } } } }]
    }).compileComponents();
    fixture = create();
  });

  afterEach(() => { fixture.destroy(); parent?.destroy(); });

  function create(): ComponentFixture<BannerComponent> {
    const view = TestBed.createComponent(BannerComponent);
    document.body.appendChild(view.nativeElement);
    (view.componentInstance as any).styleChange?.subscribe((color: string) => colors.push(color));
    return view;
  }

  function pending(): number {
    return (fixture.componentInstance as any).pendingTimers.size;
  }

  function manual(slide: number): void {
    fixture.nativeElement.querySelectorAll('.manual-btn')[slide - 1].click();
    tick();
    fixture.detectChanges();
  }

  function capture(): Array<() => void> {
    const callbacks: Array<() => void> = [];
    spyOn(window, 'setTimeout').and.callFake((handler: TimerHandler) => {
      if (typeof handler === 'function') { callbacks.push(handler as () => void); }
      return callbacks.length;
    });
    spyOn(window, 'clearTimeout').and.stub();
    fixture.detectChanges();
    callbacks[0]();
    return callbacks;
  }

  it('inicia no primeiro banner e mantém somente o próximo timer após a renderização', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.first').style.marginLeft).toBe('0%');
    expect(fixture.nativeElement.querySelectorAll('.btn_Play').length).toBe(1);
    expect(pending()).toBe(1);
    expect(colors).toEqual([expectedColors[0]]);
    fixture.destroy();
  }));

  it('preserva os 11 banners, as cores e o intervalo de sete segundos', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    for (let slide = 1; slide <= 11; slide++) {
      expect(fixture.componentInstance.lastCall).toBe(slide);
      expect(colors[colors.length - 1]).toBe(expectedColors[slide - 1]);
      expect(fixture.componentInstance.slideOffset).toBe((1 - slide) * 100);
      tick(7000);
    }
    expect(fixture.componentInstance.lastCall).toBe(1);
    fixture.destroy();
  }));

  it('seleciona todos os banners manualmente sem acumular timers', fakeAsync(() => {
    fixture.detectChanges();
    for (let slide = 1; slide <= 11; slide++) {
      manual(slide);
      expect(fixture.componentInstance.lastCall).toBe(slide);
      expect(fixture.nativeElement.querySelector('.first').style.marginLeft).toBe(`${(1 - slide) * 100}%`);
      expect(pending()).toBe(1);
    }
    fixture.destroy();
  }));

  it('permite seleção manual durante a pausa sem reativar o timer', fakeAsync(() => {
    fixture.detectChanges();
    fixture.componentInstance.Pause();
    manual(5);
    tick(14000);
    expect(fixture.componentInstance.lastCall).toBe(5);
    expect(pending()).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.btn_Play').length).toBe(0);
    fixture.destroy();
  }));

  it('cancela também a inicialização pendente ao pausar imediatamente', fakeAsync(() => {
    fixture.detectChanges();
    fixture.componentInstance.Pause();
    tick();
    fixture.detectChanges();
    expect(pending()).toBe(0);
    expect(fixture.componentInstance.progressSlide).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.btn_Play').length).toBe(0);
    fixture.destroy();
  }));

  it('retoma o banner atual e aguarda sete segundos antes da próxima troca', fakeAsync(() => {
    fixture.detectChanges();
    manual(4);
    fixture.componentInstance.Pause();
    tick(8000);
    fixture.componentInstance.Pause();
    tick(6999);
    expect(fixture.componentInstance.lastCall).toBe(4);
    tick(1);
    expect(fixture.componentInstance.lastCall).toBe(5);
    fixture.destroy();
  }));

  it('cancela todos os timers na destruição e tolera o prazo original', fakeAsync(() => {
    fixture.detectChanges();
    fixture.destroy();
    expect(pending()).toBe(0);
    expect(() => tick(14000)).not.toThrow();
    expect(colors.length).toBe(0);
  }));

  it('ignora callbacks já enfileirados após a destruição', () => {
    const callbacks = capture();
    const last = fixture.componentInstance.lastCall;
    fixture.destroy();
    expect(() => callbacks.forEach(callback => callback())).not.toThrow();
    expect(fixture.componentInstance.lastCall).toBe(last);
    expect(colors.length).toBe(1);
    expect(pending()).toBe(0);
  });

  it('invalida callbacks antigos ao pausar', () => {
    const callbacks = capture().slice();
    fixture.componentInstance.Pause();
    callbacks.forEach(callback => callback());
    expect(fixture.componentInstance.progressSlide).toBeNull();
    expect(fixture.componentInstance.lastCall).toBe(1);
    expect(pending()).toBe(0);
  });

  it('invalida callbacks anteriores ao selecionar outro banner', () => {
    const callbacks = capture().slice();
    fixture.componentInstance.btn_Complete5();
    callbacks.forEach(callback => callback());
    expect(fixture.componentInstance.lastCall).toBe(5);
    expect(fixture.componentInstance.progressSlide).toBeNull();
  });

  it('não permite que callbacks de uma instância destruída afetem outra', () => {
    const callbacks = capture().slice();
    fixture.destroy();
    fixture = create();
    fixture.detectChanges();
    fixture.componentInstance.btn_Complete5();
    callbacks.forEach(callback => callback());
    expect(fixture.componentInstance.lastCall).toBe(5);
  });

  it('não altera elementos externos com as mesmas classes', fakeAsync(() => {
    const outside = document.createElement('div');
    outside.innerHTML = '<div class="first" style="margin-left:42%"></div><div class="filling btn_Play"></div><div class="btn_Pause">externo</div>';
    document.body.prepend(outside);
    const initial = outside.innerHTML;
    try {
      fixture.detectChanges();
      manual(2);
      fixture.componentInstance.Pause();
      expect(outside.innerHTML).toBe(initial);
    } finally {
      outside.remove();
      fixture.destroy();
    }
  }));

  it('tolera a ausência do controle local sem manipular outro elemento', fakeAsync(() => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.btn_Pause').remove();
    expect(() => fixture.componentInstance.Pause()).not.toThrow();
    fixture.destroy();
  }));

  it('não registra listeners a cada pausa e mantém somente um ícone', fakeAsync(() => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn_Pause');
    const listener = spyOn(button, 'addEventListener');
    for (let i = 0; i < 6; i++) {
      button.click();
      tick();
      fixture.detectChanges();
      expect(button.querySelectorAll('svg').length).toBe(1);
    }
    expect(listener).not.toHaveBeenCalled();
    fixture.destroy();
  }));

  it('ignora comandos tardios após a destruição', fakeAsync(() => {
    fixture.detectChanges();
    fixture.destroy();
    const last = fixture.componentInstance.lastCall;
    fixture.componentInstance.btn_Complete2();
    fixture.componentInstance.Pause();
    tick(14000);
    expect(fixture.componentInstance.lastCall).toBe(last);
    expect(colors.length).toBe(0);
    expect(pending()).toBe(0);
  }));

  it('reinicia o progresso ao selecionar novamente o mesmo banner', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.componentInstance.btn_Complete1();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.btn_Play').length).toBe(0);
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.btn_Play').length).toBe(1);
    expect(pending()).toBe(1);
    fixture.destroy();
  }));
  it('emite a cor inicial depois da primeira verificação da view do pai', fakeAsync(() => {
    parent = TestBed.createComponent(BannerHostComponent);
    expect(() => parent!.detectChanges()).not.toThrow();
    expect(parent.componentInstance.color).toBe('#022b9a');
    tick();
    expect(() => parent!.detectChanges()).not.toThrow();
    expect(parent.componentInstance.color).toBe('#870700');
    parent.destroy();
  }));
});
