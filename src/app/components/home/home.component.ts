import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, OnInit } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  private readonly visibilityDestroyRef = inject(DestroyRef);
  changeDisplay: any
  constructor(private commandSource: KabumServiceService) {}


  backgroundColor: string = '#870700';   
  ngOnInit(): void {
    alert("O site está passando por uma mudança de database, por isso os dados estão demorando 50 segundos para serem carregados")
    this.onStyleChange(this.backgroundColor)

    this.changeDisplay = this.commandSource.command$.pipe(takeUntilDestroyed(this.visibilityDestroyRef)).subscribe(
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
