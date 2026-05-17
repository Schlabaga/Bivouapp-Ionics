import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {

  // 1. On déclare les variables pour le formulaire
  email = '';
  password = '';

  // 2. On injecte les outils dans le constructeur
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async handleSignIn() {
    const { data, error } = await this.authService.signIn(this.email, this.password);

    if (error) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: error.message,
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      await this.router.navigate(['/tabs/explore']);
    }
  }
}
