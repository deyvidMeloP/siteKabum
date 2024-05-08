import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ApiKabumComponent } from './components/api-kabum/api-kabum.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { BannerComponent } from './components/banner/banner.component';
import { ProductsSaleComponent } from './components/products-sale/products-sale.component';
import { register } from 'swiper/element/bundle';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { HomeComponent } from './components/home/home.component';
// register Swiper custom elements
register();



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ApiKabumComponent,
    NavigationComponent,
    BannerComponent,
    ProductsSaleComponent,
    BannerPairComponent,
    ProductMainComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
