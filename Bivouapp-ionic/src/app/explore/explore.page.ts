import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Spot } from '../models/spot.model';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit, ViewWillEnter {

  // On garde une seule source de vérité pour les spots
  allSpots: Spot[] = [];
  popularSpots: Spot[] = [];
  recommendedSpots: Spot[] = [];
  filteredSpots: Spot[] = [];

  selectedCategory = 'feed';

  categories = [
    { id: 'feed', label: 'Mon feed' },
    { id: 'tout', label: 'Tout' },
    { id: 'bivouac', label: 'Bivouac' },
    { id: 'camping', label: 'Camping' },
    { id: 'refuge', label: 'Refuge' },
    { id: "point d'eau", label: "Point d'eau" }
  ];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
  ) {}

  async ngOnInit() {
    // Initialisation au chargement
    await this.loadSpotsFromSupabase();
  }

  // Ça recharge les données quand on revient sur la page (utile si on a ajouté un spot entre temps)
  async ionViewWillEnter() {
    await this.loadSpotsFromSupabase();
  }

  async loadSpotsFromSupabase() {
    try {
      const data = await this.supabaseService.getSpots();
      this.allSpots = data || [];

      // On génère nos listes filtrées à partir des données Supabase
      this.popularSpots = this.allSpots.filter(s => s.rating >= 4); // Exemple : spots bien notés
      this.recommendedSpots = this.allSpots.slice(0, 5); // Exemple : les 5 derniers

      // On applique le filtre de catégorie actuel
      this.selectCategory(this.selectedCategory);

      console.log('Spots chargés depuis Supabase :', this.allSpots);
    } catch (err) {
      console.error('Erreur lors de la récupération des spots :', err);
    }
  }

  selectCategory(catId: string) {
    this.selectedCategory = catId;

    if (catId === 'feed') {
      // Dans le feed, on peut imaginer un mélange ou les spots recommandés
      this.filteredSpots = [...this.recommendedSpots];
      return;
    }

    if (catId === 'tout') {
      this.filteredSpots = [...this.allSpots];
    } else {
      // Filtrage par type (attention à la casse dans ta DB !)
      this.filteredSpots = this.allSpots.filter(
        s => s.type?.toLowerCase() === catId.toLowerCase()
      );
    }
  }

  openSpotDetail(spotId: number) {
    this.router.navigate(['/tabs/spot-detail', spotId]);
  }

  async toggleFavorite(spot: Spot, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Pour l'instant on change l'état localement
    spot.isFavorite = !spot.isFavorite;

    // TODO: Appeler supabaseService.updateFavorite(spot.id, spot.isFavorite)
    // pour que ce soit enregistré en ligne !
  }
}
