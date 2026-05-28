import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  date = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async handleSignUp() {
    if (this.password !== this.confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Les mots de passe ne correspondent pas.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const { data, error } = await this.authService.signUp(this.email, this.password);
    if (error) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: error.message,
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      await this.router.navigateByUrl('/tabs/explore');
    }
  }
}
