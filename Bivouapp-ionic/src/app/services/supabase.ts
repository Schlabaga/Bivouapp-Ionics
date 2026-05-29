import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import { Spot } from '../models/spot.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Récupère tous les spots avec leurs photos et services
  async getSpots(): Promise<Spot[]> {
    const { data, error } = await this.supabase
      .from('spots')
      .select(`
        *,
        spot_photos ( id, url, is_cover ),
        spot_services ( service_id )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(s => this.mapSpot(s));
  }

  // Récupère un spot par ID
  async getSpotById(id: number): Promise<Spot | null> {
    const { data, error } = await this.supabase
      .from('spots')
      .select(`
        *,
        spot_photos ( id, url, is_cover ),
        spot_services ( service_id )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.mapSpot(data) : null;
  }

  // Ajoute un spot + ses photos et services
  async addSpot(newSpot: Partial<Spot>, photoUrls: string[], serviceIds: string[]): Promise<Spot> {
    const { spot_photos, spot_services, isFavorite, coverUrl, ...spotData } = newSpot as any;

    const { data, error } = await this.supabase
      .from('spots')
      .insert([spotData])
      .select()
      .single();

    if (error) throw error;

    const spotId = data.id;

    // Insertion des photos
    if (photoUrls.length > 0) {
      const photos = photoUrls.map((url, i) => ({
        spot_id: spotId,
        url,
        is_cover: i === 0
      }));
      await this.supabase.from('spot_photos').insert(photos);
    }

    // Insertion des services
    if (serviceIds.length > 0) {
      const services = serviceIds.map(service_id => ({ spot_id: spotId, service_id }));
      await this.supabase.from('spot_services').insert(services);
    }

    return this.mapSpot(data);
  }

  // Récupère les favoris d'un user (liste d'IDs de spots)
  async getFavoriteIds(userId: string): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('favorites')
      .select('spot_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(f => f.spot_id);
  }

  // Ajoute ou retire un favori
  async toggleFavorite(userId: string, spotId: number, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.supabase.from('favorites').insert({ user_id: userId, spot_id: spotId });
    } else {
      await this.supabase.from('favorites').delete()
        .eq('user_id', userId).eq('spot_id', spotId);
    }
  }

  // Ajoute coverUrl sur chaque spot pour simplifier les templates
  private mapSpot(raw: any): Spot {
    const cover = (raw.spot_photos || []).find((p: any) => p.is_cover) || raw.spot_photos?.[0];
    return {
      ...raw,
      coverUrl: cover?.url || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
      isFavorite: false // sera mis à jour par le service avec la table favorites
    };
  }
}
