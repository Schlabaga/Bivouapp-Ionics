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

  // les listes pour stocker nos spots
  allSpots: Spot[] = [];
  popularSpots: Spot[] = [];
  recommendedSpots: Spot[] = [];
  filteredSpots: Spot[] = [];
  selectedCategory = 'feed'; // la catégorie de base

  categories = [
    { id: 'feed', label: 'Mon feed' },
    { id: 'tout', label: 'Tout' },
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

  // ça recharge les données quand on revient sur la page
  ionViewWillEnter() {
    this.loadSpots();
  }

  loadSpots() {
    this.spotsService.getSpots().subscribe({
      next: (spots) => {
        this.allSpots = spots;
        this.popularSpots = this.spotsService.getPopularSpots();
        this.recommendedSpots = this.spotsService.getRecommendedSpots();

        // on relance le tri si on a déjà choisi un filtre
        if (this.selectedCategory !== 'feed') {
          this.selectCategory(this.selectedCategory);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // pour filtrer les spots quand on clique sur une catégorie
  selectCategory(catId: string) {
    this.selectedCategory = catId;

    if (catId === 'feed') {
      return;
    }

    if (catId === 'tout') {
      this.filteredSpots = [...this.allSpots]; // on affiche tout
    } else {
      // on garde que ceux qui correspondent au type
      this.filteredSpots = this.allSpots.filter(
        s => s.type.toLowerCase() === catId.toLowerCase()
      );
    }
  }

  // pour aller voir la page du spot
  openSpotDetail(spotId: number) {
    this.router.navigate(['/tabs/spot-detail', spotId]);
  }

  // pour mettre ou enlever le coeur
  toggleFavorite(spot: Spot, event?: Event) {
    if (event) {
      event.stopPropagation(); // pour pas que ça ouvre le détail du spot
    }
    this.spotsService.toggleFavorite(spot.id);
  }
}
