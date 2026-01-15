import { Component, OnInit } from '@angular/core';
import { Spot } from '../models/spot.model';
import { SpotsService } from '../services/spots';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: false,
})
export class FavoritesPage implements OnInit {

  favoriteSpots: Spot[] = [];

  constructor(private spotsService: SpotsService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  // Chargement des favoris depuis le service
  loadFavorites() {
    this.spotsService.getSpots().subscribe({
      next: (spots) => {
        // on filtre les favoris
        this.favoriteSpots = spots.filter(spot => spot.isFavorite);
        console.log( this.favoriteSpots);
      },
      error: (err) => console.error('Erreur chargement favoris:', err)
    });
  }

  // Quand on retire un spot des favoris
  handleRemove(spotId: number) {
    console.log('Suppression du spot id:', spotId);
    // on filtre le tableau pour que l'UI se mette à jour direct
    this.favoriteSpots = this.favoriteSpots.filter(s => s.id !== spotId);
  }

  // Refresh à chaque fois qu'on revient sur la page
  ionViewWillEnter() {
    this.loadFavorites();
  }
}
