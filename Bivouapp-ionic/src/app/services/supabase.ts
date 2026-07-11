import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environment/environment';
import { Spot, PresenceReport, EcoStatus } from '../models/spot.model';
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Récupère tous les spots avec leurs photos, services et dernier signalement de présence
  async getSpots(): Promise<Spot[]> {
    const { data, error } = await this.supabase
      .from('spots')
      .select(`
        *,
        spot_photos ( id, url, is_cover ),
        spot_services ( service_id ),
        presence_reports ( id, tent_count, reported_at, reported_by )
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
        spot_services ( service_id ),
        presence_reports ( id, tent_count, reported_at, reported_by )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.mapSpot(data) : null;
  }

  // Ajoute un spot + ses photos et services
  async addSpot(newSpot: Partial<Spot>, photoUrls: string[], serviceIds: string[]): Promise<Spot> {
    const { spot_photos, spot_services, isFavorite, coverUrl, last_presence_report, eco_status, ...spotData } = newSpot as any;

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
    return (data || []).map((f: any) => f.spot_id);
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

  // --- Disponibilité collaborative ---
  // Pas de réservation : on horodate juste "il y a X tentes ici".
  // Cette table sert de flux, pas d'état ; on prend le plus récent par spot.
  async reportPresence(spotId: number, tentCount: number, userId?: string): Promise<PresenceReport> {
    const { data, error } = await this.supabase
      .from('presence_reports')
      .insert({ spot_id: spotId, tent_count: tentCount, reported_by: userId ?? null })
      .select()
      .single();

    if (error) throw error;
    return data as PresenceReport;
  }

  // --- Signalement écologique communautaire ---
  async reportEcoStatus(spotId: number, status: EcoStatus, userId?: string, comment?: string): Promise<void> {
    const { error } = await this.supabase
      .from('eco_reports')
      .insert({ spot_id: spotId, status, reported_by: userId ?? null, comment: comment ?? null });

    if (error) throw error;
  }

  // Ajoute coverUrl + dernier signalement de présence sur chaque spot pour simplifier les templates
  private mapSpot(raw: any): Spot {
    const cover = (raw.spot_photos || []).find((p: any) => p.is_cover) || raw.spot_photos?.[0];

    // presence_reports arrive en vrac depuis Supabase : on garde uniquement le plus récent
    const reports: any[] = raw.presence_reports || [];
    const lastReport = reports.length
      ? reports.reduce((latest, r) =>
          new Date(r.reported_at) > new Date(latest.reported_at) ? r : latest
        )
      : undefined;

    return {
      ...raw,
      coverUrl: cover?.url || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
      isFavorite: false, // sera mis à jour par le service avec la table favorites
      last_presence_report: lastReport
    };
  }
}
