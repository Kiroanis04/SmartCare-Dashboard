import { Routes } from '@angular/router';
import { DashboardComponent } from './Features/Dashboard/dashboard';
import { Login } from './Features/Auth/Components/login/login';
import { ProductsComponent } from './Features/Products/products-component/products-component';
import { OrdersComponent } from './Features/Orders/orders-component/orders-component';
import { PharmacistComponent } from './Features/Users/Pharmacists-component/users-component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Login,
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'inventory',
    component: ProductsComponent
  },
  {
    path: 'orders',
    component: OrdersComponent
  },
  {
    path: 'users/pharmacists',
    component: PharmacistComponent
    },

];
