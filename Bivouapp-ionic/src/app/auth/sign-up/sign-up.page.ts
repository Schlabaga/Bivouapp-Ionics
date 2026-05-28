import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import {isValidDate} from "rxjs/internal/util/isDate";
import {dateTimestampProvider} from "rxjs/internal/scheduler/dateTimestampProvider";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
  email = '';
  password = '';
  date = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() { }

  async handleSignUp() {
    const { data, error } = await this.authService.signUp(this.email, this.password);
    if (error) {
      console.error('Erreur inscription:', error.message);
    } else {
      console.log('Utilisateur créé !', data);
      await this.router.navigateByUrl('/tabs/explore');
    }
  }

}
