import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'sign-in',
        loadChildren: () => import('../auth/sign-in/sign-in.module').then(m => m.SignInPageModule)
      },
      {
        path: 'sign-up',
        loadChildren: () => import('../auth/sign-up/sign-up.module').then(m => m.SignUpPageModule)
      }
    ]
  },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'explore',
        loadChildren: () => import('../explore/explore.module').then(m => m.ExplorePageModule)
      },
      {
        path: 'favorites',
        loadChildren: () => import('../favorites/favorites.module').then(m => m.FavoritesPageModule)
      },
      {
        path: 'publish',
        loadChildren: () => import('../publish/publish.module').then(m => m.PublishPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'spot-detail/:id',
        loadChildren: () => import('../spot-detail/spot-detail.module').then(m => m.SpotDetailPageModule)
      },
      {
        path: 'map',
        loadChildren: () => import('../map/map.module').then(m => m.MapPageModule)
      },
      {
        path: '',
        redirectTo: 'explore',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/explore',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
