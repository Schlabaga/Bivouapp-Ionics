// src/app/services/spots.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Spot, Service, Lodging,
  WaterAvailabilityOption, LegalStatusOption, GroundTypeOption, NetworkCoverageOption,
  EcoStatus, PresenceReport
} from '../models/spot.model';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SpotsService {

  private spotsSubject = new BehaviorSubject<Spot[]>([]);
  public spots$ = this.spotsSubject.asObservable();

  private availableServices: Service[] = [
    { id: 'fire',        label: 'Feu autorisé', icon: 'flame-outline' },
    { id: 'water',       label: "Point d'eau",  icon: 'water-outline' },
    { id: 'wifi',        label: '4G / 5G',      icon: 'wifi-outline' },
    { id: 'electricity', label: 'Électricité',  icon: 'flash-outline' },
    { id: 'pool',        label: 'Baignade',     icon: 'boat-outline' },
    { id: 'shower',      label: 'Douche',       icon: 'rainy-outline' },
    { id: 'parking',     label: 'Parking',      icon: 'car-outline' },
    { id: 'toilet',      label: 'Toilettes',    icon: 'woman-outline' },
  ];

  private lodging: Lodging[] = [
    { id: 'bivouac', label: 'Bivouac', icon: 'moon-outline' },
    { id: 'alpine_hut', label: 'Refuge / Gîte', icon: 'bed-outline' },
    { id: 'wilderness_hut', label: 'Abri', icon: 'home-outline' },
    { id: 'camp_site', label: 'Camping', icon: 'bonfire-outline' },
    { id: 'chalet', label: 'Chalet', icon: 'leaf-outline' }
  ];

  // --- Critères "survie", utilisés dans le formulaire de publication et les filtres ---

  private waterOptions: WaterAvailabilityOption[] = [
    { id: 'potable',     label: 'Eau potable à proximité', icon: 'water' },
    { id: 'non_potable', label: 'Eau non potable',         icon: 'water-outline' },
    { id: 'seasonal',    label: 'Source tarie en été',     icon: 'sunny-outline' },
    { id: 'none',        label: "Pas de point d'eau",      icon: 'close-circle-outline' },
    { id: 'unknown',     label: 'Non renseigné',           icon: 'help-circle-outline' },
  ];

  private legalOptions: LegalStatusOption[] = [
    { id: 'free',               label: 'Libre',                          icon: 'checkmark-circle-outline', color: 'success' },
    { id: 'national_park_19_7', label: 'Parc National (19h–7h)',         icon: 'time-outline',             color: 'warning' },
    { id: 'regulated',          label: 'Réglementé (arrêté municipal)',  icon: 'alert-circle-outline',     color: 'warning' },
    { id: 'forbidden',          label: 'Interdit',                       icon: 'ban-outline',              color: 'danger' },
    { id: 'unknown',            label: 'Non renseigné',                  icon: 'help-circle-outline',      color: 'medium' },
  ];

  private groundOptions: GroundTypeOption[] = [
    { id: 'soft',    label: 'Sol meuble (sardines OK)', icon: 'leaf-outline' },
    { id: 'rocky',   label: 'Roche / dalle',            icon: 'triangle-outline' },
    { id: 'mixed',   label: 'Mixte',                    icon: 'layers-outline' },
    { id: 'unknown', label: 'Non renseigné',            icon: 'help-circle-outline' },
  ];

  private networkOptions: NetworkCoverageOption[] = [
    { id: 'good',    label: 'Bon réseau',       icon: 'cellular' },
    { id: 'partial', label: 'Réseau instable',  icon: 'cellular-outline' },
    { id: 'none',    label: 'Zone blanche',     icon: 'close-circle-outline' },
    { id: 'unknown', label: 'Non renseigné',    icon: 'help-circle-outline' },
  ];

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      const spots = await this.supabaseService.getSpots();
      await this.applyFavorites(spots);
    } catch (err) {
      console.error('Erreur chargement spots :', err);
    }
  }

  // Applique isFavorite sur chaque spot selon la table favorites
  private async applyFavorites(spots: Spot[]): Promise<void> {
    const session = await this.authService.getSession();
    let favoriteIds: number[] = [];

    if (session?.user) {
      favoriteIds = await this.supabaseService.getFavoriteIds(session.user.id);
    }

    const withFav = spots.map(s => ({
      ...s,
      isFavorite: favoriteIds.includes(s.id)
    }));

    this.spotsSubject.next(withFav);
  }

  getSpots(): Observable<Spot[]> {
    return this.spots$;
  }

  async refreshSpots(): Promise<void> {
    await this.loadInitialData();
  }

  getSpotById(id: number): Observable<Spot | undefined> {
    // D'abord on cherche en local
    const local = this.spotsSubject.value.find(s => s.id === id);
    if (local) {
      return new Observable(obs => { obs.next(local); obs.complete(); });
    }
    // Sinon on va chercher en base
    return new Observable(obs => {
      this.supabaseService.getSpotById(id).then(spot => {
        obs.next(spot ?? undefined);
        obs.complete();
      }).catch(err => obs.error(err));
    });
  }

  async addSpot(spotData: Partial<Spot>, photoUrls: string[], serviceIds: string[]): Promise<void> {
    const newSpot = await this.supabaseService.addSpot(spotData, photoUrls, serviceIds);
    this.spotsSubject.next([newSpot, ...this.spotsSubject.value]);
  }

  async toggleFavorite(spotId: number): Promise<void> {
    const session = await this.authService.getSession();
    if (!session?.user) return;

    const spot = this.spotsSubject.value.find(s => s.id === spotId);
    if (!spot) return;

    const newState = !spot.isFavorite;
    await this.supabaseService.toggleFavorite(session.user.id, spotId, newState);

    // Mise à jour locale
    this.spotsSubject.next(
      this.spotsSubject.value.map(s =>
        s.id === spotId ? { ...s, isFavorite: newState } : s
      )
    );
  }

  // --- Disponibilité collaborative ("Waze du randonneur") ---
  // Pas de réservation : on signale juste "je suis là, on est X tentes".
  async reportPresence(spotId: number, tentCount: number): Promise<void> {
    const session = await this.authService.getSession();
    const report: PresenceReport = await this.supabaseService.reportPresence(
      spotId, tentCount, session?.user?.id
    );

    this.spotsSubject.next(
      this.spotsSubject.value.map(s =>
        s.id === spotId ? { ...s, last_presence_report: report } : s
      )
    );
  }

  // --- Charte de préservation ---
  async reportEcoStatus(spotId: number, status: EcoStatus, comment?: string): Promise<void> {
    const session = await this.authService.getSession();
    await this.supabaseService.reportEcoStatus(spotId, status, session?.user?.id, comment);

    this.spotsSubject.next(
      this.spotsSubject.value.map(s =>
        s.id === spotId ? { ...s, eco_status: status } : s
      )
    );
  }

  getAllServices(): Service[] {
    return this.availableServices;
  }

  getAllLodging() : Lodging[]{
    return this.lodging;
  }

  getWaterOptions(): WaterAvailabilityOption[] {
    return this.waterOptions;
  }

  getLegalOptions(): LegalStatusOption[] {
    return this.legalOptions;
  }

  getGroundOptions(): GroundTypeOption[] {
    return this.groundOptions;
  }

  getNetworkOptions(): NetworkCoverageOption[] {
    return this.networkOptions;
  }

  getPopularSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.rating >= 4.5).slice(0, 5);
  }

  getRecommendedSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.distance <= 50).slice(0, 5);
  }
}
