import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit{
@Output() styleChange = new EventEmitter<string>();
state: boolean = false
play: boolean = true
lastCall: number = -1
ngOnInit(): void {
  this.btn_Complete1();
  
  setTimeout(()=>{
this.teste()
  },0)
}

teste(){
  const btn_Manual = document.querySelectorAll(".manual-btn") as NodeListOf<HTMLElement>;


}

timeoutIds: any[] = [];


btn_Complete1() {
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.lastCall = 1
  this.styleChange.emit('#870700');
  if(!this.play){
    slides.style.marginLeft = "0%"
  }
  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  
    setTimeout(()=>{
    
      btn_Manual.forEach((el)=>{
        el.classList.remove("btn_Play")
       })
  
       btn_Manual.forEach((el)=>{
        el.classList.remove("btn_Play")
        })
  
       slides.style.marginLeft = "0%"
  
       btn_Manual[0].classList.add("btn_Play");
    
    }, 0)
  
    const timeoutId = setTimeout(()=>{
    
      this.btn_Complete2()
    
    }, 7000)
    this.timeoutIds.push(timeoutId);
  }
  
 
}


btn_Complete2(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.lastCall = 2
  this.styleChange.emit('#022b9a');
  if(!this.play){
    slides.style.marginLeft = "-100%"
  }
  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  
    btn_Manual.forEach((el)=>{
    el.classList.remove("btn_Play")
    })
    slides.style.marginLeft = "-100%"
    btn_Manual[1].classList.add("btn_Play")
  
    const timeoutId = setTimeout(()=>{
    
      this.btn_Complete3()
    
    }, 7000)
  
    this.timeoutIds.push(timeoutId);
  }
 
}

btn_Complete3(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.styleChange.emit('#1a1c1e');
  this.lastCall = 3
  if(!this.play){
    slides.style.marginLeft = "-200%"
  }
  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    
    btn_Manual.forEach((el)=>{
      el.classList.remove("btn_Play")
     })
     slides.style.marginLeft = "-200%"
    btn_Manual[2].classList.add("btn_Play")
  
    const timeoutId = setTimeout(()=>{
    
      this.btn_Complete4()
    
    }, 7000)
    this.timeoutIds.push(timeoutId);
  }
 

}

btn_Complete4(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.styleChange.emit('#ff6601');
  this.lastCall = 4
  if(!this.play){
    slides.style.marginLeft = "-300%"
  }
  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  
    btn_Manual.forEach((el)=>{
      el.classList.remove("btn_Play")
     })
  
     slides.style.marginLeft = "-300%"
    btn_Manual[3].classList.add("btn_Play")
  
    const timeoutId = setTimeout(()=>{
    
      this.btn_Complete5()
    
    }, 7000)
    this.timeoutIds.push(timeoutId);
  }
 
}

  btn_Complete5(){
    const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
    const slides = document.querySelector(".first") as HTMLElement;
    this.styleChange.emit('#ff6a01');
    this.lastCall = 5
    if(!this.play){
      slides.style.marginLeft = "-400%"
    }
    else{
      this.timeoutIds.forEach(id => clearTimeout(id));
      this.timeoutIds = [];
  
      btn_Manual.forEach((el)=>{
        el.classList.remove("btn_Play")
       })
    
      slides.style.marginLeft = "-400%"
      btn_Manual[4].classList.add("btn_Play")
    
      const timeoutId = setTimeout(()=>{
      
        this.btn_Complete6()
      
      }, 7000)
      this.timeoutIds.push(timeoutId);
    }
   
  }

    btn_Complete6(){
      const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
      const slides = document.querySelector(".first") as HTMLElement;
      this.styleChange.emit('#232834');
      this.lastCall = 6
      if(!this.play){
        slides.style.marginLeft = "-500%"
      }

      else{
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
  
        btn_Manual.forEach((el)=>{
          el.classList.remove("btn_Play")
         })
      
         slides.style.marginLeft = "-500%"
        btn_Manual[5].classList.add("btn_Play")
      
        const timeoutId = setTimeout(()=>{
        
          this.btn_Complete7()
        
        }, 7000)
        this.timeoutIds.push(timeoutId);
      }
     

    }
      btn_Complete7(){
        const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
        const slides = document.querySelector(".first") as HTMLElement;
        this.styleChange.emit('#880801');
        this.lastCall = 7
        if(!this.play){
          slides.style.marginLeft = "-600%"
        }
        else{
          this.timeoutIds.forEach(id => clearTimeout(id));
          this.timeoutIds = [];
          
          btn_Manual.forEach((el)=>{
            el.classList.remove("btn_Play")
           })
        
           slides.style.marginLeft = "-600%"
          btn_Manual[6].classList.add("btn_Play")
        
          const timeoutId = setTimeout(()=>{
          
            this.btn_Complete8()
          
          }, 7000)
  
          this.timeoutIds.push(timeoutId);
        }
        
}

btn_Complete8(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.styleChange.emit('#870700');
  this.lastCall = 8
  if(!this.play){
    slides.style.marginLeft = "-700%"
  }
else{
  this.timeoutIds.forEach(id => clearTimeout(id));
  this.timeoutIds = [];
  
  btn_Manual.forEach((el)=>{
    el.classList.remove("btn_Play")
   })

   slides.style.marginLeft = "-700%"
  btn_Manual[7].classList.add("btn_Play")

  const timeoutId = setTimeout(()=>{
  
    this.btn_Complete9()
  
  }, 7000)

  this.timeoutIds.push(timeoutId);
}
  
}

btn_Complete9(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.styleChange.emit('#001994');
  this.lastCall = 9
  if(!this.play){
    slides.style.marginLeft = "-800%"
  }

  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    
    btn_Manual.forEach((el)=>{
      el.classList.remove("btn_Play")
     })
  
     slides.style.marginLeft = "-800%"
    btn_Manual[8].classList.add("btn_Play")
  
    const timeoutId = setTimeout(()=>{
    
      this.btn_Complete10()
    
    }, 7000)
  
    this.timeoutIds.push(timeoutId);
  }
  
}

btn_Complete10(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
  this.styleChange.emit('#880801');
  this.lastCall = 10
  if(!this.play){
    slides.style.marginLeft = "-900%"
  }

  else{
    this.timeoutIds.forEach(id => clearTimeout(id));
  this.timeoutIds = [];
  
  btn_Manual.forEach((el)=>{
    el.classList.remove("btn_Play")
   })

   slides.style.marginLeft = "-900%"
  btn_Manual[9].classList.add("btn_Play")

  const timeoutId = setTimeout(()=>{
  
    this.btn_Complete11()
  
  }, 7000)

  this.timeoutIds.push(timeoutId);
  }
  
}

btn_Complete11(){
  const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  const slides = document.querySelector(".first") as HTMLElement;
 this.styleChange.emit('#880700');
 this.lastCall = 11
 if(!this.play){
  slides.style.marginLeft = "-1000%"
}

else{
  this.timeoutIds.forEach(id => clearTimeout(id));
  this.timeoutIds = [];
  
  btn_Manual.forEach((el)=>{
    el.classList.remove("btn_Play")
   })

   slides.style.marginLeft = "-1000%"
  btn_Manual[10].classList.add("btn_Play")

  const timeoutId = setTimeout(()=>{
  
    this.btn_Complete1()
  
  }, 7000)

  this.timeoutIds.push(timeoutId);
}
  
}


Pause(){

  if(!this.state){
    const div = document.querySelector(".btn_Pause") as HTMLElement;
    const btn_Manual = document.querySelectorAll(".filling") as NodeListOf<HTMLElement>;
  this.timeoutIds.forEach(id => clearTimeout(id));
  this.timeoutIds = [];
  this.play = false
  btn_Manual.forEach((el)=>{
    el.classList.remove("btn_Play")
   })
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
div.addEventListener("click", ()=>{

})
  }

  else{
    const div = document.querySelector(".btn_Pause") as HTMLElement;

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


