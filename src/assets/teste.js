// Função TesteHello
function TesteHello() {

  const swiper = new Swiper('.swiper', {
    // Optional parameters
    
    slidesPerView: 'auto',/*product_item bugado*/
    loop: true,
  
    // If we need pagination
 
  
    // Navigation arrows
    navigation: {
      nextEl: '.IconForward',
      prevEl: '.IconBackward',
    },
  

  });
  }


  function swiper_Departments() {

    const swiper = new Swiper('.marker_Swiper', {
      // Optional parameters
      
      slidesPerView: 9.5,
      spaceBetween: 2,
      loop: true,
    
      // If we need pagination
   
    
      // Navigation arrows
      navigation: {
        nextEl: '.marker_Next',
        prevEl: '.marker_Back',
      },
    
  
    });
    }

    function swiper_Filter() {

      const swiper = new Swiper('.marker_Swiper', {
        // Optional parameters
        
        slidesPerView: 'auto',
        loop: false,
        spaceBetween: 13,
        navigation: false,
        simulateTouch: false,
        pagination: true,
        
        
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
         
          dragClass: 'swiper-scrollbar-drag'
        },
    
      });
      }
  
    

  function swiper_Submenu() {


    const swiper = new Swiper('.submenu_Swiper', {
      // Optional parameters
      
      slidesPerView: 15,
      allowTouchMove: false,
      direction: 'vertical',
      loop: false,
    
      // If we need pagination
   
    
      // Navigation arrows
      navigation: {
        nextEl: '.arrow_Down',
        prevEl: '.arrow_Up',
      },
    
  
    });

window.swiper_Cont = function(NewCont){
  console.log("teste")
}
swiper_Cont(-1)
    

    
    const swiperContainers = document.querySelectorAll('.submenu_Swiper_2');

    swiperContainers.forEach((container, index) => {

  // Inicialize um novo Swiper para cada contêiner
  const swiper2 = new Swiper(container, {
    slidesPerView: 15,
    allowTouchMove: false,
    direction: 'vertical',
    loop: false,
    navigation: {
      nextEl: '.arrow_Down_2',
      prevEl: '.arrow_Up_2',
    },
  });


 const father_Actual = container.parentElement

 const button_Back_2 = father_Actual.firstElementChild
 const button_Next_2 = father_Actual.lastElementChild


  let intervalId_2;
  let cont_2 = -1;

    button_Next_2.addEventListener("mouseenter", () => {
      console.log("passou")
      intervalId_2 = setInterval(() => {
        swiper2.slideNext();
  
        if (cont_2 < 5) {
          cont_2 += 1;
        }
  
        if (cont_2 === 0) {

            button_Back_2.style.display = "flex";

   
    
        }
  
        console.log("anext" + cont_2);
      }, 400);
    });
  
    button_Next_2.addEventListener("mouseleave", () => {
      clearInterval(intervalId_2);
    });

  let intervalId2_2;

    button_Back_2.addEventListener("mouseenter", () => {
      intervalId2_2 = setInterval(() => {
        swiper2.slidePrev();
  
        if (cont_2 === 0) {
          button_Back_2.style.display = "none";
        }
  
        if (cont_2 >= -1) {
          cont_2 -= 1;
        }
  
        console.log("prev" + cont_2);
      }, 400);
    });
  
    button_Back_2.addEventListener("mouseleave", () => {
      clearInterval(intervalId2_2);
    });
  


  })



  

    const button_Next = document.querySelector(".arrow_Down")
    const button_Back = document.querySelector(".arrow_Up")
  
    let intervalId;
    let cont = -1
    button_Next.addEventListener("mouseenter", ()=> {

    intervalId = setInterval(() => {
      swiper.slideNext();
      
      if(cont < 5){
        cont +=1 
      }

      if(cont == 0){
        button_Back.style.display = "flex"
      } 
      

       
      console.log("next"+cont)
        

    }, 400);
    });

    button_Next.addEventListener("mouseleave", () => {
    clearInterval(intervalId);
    });





  let intervalId2;

  button_Back.addEventListener("mouseenter", ()=> {

    intervalId2 = setInterval(() => {
     
      swiper.slidePrev();
      
      if(cont == 0){
        button_Back.style.display = "none"
      }

      if(cont >= -1){
        cont -=1 
      }
      
      console.log("prev"+cont)
  }, 400);
  });

  button_Back.addEventListener("mouseleave", () => {
  clearInterval(intervalId2);
  });


  




}
 