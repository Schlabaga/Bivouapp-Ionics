import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {authGuard} from "./guards/auth-guard";

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () => import('./auth/welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate:[authGuard]
  },
  {
    path: 'spot-detail',
    loadChildren: () => import('./spot-detail/spot-detail.module').then( m => m.SpotDetailPageModule),
    canActivate:[authGuard]
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./auth/sign-in/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./auth/sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule),
    canActivate:[authGuard]
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
