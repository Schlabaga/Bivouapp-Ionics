import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListingSpotsPageRoutingModule } from './listing-spots-routing.module';

import { ListingSpotsPage } from './listing-spots.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingSpotsPageRoutingModule
  ],
  declarations: [ListingSpotsPage]
})
export class ListingSpotsPageModule {}
