import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Spot } from '../models/spot.model';
import { SpotsService } from '../services/spots';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit, ViewWillEnter {

  // Données
  allSpots: Spot[] = [];
  popularSpots: Spot[] = [];
  recommendedSpots: Spot[] = [];
  filteredSpots: Spot[] = [];

  selectedCategory = 'feed';

  categories = [
    { id: 'feed', label: 'Mon feed' },
    { id: 'all', label: 'Tout' },
    { id: 'bivouac', label: 'Bivouac' },
    { id: 'camping', label: 'Camping' },
    { id: 'refuge', label: 'Refuge' },
    { id: "point d'eau", label: "Point d'eau" }
  ];

  constructor(
    private spotsService: SpotsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSpots();
  }

  ionViewWillEnter() {
    this.loadSpots();
  }

  loadSpots() {
    this.spotsService.getSpots().subscribe({
      next: (spots) => {
        this.allSpots = spots;
        this.popularSpots = this.spotsService.getPopularSpots();
        this.recommendedSpots = this.spotsService.getRecommendedSpots();

        // On rafraîchit le filtre si on n'est pas sur le feed
        if (this.selectedCategory !== 'feed') {
          this.selectCategory(this.selectedCategory);
        }
      },
      error: (err) => console.error(err)
    });
  }

  selectCategory(catId: string) {
    this.selectedCategory = catId;

    if (catId === 'feed') {
      return;
    }

    if (catId === 'all') {
      this.filteredSpots = [...this.allSpots];
    } else {
      this.filteredSpots = this.allSpots.filter(
        s => s.type.toLowerCase() === catId.toLowerCase()
      );
    }
  }

  showAllSpots() {
    this.selectCategory('all');
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  openSpotDetail(spotId: number) {
    this.router.navigate(['/tabs/spot-detail', spotId]);
  }

  toggleFavorite(spot: Spot, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.spotsService.toggleFavorite(spot.id);
    spot.isFavorite = !spot.isFavorite;
  }
}
