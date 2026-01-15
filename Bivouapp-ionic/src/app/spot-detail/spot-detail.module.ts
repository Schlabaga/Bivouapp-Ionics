import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpotDetailPageRoutingModule } from './spot-detail-routing.module';

import { SpotDetailPage } from './spot-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpotDetailPageRoutingModule
  ],
  declarations: [SpotDetailPage]
})
export class SpotDetailPageModule {}
