// src/app/services/spots.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {Spot, Service, Lodging} from '../models/spot.model';
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
    { id: 'toilet',      label: 'Toilettes',    icon: 'toilet-outline' },
  ];

  private lodging: Lodging[] = [
    { id: 'alpine_hut', label: 'Refuge', icon: 'business-outline' },
    { id: 'wilderness_hut', label: 'Abri', icon: 'home-outline' },
    { id: 'bivouac', label: 'Bivouac', icon: 'tent-outline' },
    { id: 'camp_site', label: 'Camping', icon: 'bonfire-outline' },
    { id: 'gite_hostel', label: 'Gîte d\'étape', icon: 'bed-outline' },
    { id: 'chalet', label: 'Chalet', icon: 'leaf-outline' }
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

  getAllServices(): Service[] {
    return this.availableServices;
  }

  getAllLodging() : Lodging[]{
    return this.lodging;
  }

  getPopularSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.rating >= 4.5).slice(0, 5);
  }

  getRecommendedSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.distance <= 50).slice(0, 5);
  }
}
