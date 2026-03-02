import { Injectable } from '@angular/core';
import { Spot, Service } from '../models/spot.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotsService {
  private supabase: SupabaseClient;

  private spotsSubject = new BehaviorSubject<Spot[]>([]);
  public spots$ = this.spotsSubject.asObservable();

  private availableServices: Service[] = [
    { id: 'fire', label: 'Feu autorisé', icon: 'flame-outline' },
    { id: 'water', label: "Point d'eau", icon: 'water-outline' },
    { id: 'wifi', label: '4G / 5G', icon: 'wifi-outline' },
    { id: 'electricity', label: 'Électricité', icon: 'flash-outline' },
    { id: 'pool', label: 'Baignade', icon: 'boat-outline' },
    { id: 'shower', label: 'Douche', icon: 'rainy-outline' },
  ];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.loadInitialData();
  }

  // Charge les données au démarrage
  private async loadInitialData() {
    const { data, error } = await this.supabase
      .from('spots')
      .select('*');

    if (!error && data) {
      this.spotsSubject.next(data as Spot[]);
    }
  }

  // 1. RÉCUPÉRER TOUS LES SPOTS (Observable pour ton code actuel)
  getSpots(): Observable<Spot[]> {
    return this.spots$;
  }

  // 2. CHERCHER UN SPOT PAR ID
  getSpotById(id: number): Observable<Spot | undefined> {
    // On cherche dans le tableau local déjà chargé pour la rapidité
    return this.spots$.pipe(
      map(spots => spots.find(s => s.id === id))
    );
  }

  // 3. AJOUTER UN SPOT SUR SUPABASE
  async addSpot(newSpot: Spot): Promise<void> {
    // On enlève l'ID si c'est la DB qui doit le générer
    const { id, ...spotData } = newSpot;

    const { data, error } = await this.supabase
      .from('spots')
      .insert([spotData]) // On envoie les données sans forcer l'ID
      .select();

    if (error) {
      console.error("Aïe ! Supabase a refusé l'ajout :", error.message);
      return;
    }

    if (data) {
      console.log("Victoire ! Spot ajouté en ligne :", data[0]);
      const currentSpots = this.spotsSubject.value;
      this.spotsSubject.next([...currentSpots, data[0] as Spot]);
    }
  }

  // 4. CHANGER LE FAVORIS (Direct dans la DB)
  async toggleFavorite(id: number): Promise<void> {
    const spot = this.spotsSubject.value.find(s => s.id === id);
    if (spot) {
      const newState = !spot.isFavorite;

      const { error } = await this.supabase
        .from('spots')
        .update({ isFavorite: newState })
        .eq('id', id);

      if (!error) {
        // Mise à jour locale pour l'UI
        const updatedSpots = this.spotsSubject.value.map(s =>
          s.id === id ? { ...s, isFavorite: newState } : s
        );
        this.spotsSubject.next(updatedSpots);
      }
    }
  }

  // 5. FILTRES (toujours en local pour la perf)
  getPopularSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.rating >= 4.5).slice(0, 5);
  }

  getRecommendedSpots(): Spot[] {
    return this.spotsSubject.value.filter(s => s.distance <= 50).slice(0, 5);
  }

  getAllServices(): Service[] {
    return this.availableServices;
  }
}
