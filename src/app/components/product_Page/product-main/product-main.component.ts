import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-product-main',
  templateUrl: './product-main.component.html',
  styleUrl: './product-main.component.css'
})
export class ProductMainComponent implements OnInit{

  produto: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.produto = history.state.produto;
   
  }

 
}
