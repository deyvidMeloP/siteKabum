import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'site_venda';
  backgroundColor: string = '#FFFFFF'; // Cor padrão
  ngOnInit(): void {
    
  }
  onStyleChange(event: string) {

    this.backgroundColor = event;
  }
}
