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

  // Filtres "survie", pas "confort" : combinables entre eux et avec la catégorie
  quickFilters = [
    { id: 'water_potable', label: 'Eau potable', icon: 'water' },
    { id: 'legal_ok', label: 'Zone autorisée', icon: 'checkmark-circle-outline' },
    { id: 'network', label: 'Réseau mobile', icon: 'cellular-outline' },
    { id: 'eco_clean', label: 'Spot propre', icon: 'leaf-outline' },
  ];
  activeFilters = new Set<string>();

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
    console.log(this.popularSpots);
  }

  async loadSpotsFromSupabase() {
    try {
      const data = await this.supabaseService.getSpots();
      this.allSpots = data || [];

      // On génère nos listes filtrées à partir des données Supabase
      this.popularSpots = this.allSpots.filter(s => s.rating >= 4); // Exemple : spots bien notés
      this.recommendedSpots = this.allSpots.slice(0, 5); // Exemple : les 5 derniers

      // On applique le filtre de catégorie + les filtres essentiels actifs
      this.applyFilters();

      console.log('Spots chargés depuis Supabase :', this.allSpots);
    } catch (err) {
      console.error('Erreur lors de la récupération des spots :', err);
    }
  }

  selectCategory(catId: string) {
    this.selectedCategory = catId;
    this.applyFilters();
  }

  toggleQuickFilter(filterId: string) {
    if (this.activeFilters.has(filterId)) {
      this.activeFilters.delete(filterId);
    } else {
      this.activeFilters.add(filterId);
    }
    this.applyFilters();
  }

  isQuickFilterActive(filterId: string): boolean {
    return this.activeFilters.has(filterId);
  }

  private applyFilters() {
    let base: Spot[];

    if (this.selectedCategory === 'feed') {
      base = [...this.recommendedSpots];
    } else if (this.selectedCategory === 'tout') {
      base = [...this.allSpots];
    } else {
      // Filtrage par type (attention à la casse dans ta DB !)
      base = this.allSpots.filter(
        s => s.type?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredSpots = base.filter(spot => {
      if (this.activeFilters.has('water_potable') && spot.water_availability !== 'potable') {
        return false;
      }
      if (this.activeFilters.has('legal_ok') &&
        spot.legal_status !== 'free' && spot.legal_status !== 'national_park_19_7') {
        return false;
      }
      if (this.activeFilters.has('network') && spot.network_coverage !== 'good') {
        return false;
      }
      if (this.activeFilters.has('eco_clean') && spot.eco_status === 'litter_reported') {
        return false;
      }
      return true;
    });
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
