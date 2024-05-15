import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  backgroundColor: string = '#870700';   
  ngOnInit(): void {
    this.onStyleChange(this.backgroundColor)
  }
 

  onStyleChange(event: string) {

    this.backgroundColor = event;
  }
}
