import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListingSpotsPage } from './listing-spots.page';

const routes: Routes = [
  {
    path: '',
    component: ListingSpotsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListingSpotsPageRoutingModule {}
