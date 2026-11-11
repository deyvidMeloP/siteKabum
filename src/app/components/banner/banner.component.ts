import { Component, OnInit, OnDestroy, ElementRef, inject, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit, OnDestroy{
@Output() styleChange = new EventEmitter<string>();
  state: boolean = false;
  play: boolean = true;
  lastCall: number = 1;
  slideOffset = 0;
  progressSlide: number | null = null;
  private readonly bannerHost = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly pendingTimers = new Set<number>();
  private destroyed = false;
  private timerVersion = 0;
  private readonly bannerColors = ['#870700', '#022b9a', '#1a1c1e', '#ff6601', '#ff6a01', '#232834', '#880801', '#870700', '#001994', '#880801', '#880700'];

  ngOnInit(): void {
    this.schedule(() => this.btn_Complete1(), 0);
    this.schedule(() => this.teste(), 0);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cancelTimers();
  }

  private cancelTimers(): void {
    this.timerVersion++;
    this.pendingTimers.forEach(id => window.clearTimeout(id));
    this.pendingTimers.clear();
  }

  private schedule(callback: () => void, delay: number): void {
    const version = this.timerVersion;
    const id = window.setTimeout(() => {
      this.pendingTimers.delete(id);
      if (!this.destroyed && version === this.timerVersion) {
        callback();
      }
    }, delay);
    this.pendingTimers.add(id);
  }

  private selectSlide(slide: number): void {
    if (this.destroyed) {
      return;
    }
    this.cancelTimers();
    this.lastCall = slide;
    this.slideOffset = (1 - slide) * 100;
    this.progressSlide = null;
    this.styleChange.emit(this.bannerColors[slide - 1]);
    if (this.play) {
      this.schedule(() => this.progressSlide = slide, 0);
      this.schedule(() => this.selectSlide(slide % this.bannerColors.length + 1), 7000);
    }
  }

  teste(){
    const btn_Manual = this.bannerHost.nativeElement.querySelectorAll(".manual-btn") as NodeListOf<HTMLElement>;
  }

  btn_Complete1() {
    this.selectSlide(1);
  }

  btn_Complete2() {
    this.selectSlide(2);
  }

  btn_Complete3() {
    this.selectSlide(3);
  }

  btn_Complete4() {
    this.selectSlide(4);
  }

  btn_Complete5() {
    this.selectSlide(5);
  }

  btn_Complete6() {
    this.selectSlide(6);
  }

  btn_Complete7() {
    this.selectSlide(7);
  }

  btn_Complete8() {
    this.selectSlide(8);
  }

  btn_Complete9() {
    this.selectSlide(9);
  }

  btn_Complete10() {
    this.selectSlide(10);
  }

  btn_Complete11() {
    this.selectSlide(11);
  }

Pause(){
    if (this.destroyed) {
      return;
    }


  if(!this.state){
    const div = this.bannerHost.nativeElement.querySelector(".btn_Pause") as HTMLElement | null;
      if (!div) { return; }
  this.cancelTimers();
      this.progressSlide = null;
  this.play = false
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
 
  const novoSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
novoSVG.setAttribute('width', '16');
novoSVG.setAttribute('viewBox', '0 0 16 8');
novoSVG.setAttribute('fill', 'none');
novoSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
novoSVG.setAttribute('class', 'IconArrowDownChevron');
novoSVG.setAttribute('aria-hidden', 'true');

// Criar um novo path
const novoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
novoPath.setAttribute('d', 'M0 -3.65575e-06L16 0L8 8L0 -3.65575e-06Z');
novoPath.setAttribute('fill', '#FF6500');

// Adicionar o novo path ao novo SVG
novoSVG.appendChild(novoPath);

// Adicionar o novo SVG à div
div.appendChild(novoSVG);

div.style.transform = "rotate(-90deg)"
div.style.paddingTop = "3.2px"
this.state = true
  }

  else{
    const div = this.bannerHost.nativeElement.querySelector(".btn_Pause") as HTMLElement | null;
      if (!div) { return; }

  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  const novoSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  novoSVG.setAttribute('width', '12');
  novoSVG.setAttribute('height', '24');
  novoSVG.setAttribute('viewBox', '0 0 11 12');
  novoSVG.setAttribute('fill', 'none');
  novoSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  novoSVG.setAttribute('class', 'IconArrowDownChevron');
  novoSVG.setAttribute('aria-hidden', 'true');
  novoSVG.setAttribute('fill-rule', 'evenodd')
  novoSVG.setAttribute('clip-rule', 'evenodd')
  // Criar um novo path
  const novoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  novoPath.setAttribute('d', 'M7.23072 11.4998V0.499756H10.3881V11.4998H7.23072ZM0.610352 11.4998V0.499756H3.76776V11.4998H0.610352Z');
  novoPath.setAttribute('fill', '#FF6500');
  
  // Adicionar o novo path ao novo SVG
  novoSVG.appendChild(novoPath);
  
  // Adicionar o novo SVG à div
  div.appendChild(novoSVG);
  div.style.paddingTop = "0"
  div.style.transform = "rotate(0deg)"
  this.state = false
  this.play = true

  switch(this.lastCall){
      case 1:
        this.btn_Complete1()
        break;

      case 2:
        this.btn_Complete2()
        break;
      
      case 3:
        this.btn_Complete3()
        break;

      case 4:
        this.btn_Complete4()
        break;  

      case 5:
        this.btn_Complete5()
        break; 

      case 6:
        this.btn_Complete6()
        break;

      case 7:
        this.btn_Complete7()
        break;

      case 8:
        this.btn_Complete8()
        break;

      case 9:
        this.btn_Complete9()
        break;

      case 10:
        this.btn_Complete10()
        break;

      case 11:
        this.btn_Complete11()
        break;
  }
  }
  
}

}


