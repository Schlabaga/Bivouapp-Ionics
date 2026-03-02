import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Indispensable pour le [(ngModel)]
import { IonicModule } from '@ionic/angular'; // Indispensable pour les balises <ion-...>

import { SignInPageRoutingModule } from './sign-in-routing.module';
import { SignInPage } from './sign-in.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignInPageRoutingModule,
  ],
  declarations: [SignInPage]
})
export class SignInPageModule {}
