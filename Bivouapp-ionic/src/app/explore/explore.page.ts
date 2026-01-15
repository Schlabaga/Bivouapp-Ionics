import { Component, OnInit } from '@angular/core';
import { Spot } from '../models/spot.model';
import { SpotsService } from '../services/spots';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit {

  popularSpots: Spot[] = [];
  recommendedSpots: Spot[] = [];
  allSpots: Spot[] = [];

  constructor(private spotsService: SpotsService) {}

  ngOnInit() {
    // On charge tous les spots au démarrage
    this.spotsService.getSpots().subscribe({
      next: (spots) => {
        this.allSpots = spots;
        this.popularSpots = this.spotsService.getPopularSpots();
        this.recommendedSpots = this.spotsService.getRecommendedSpots();
      },
      error: (err) => console.error('Erreur chargement spots:', err)
    });
  }
}
