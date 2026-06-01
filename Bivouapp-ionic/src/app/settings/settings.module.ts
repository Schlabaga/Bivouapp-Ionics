import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './settings-routing.module';
import {TimeAgoPipe} from "../pipes/timeago-pipe";
import { SettingsPage } from './settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    TimeAgoPipe
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
