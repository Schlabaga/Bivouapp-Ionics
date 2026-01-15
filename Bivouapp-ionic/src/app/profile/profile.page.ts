import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { UsersService } from '../services/users';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  user: User | undefined;

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    // On charge l'utilisateur 1 par défaut
    this.user = this.usersService.getUserById(1);
  }

  // Fonction pour changer d'utilisateur (pour tester)
  changeUser() {
    if (this.user) {
      let newId: number;

      // Si on est pas au dernier user, on prend le suivant
      if (this.user.id < 5) {
        newId = this.user.id + 1;
      } else {
        // Sinon on revient au premier
        newId = 1;
      }

      this.user = this.usersService.getUserById(newId);
    }
  }

  // Fonction pour afficher le temps écoulé depuis la création
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} jours`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  }
}
