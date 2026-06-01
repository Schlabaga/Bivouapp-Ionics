import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import {SpotDetailPage} from "../spot-detail/spot-detail.page";
import {SpotDetailPageModule} from "../spot-detail/spot-detail.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapPage,
    SpotDetailPageModule
  ]
})
export class MapPageModule {}
