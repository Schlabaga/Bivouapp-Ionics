import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private spotsService: SpotsService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.spotsService.getSpots().subscribe({
      next: (spots) => {
        // on prend juste ceux qui ont le coeur rouge
        this.favoriteSpots = spots.filter(s => s.isFavorite);
      },
      error: (err) => console.error(err)
    });
  }

  removeFavorite(spot: Spot) {
    // on met à jour le service
    this.spotsService.toggleFavorite(spot.id);

    this.favoriteSpots = this.favoriteSpots.filter(s => s.id !== spot.id);
  }

  openSpotDetail(id: number) {
    this.router.navigate(['/tabs/spot-detail', id]);
  }
}
