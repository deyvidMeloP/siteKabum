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
  