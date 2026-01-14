import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExplorePage } from './explore.page';
import { ExplorePageRoutingModule } from './explore-routing.module';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExplorePageRoutingModule,
    ExploreContainerComponentModule
  ],
  declarations: [ExplorePage]
})
export class ExplorePageModule {}
