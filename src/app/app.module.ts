import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ApiKabumComponent } from './components/api-kabum/api-kabum.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { BannerComponent } from './components/banner/banner.component';
import { ProductsSaleComponent } from './components/products-sale/products-sale.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ApiKabumComponent,
    NavigationComponent,
    BannerComponent,
    ProductsSaleComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
