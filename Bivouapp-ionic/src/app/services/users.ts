import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  private users: User[] = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      address: '12 rue de la Paix, 75001 Paris',
      age: 28,
      phoneNumber: '06 12 34 56 78',
      profileImageUrl: 'https://i.pravatar.cc/150?u=1',
      favoriteList: [],
      bio: 'Passionné de photographie urbaine.',
      createdAt: new Date('2023-05-12')
    },
    {
      id: 2,
      name: 'Marie Leroy',
      email: 'marie.leroy@test.fr',
      address: '45 Avenue de la République, 69002 Lyon',
      age: 34,
      phoneNumber: '07 88 99 00 11',
      profileImageUrl: 'https://i.pravatar.cc/150?u=2',
      favoriteList: [],
      bio: 'Architecte d\'intérieur.',
      createdAt: new Date('2026-01-09')
    },
    {
      id: 3,
      name: 'Thomas Hénin',
      email: 't.henin@provider.com',
      address: '5 Place Bellecour, 69002 Lyon',
      age: 22,
      phoneNumber: '06 00 11 22 33',
      profileImageUrl: 'https://i.pravatar.cc/150?u=3',
      favoriteList: [],
      bio: 'Étudiant en STAPS.',
      createdAt: new Date('2020-01-20')
    },
    {
      id: 4,
      name: 'Sophie Bernard',
      email: 's.bernard@web.com',
      address: '102 Boulevard Haussmann, 75008 Paris',
      age: 45,
      phoneNumber: '01 42 67 89 00',
      profileImageUrl: 'https://i.pravatar.cc/150?u=4',
      favoriteList: [],
      bio: 'Exploratrice du dimanche.',
      createdAt: new Date('2024-08-15')
    },
    {
      id: 5,
      name: 'Lucas Petit',
      email: 'l.petit@service.fr',
      address: '8 rue des Lilas, 33000 Bordeaux',
      age: 19,
      phoneNumber: '06 54 32 10 98',
      profileImageUrl: 'https://i.pravatar.cc/150?u=5',
      favoriteList: [],
      bio: 'Fan de street-art.',
      createdAt: new Date('2026-01-05')
    }
  ];

  constructor() {}

  // retourne tous les utilisateurs
  getUsers(): User[] {
    return this.users;
  }

  // ajoute un nouvel utilisateur
  addUser(newUser: User): void {
    this.users.push(newUser);
  }

  // cherche un utilisateur par son ID
  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
