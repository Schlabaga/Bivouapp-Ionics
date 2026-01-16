import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Spot } from '../models/spot.model';
import { SpotsService } from '../services/spots';

@Component({
  selector: 'app-listing-spots',
  templateUrl: './listing-spots.page.html',
  styleUrls: ['./listing-spots.page.scss'],
  standalone:false,
})
export class ListingSpotsPage implements OnInit {

  spots: Spot[] = [];
  pageTitle: string = 'Spots';
  mode: 'all' | 'popular' | 'recommended' | 'favorites' = 'all';

  constructor(
    private spotsService: SpotsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Récupère le mode depuis les paramètres de route
    this.route.queryParams.subscribe(params => {
      if (params['mode']) {
        this.mode = params['mode'];
      } else {
        this.mode = 'all';
      }
      this.updatePageTitle();
      this.loadSpots();
    });
  }

  ionViewWillEnter() {
    // Recharge les spots à chaque fois qu'on revient sur la page
    this.loadSpots();
  }

  updatePageTitle() {
    switch(this.mode) {
      case 'popular':
        this.pageTitle = 'Spots populaires';
        break;
      case 'recommended':
        this.pageTitle = 'Recommandés près de vous';
        break;
      case 'favorites':
        this.pageTitle = 'Mes favoris';
        break;
      default:
        this.pageTitle = 'Tous les spots';
    }
  }

  loadSpots() {
    this.spotsService.getSpots().subscribe({
      next: (allSpots) => {
        switch(this.mode) {
          case 'popular':
            this.spots = this.spotsService.getPopularSpots();
            break;
          case 'recommended':
            this.spots = this.spotsService.getRecommendedSpots();
            break;
          case 'favorites':
            this.spots = allSpots.filter(spot => spot.isFavorite);
            break;
          default:
            this.spots = allSpots;
        }
      },
      error: (err) => console.error('Erreur chargement spots:', err)
    });
  }

  toggleFavorite(spot: Spot, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.spotsService.toggleFavorite(spot.id);
    spot.isFavorite = !spot.isFavorite;

    // Si on est en mode favoris et qu'on retire un favori, on le supprime de la liste
    if (this.mode === 'favorites' && !spot.isFavorite) {
      this.spots = this.spots.filter(s => s.id !== spot.id);
    }
  }

  openSpotDetail(spotId: number) {
    this.router.navigate(['/tabs/spot-detail', spotId]);
  }
}
