import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductMainComponent } from './components/product_Page/product-main/product-main.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirecionamento da rota vazia para 'home'
  { path: 'home', component: HomeComponent },
  { path: 'Product', component: ProductMainComponent},
  { path: 'Product/:productName', component: ProductMainComponent },
  { path: 'Filter', component: ProductFilterComponent},
  { path: 'Filter/:filterName', component: ProductFilterComponent},
  {path: 'Filter/:filterName/:subsectionName', component: ProductFilterComponent},
  {path: 'Filter/:filterName/:subsectionName/:parentName', component: ProductFilterComponent}
  
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
