import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExplorePage } from './explore.page';
import { ExplorePageRoutingModule } from './explore-routing.module';
import { SpotCardComponent } from '../components/spot-card/spot-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExplorePageRoutingModule,
    SpotCardComponent
  ],
  declarations: [ExplorePage]
})
export class ExplorePageModule {}
