import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy{

  Section: any = []
  subSection: any = []
  nameSub: any[] = []
  swiper: any
  swiperSection: any
  swiperParent: any
  intervalId: any;
  cont: number = 0;
  contSection: number = 0;
  contSubsection: number = 0;
  parent: any[] = []
  nameSection: any[] = [] 
constructor(

  private sectionService: KabumServiceService,
  private subSectionService: KabumServiceService,
  private router: Router,
  private stateService: KabumServiceService

){
 
}

teste(){
  const a = document.querySelector(".downMenu_Sublist") as HTMLElement
  alert(a.offsetHeight)
}

  ngOnInit(): void {
  this.getDadosSection()
  setTimeout(()=>{
    if(this.swiper){
      this.swiper.update()
    }
    if(this.swiperSection){
      this.swiperSection.update()
    }
    if(this.swiperParent){
      this.swiperParent.update()
    }
    const swiperContainer = document.querySelector('.swiper_Subsection');
    const swiperContainerSection = document.querySelector('.swiper_Section');
    const swiperContainerParent= document.querySelector('.swiper_Parent')
  
    this.swiper = (swiperContainer as any).swiper;
    this.swiperSection = (swiperContainerSection as any).swiper
    this.swiperParent = (swiperContainerParent as any).swiper
   

       
    const backButton_Section = document.querySelector('.arrow_Down');
    const nextButton_Section = document.querySelector('.arrow_Up');
    const backButton = document.querySelector('.arrow_Down_2');
    const nextButton = document.querySelector('.arrow_Up_2');
    const backButton_Subsection = document.querySelector('.arrow_Down_3');
    const nextButton_Subsection = document.querySelector('.arrow_Up_3');
    
    
    
   console.log(this.swiper)

    if (backButton) {
      backButton.addEventListener('mouseenter', this.swipeBack.bind(this));
    }

    if (nextButton) {
      nextButton.addEventListener('mouseenter', this.swipeNext.bind(this));
    }

    if(backButton_Section){
     backButton_Section.addEventListener('mouseenter', this.swipeSectionBack.bind(this)) 
    }

    if(nextButton_Section){
      nextButton_Section.addEventListener('mouseenter', this.swipeNextSection.bind(this))
    }

    
    if(backButton_Subsection){
      backButton_Subsection.addEventListener('mouseenter', this.swipeSubsectionBack.bind(this)) 
     }
 
     if(nextButton_Subsection){
       nextButton_Subsection.addEventListener('mouseenter', this.swipeNextSubsection.bind(this))
     }
  
  },0)
  
}

ngAfterViewInit(): void {


}

ngOnDestroy(): void {
  console.log('ngOnDestroy foi ativado!');
  if (this.swiper) {
    this.swiper.destroy();
  }
  if (this.swiperSection) {
    this.swiperSection.destroy();
  }
  if (this.swiperParent) {
    this.swiperParent.destroy();
  }
}


swipeSectionBack(){

  let value =  this.Section.length - 15

  const buttonNext = document.querySelector(".arrow_Up") as HTMLElement
  
    this.intervalId = setInterval(() => {
      if (this.contSection < (value)) {
  
        this.swiperSection.slideNext();
        this.swiperSection.update()
        this.contSection += 1;
        console.log("teste")
        if(buttonNext.style.display != "flex"){
            buttonNext.style.display = "flex"
            
        }
        
      } 
      
      else {
        clearInterval(this.intervalId);
      }
    
    }, 500);  

}

swipeSubsectionBack(){

  let value =  this.Section.length - 14
  
  const buttonNext = document.querySelector(".arrow_Up_3") as HTMLElement
  
    this.intervalId = setInterval(() => {
      if (this.contSubsection < (value)) {
  
        this.swiperParent.slideNext();
        this.swiperParent.update()
        this.contSubsection += 1;
        
        if(buttonNext.style.display != "flex"){
          
          buttonNext.style.display = "flex"
            
        }
        
      } 
      
      else {
        clearInterval(this.intervalId);
      }
    
    }, 500);  

}

swipeNextSubsection(){

  this.intervalId = setInterval(() => {
  
    if (this.contSubsection > 0) {
      this.swiperParent.slidePrev();
      this.swiperParent.update()
      this.contSubsection -= 1;

      if(this.contSubsection == 0){
        const buttonNext = document.querySelector(".arrow_Up_3") as HTMLElement
        buttonNext.style.display = "none"
        clearInterval(this.intervalId);
      }
    } 
    
    
  
  }, 500);

}

swipeBack(): void {
  
  const backButton = document.querySelector('.arrow_Down_2');

  const buttonNext = document.querySelector(".arrow_Up_2") as HTMLElement

  let value =  this.nameSub.length  - 14
 
  if(value > 0){

    this.intervalId = setInterval(() => {
      if (this.cont < (value)) {
        
        this.swiper.slideNext();
        this.swiper.update()
        this.cont += 1;
        
        if(buttonNext.style.display != "flex"){
            buttonNext.style.display = "flex"
            
        }
        
      } 
      
      else {
        clearInterval(this.intervalId);
      }
    
    }, 500);

  }
 
}

swipeNextSection(){

  this.intervalId = setInterval(() => {
  
    if (this.contSection > 0) {
      this.swiperSection.slidePrev();
      this.swiperSection.update()
      this.contSection -= 1;

      if(this.contSection == 0){
        const buttonNext = document.querySelector(".arrow_Up") as HTMLElement
      buttonNext.style.display = "none"
      clearInterval(this.intervalId);
      }
    } 
    
    
  
  }, 500);

}
leaveButton(){

  clearTimeout(this.intervalId)

}

swipeNext(){

  this.intervalId = setInterval(() => {
    if (this.cont > 0) {
      this.swiper.slidePrev();
      this.swiper.update()
      this.cont -= 1;

      if(this.cont == 0){
        const buttonNext = document.querySelector(".arrow_Up_2") as HTMLElement
        buttonNext.style.display = "none"
        clearInterval(this.intervalId);
      }
    } 
  
  }, 500);

}

leave(){

  this.cont = 0
  this.contSection = 0
  this.contSubsection = 0
  this.swiperSection.slideTo(0)
  this.swiper.slideTo(0);
  this.swiperParent.slideTo(0)
  clearInterval(this.intervalId)
}

getDadosSection(){

  this.sectionService.getDadosSection().subscribe(

    (data:any[]) =>{

      this.Section = data
      this.getDadosSubsection()
      

    },
    (error: any) => {
      console.error('Erro ao obter dados do serviço:', error);
    }
  )

}

getDadosSubsection(){

  this.subSectionService.getDadosSubsection().subscribe(

    (data: any[]) =>{

      this.subSection = data

     
    },

    (error: any)=>{
      console.error('Erro ao obter dados do serviço:', error);
    }


  )
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
  const submenu_Opt = document.querySelector(".submenu_Opt") as HTMLElement
  const submenu_Parent = document.querySelector(".submenu_Parent") as HTMLElement

  const buttonSection = document.querySelector(".arrow_Up") as HTMLElement
  const buttonSubsection = document.querySelector(".arrow_Up_2") as HTMLElement
  const buttonParent = document.querySelector(".arrow_Up_3") as HTMLElement

  submenu_Opt.style.display = "none"

  submenu_Parent.style.display = "none"


  buttonSection.style.display = "none"
  buttonSubsection.style.display = "none"
  buttonParent.style.display = "none"
  chevronDown.style.transform = "rotate(0deg)"

  dpt.style.display = "none" 
}



submenu_Click(section: any){
 
  this.nameSection[0] = section.name
  const submenu_Opt = document.querySelector(".submenu_Opt") as HTMLElement
  const submenu_Parent = document.querySelector(".submenu_Parent") as HTMLElement

  submenu_Parent.style.display = "none"
  const buttonNext = document.querySelector(".arrow_Up_2") as HTMLElement
  buttonNext.style.display = "none"

  this.nameSub = []
  submenu_Opt.style.display = "none"

  for(let subsection of this.subSection){

  if(subsection.scId == section.id){

    this.nameSub.push(subsection)
    console.log(subsection.name)
  }

}
  const buttonBack = document.querySelector(".arrow_Down_2") as HTMLElement

  
  if((this.nameSub.length - 15) <= 0){
   
    buttonBack.style.display = "none"

  }

  else{
     buttonBack.style.display = "flex"
  }


  submenu_Opt.style.display = "flex"
  
  this.cont = 0
  this.contSubsection = 0
}

submenu_SubOpt(subsection: any){

  this.parent = []
this.nameSection[1] = subsection.name
  const submenu_Opt = document.querySelector(".submenu_Parent") as HTMLElement
  const buttonNext = document.querySelector(".arrow_Up_3") as HTMLElement
  buttonNext.style.display = "none"

  for(let parent of this.subSection){
  
    if(subsection.id == parent.parentId){
      this.parent.push(parent)
      
    }
 
  }

  const buttonBack = document.querySelector(".arrow_Down_3") as HTMLElement

  
  if((this.nameSub.length - 15) <= 0){
   
    buttonBack.style.display = "none"

  }

  else{
     buttonBack.style.display = "flex"
  }

  submenu_Opt.style.display = "flex"
  this.contSubsection = 0
}

NavigationPage(name: string){
  this.leave()
  this.leaveButton()
  this.departments_Leave()

  this.stateService.changeFilterName(name);
  this.router.navigateByUrl('/Filter');
   
}

}
