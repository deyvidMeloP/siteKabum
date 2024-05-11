// Função TesteHello
function TesteHello() {

  const swiper = new Swiper('.swiper', {
    // Optional parameters
    
    slidesPerView: 'auto',/*product_item bugado*/
    spaceBetween: 6,
    loop: true,
  
    // If we need pagination
 
  
    // Navigation arrows
    navigation: {
      nextEl: '.IconForward',
      prevEl: '.IconBackward',
    },
  

  });
  }
  