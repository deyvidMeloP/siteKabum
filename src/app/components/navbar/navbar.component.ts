import { Component, OnInit } from '@angular/core';

declare function swiper_Submenu(): any;
declare function swiper_Cont(num: any): any

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

ngOnInit(): void {
  swiper_Submenu()
}
  
departments_Enter(){
  const dpt = document.querySelector(".departments_Submenu") as HTMLElement
  const chevronDown = document.querySelector(".fa-chevron-down") as HTMLElement
  chevronDown.style.transform = "rotate(-180deg)"
  dpt.style.display = "flex" 
}

departments_Leave(){
  const dpt = document.querySelector(".departments_Submenu") as HTMLElement
  const chevronDown = document.querySelector(".fa-chevron-down") as HTMLElement
  const submenu_Opt = document.querySelectorAll(".submenu_Opt") as NodeListOf<HTMLElement>
  const submenu_Opt_2 = document.querySelectorAll(".submenu_Opt_2") as NodeListOf<HTMLElement>

  submenu_Opt.forEach((el)=>{
    el.style.display = "none"
  })


  submenu_Opt_2.forEach((el)=>{
    el.style.display = "none"
  })


  chevronDown.style.transform = "rotate(0deg)"

  dpt.style.display = "none" 
}



submenu_Click(op: number){
  
  const submenu_Opt = document.querySelectorAll(".submenu_Opt") as NodeListOf<HTMLElement>
    switch(op){
      
      case 1:
        submenu_Opt.forEach((el)=>{
          el.style.display = "none"
        })
        submenu_Opt[0].style.display = "flex"
      break;

      case 2:
        submenu_Opt.forEach((el)=>{
          el.style.display = "none"
        })
        submenu_Opt[1].style.display = "flex"
      break;
    }

}

submenu_SubOpt(op: number){
 
  const submenu_Opt = document.querySelectorAll(".submenu_Opt_2") as NodeListOf<HTMLElement>
  
  switch(op){
    
    case 1:
      submenu_Opt.forEach((el)=>{
        el.style.display = "none"
      })
      submenu_Opt[0].style.display = "flex"
    break;

    case 2:
      submenu_Opt.forEach((el)=>{
        el.style.display = "none"
      })
      submenu_Opt[1].style.display = "flex"
    break;
  }
}

}
