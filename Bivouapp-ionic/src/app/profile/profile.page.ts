import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { UsersService } from '../services/users';
import {TimeAgoPipe} from "../pipes/timeago-pipe";

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
    this.user = this.usersService.getUserById(1);
  }

  changeUser() {
    if (this.user) {
      let newId = (this.user.id < 5) ? this.user.id + 1 : 1;
      this.user = this.usersService.getUserById(newId);
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    // sécu si la date est une string
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;

    const years = Math.floor(diffDays / 365);
    return `${years} an${years > 1 ? 's' : ''}`;
  }
}
