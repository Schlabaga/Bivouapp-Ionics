import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpotDetailPage } from './spot-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SpotDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpotDetailPageRoutingModule {}
