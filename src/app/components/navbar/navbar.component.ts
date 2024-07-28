import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { KabumServiceService } from '../../services/kabum-service.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy{

  @ViewChild('observedElement', { static: true }) observedElement!: ElementRef;
  private resizeObserver!: ResizeObserver;

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
  searchQuery: string = '';
  products: any[] = [];
  results: any[] = [];
  mobileSection: any
  swiperMobile: any
  menuHamb: any
  constructor(

  private sectionService: KabumServiceService,
  private subSectionService: KabumServiceService,
  private router: Router,
  private stateService: KabumServiceService,
  private productService: KabumServiceService,
  private renderer: Renderer2,
  private commandSource: KabumServiceService,


){
 
}

teste(){
  const a = document.querySelector(".downMenu_Sublist") as HTMLElement
  alert(a.offsetHeight)
}

  ngOnInit(): void {

  this.getDadosService()
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

    if(this.swiperMobile){
      this.swiperMobile.update()
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

     const swiperMobile: any = document.querySelector(".hbg_Section")

     const swiperParams = {
     
      spaceBetween: 0,
      touchReleaseOnEdges: true,
        on: {
          init(){}
        }
     
      }

     Object.assign(swiperMobile, swiperParams)
     swiperMobile.initialize()
     this.swiperMobile = swiperMobile


  },0)
  this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.onResize(entry.contentRect.width);
      }
    });

    this.resizeObserver.observe(this.observedElement.nativeElement);

}

onResize(newWidth: number): void {

  if(window.getComputedStyle(this.menuHamb).display == "flex" && newWidth > 1020){

    this.departments_Enter()
  }

  if(newWidth > 1020){
    (document.querySelector(".navbar_downMenu") as HTMLElement).style.display = "block"

    const menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
    const IconSandwich = document.querySelector(".menuMobile .IconSandwich") as HTMLElement
    const iconClose = document.querySelector(".buttonMobileSandwich") as HTMLElement
  
    (menuHamb.querySelector(".hbg_Swiper_Section") as HTMLElement).style.display = "none";
    (menuHamb.querySelector(".hbg_Swiper_Subsection") as HTMLElement).style.display = "none";
    (menuHamb.querySelector(".hbg_Swiper_Parent") as HTMLElement).style.display = "none";

    IconSandwich.style.display = "flex"
    iconClose.style.display = "none"
    menuHamb.style.display = "none"
    menuHamb.style.backgroundColor = "#0060b1"
    this.commandSource.sendCommand('flex');
  
  }

  else if(newWidth <= 1020){
   (document.querySelector(".navbar_downMenu") as HTMLElement).style.display = "none"
  }
 
}

ngAfterViewInit(): void {

this.menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
}

getDadosService(){
  this.productService.getDados().subscribe(
    (data: any[])=>{
      this.products = data
    },

    (error: any) => {
      console.error('Erro ao obter dados do serviço:', error);
    }
  )
}


onSearchChange(event: any): void {
  
  const searchQueryLower = this.searchQuery.toLocaleLowerCase()
  
  if(searchQueryLower == ''){
    this.results = []
  }

  else{
    this.results = this.products.filter((el, index)=>{

      const word = el.name_Product.toLocaleLowerCase()
      return word.includes(searchQueryLower)
      
  
    })
  }
console.log(this.results[0])

  const navbar = document.querySelector(".navbar_Menu") as HTMLElement
  
  let tips_Search: any = '' ;

  if(window.getComputedStyle(navbar).display == "none"){
    
    const navbar_Menu = document.querySelector(".navbar_menuMobile") as HTMLElement

    tips_Search = navbar_Menu.querySelector(".tips_Search") as HTMLElement
  }

  else{
    const navbar_Menu = document.querySelector(".navbar_Menu") as HTMLElement
    tips_Search = navbar_Menu.querySelector(".tips_Search") as HTMLElement
  }
 
 /* const tips_Search = document.querySelector(".tips_Search") as HTMLElement*/

  const li = tips_Search.querySelectorAll(".tips") as NodeListOf <HTMLElement>

  li.forEach((el)=>{

    tips_Search.removeChild(el)
  })

  for(let product of this.results){

    const li = this.renderer.createElement('li')
    const img = this.renderer.createElement('img')
    const h1 = this.renderer.createElement('h1')

    this.renderer.setAttribute(img, 'src', product.imageUrl)
   
    this.renderer.appendChild(h1,  this.renderer.createText(product.name_Product))

    this.renderer.appendChild(li, img)
  
    this.renderer.appendChild(li, h1)
  
    this.renderer.addClass(li, 'tips')

    tips_Search.appendChild(li)

    this.renderer.listen(li, 'click', ()=>{


      let tips_Search: any = ""
      
      if(window.getComputedStyle(navbar).display == "none"){
    
        const navbar_Menu = document.querySelector(".navbar_menuMobile") as HTMLElement
    
        tips_Search = navbar_Menu.querySelector(".tips_Search") as HTMLElement
      }
    
      else{
        const navbar_Menu = document.querySelector(".navbar_Menu") as HTMLElement
        tips_Search = navbar_Menu.querySelector(".tips_Search") as HTMLElement
      }
     
      const li = tips_Search.querySelectorAll(".tips") as NodeListOf <HTMLElement>

    li.forEach((el)=>{

      tips_Search.removeChild(el)
    })
      this.stateService.changeProductMainName(product)
      window.scrollTo(0, 0);
      this.router.navigateByUrl('/Product').then(() => {
      });
  
    })
  }

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
    (data: any[]) => {
      this.Section = data;
      this.getDadosSubsection()
      console.log('Dados no componente:', this.Section);
    },
    (error: any) => {
      console.error('Erro ao obter dados do serviço:', error);
    }
  );

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



submenu_Click(section: any, op: number){
  let submenu_Opt
  let submenu_Parent
  this.nameSection[0] = section.name
  this.nameSub = []
 
  if(op == 2){
    
    let Section = document.querySelector(".hbg_Swiper_Section") as HTMLElement
    submenu_Opt = document.querySelector(".hbg_Swiper_Subsection") as HTMLElement
    
    for(let subsection of this.subSection){
     
      if(subsection.scId == section.id){
    
        this.nameSub.push(subsection)
       
      }
    
    }

      Section.style.display = "none"
     submenu_Opt.style.display = "block"

  }

else if(op == 1){

  submenu_Opt = document.querySelector(".submenu_Opt") as HTMLElement
  submenu_Parent = document.querySelector(".submenu_Parent") as HTMLElement

  submenu_Parent.style.display = "none"
  const buttonNext = document.querySelector(".arrow_Up_2") as HTMLElement
  buttonNext.style.display = "none"

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
}

submenu_SubOpt(subsection: any, op: number){
  this.parent = []
  this.nameSection[1] = subsection.name
  let submenu_Opt
  if(op == 2){
   
    const submenu_Father = document.querySelector(".hbg_Swiper_Subsection") as HTMLElement
   
    submenu_Opt = document.querySelector(".hbg_Swiper_Parent") as HTMLElement
    
    for(let parent of this.subSection){
  
      if(subsection.id == parent.parentId){
        this.parent.push(parent)
        
      }
   
    }

    submenu_Father.style.display = "none"
    submenu_Opt.style.display = "block"
  
  }

  else{

    submenu_Opt = document.querySelector(".submenu_Parent") as HTMLElement
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
 
 
}

backMobile(name: string){
  let Section, beginMenu, subsection, parent
  switch(name){

    case 'section':

    Section = document.querySelector(".hbg_Swiper_Section") as HTMLElement
    beginMenu = document.querySelector(".hbg_Begin") as HTMLElement
    Section.style.display = "none"
    beginMenu.style.display = "block"
    const menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
    menuHamb.style.backgroundColor = "#0060b1"


    break

    case 'subsection':

    Section = document.querySelector(".hbg_Swiper_Section") as HTMLElement
    subsection = document.querySelector(".hbg_Swiper_Subsection") as HTMLElement
    subsection.style.display = "none"
    Section.style.display = "block"
    
    break;

    case 'parent':

    parent = document.querySelector(".hbg_Swiper_Parent") as HTMLElement
    subsection = document.querySelector(".hbg_Swiper_Subsection") as HTMLElement
    parent.style.display = "none"
    subsection.style.display = "block"
    break

  
  }

}

nextMobile(){
  const section = document.querySelector(".hbg_Swiper_Section") as HTMLElement
  const beginMenu = document.querySelector(".hbg_Begin") as HTMLElement
  const menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
  menuHamb.style.backgroundColor = "#F2F3F4"
  section.style.display = "block"
  beginMenu.style.display = "none"
}


clickMenuMobile(){
  const menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
  const IconSandwich = document.querySelector(".menuMobile .IconSandwich") as HTMLElement
  IconSandwich.style.display = "none"
  const iconClose = document.querySelector(".buttonMobileSandwich") as HTMLElement
  const navbardownMenu = document.querySelector(".navbar_downMenu") as HTMLElement
  navbardownMenu.style.display = "none"
  iconClose.style.display = "flex"
  menuHamb.style.display = "flex"
  const beginMenu = document.querySelector(".hbg_Begin") as HTMLElement
  beginMenu.style.display = "block"
  this.commandSource.sendCommand('none');

}

closeMenuMobile(){
  const menuHamb = document.querySelector(".menu_Hamburguer") as HTMLElement
  const IconSandwich = document.querySelector(".menuMobile .IconSandwich") as HTMLElement
  const iconClose = document.querySelector(".buttonMobileSandwich") as HTMLElement
  const navbardownMenu = document.querySelector(".navbar_downMenu") as HTMLElement

   (menuHamb.querySelector(".hbg_Swiper_Section") as HTMLElement).style.display = "none";
    (menuHamb.querySelector(".hbg_Swiper_Subsection") as HTMLElement).style.display = "none";
    (menuHamb.querySelector(".hbg_Swiper_Parent") as HTMLElement).style.display = "none";


  IconSandwich.style.display = "flex"
  iconClose.style.display = "none"
  this.menuHamb.style.display = "none"
  this.menuHamb.style.backgroundColor = "#0060b1"
  this.commandSource.sendCommand('flex');

  if(menuHamb.offsetWidth > 1020){
  navbardownMenu.style.display = "block"
  }

  


}
NavigationPage(name: string){
  this.leave()
  this.leaveButton()
  this.departments_Leave()
  this.closeMenuMobile()
  this.stateService.changeFilterName(name);
  this.router.navigateByUrl('/Filter');
   
}


}
