// src/app/models/spot.model.ts

export interface SpotPhoto {
  id: number;
  spot_id: number;
  url: string;
  is_cover: boolean;
  uploaded_at: string;
}

export interface Service {
  id: string;
  label: string;
  icon: string;
}

export interface Lodging {
  id: string;
  label: string;
  icon: string;
}

// --- Critères "survie / légalité", pas "confort" ---

// Présence et qualité d'un point d'eau à proximité
export type WaterAvailability = 'potable' | 'non_potable' | 'seasonal' | 'none' | 'unknown';

// Statut légal du bivouac à cet endroit (le point le plus sensible en France)
export type LegalStatus =
  | 'free'                // libre, aucune réglementation connue
  | 'national_park_19_7'  // Parc National : autorisé 19h-7h uniquement
  | 'regulated'           // réglementé (arrêté municipal, réserve naturelle...)
  | 'forbidden'           // interdit
  | 'unknown';

// Nature du sol, utile pour savoir si on peut planter des sardines
export type GroundType = 'soft' | 'rocky' | 'mixed' | 'unknown';

// Couverture réseau mobile sur place (sécurité / urgences)
export type NetworkCoverage = 'good' | 'partial' | 'none' | 'unknown';

// État écologique constaté par la dernière communauté de passage
export type EcoStatus = 'clean' | 'litter_reported' | 'unknown';

export interface WaterAvailabilityOption {
  id: WaterAvailability;
  label: string;
  icon: string;
}

export interface LegalStatusOption {
  id: LegalStatus;
  label: string;
  icon: string;
  color: string; // couleur sémantique (danger / warning / success...)
}

export interface GroundTypeOption {
  id: GroundType;
  label: string;
  icon: string;
}

export interface NetworkCoverageOption {
  id: NetworkCoverage;
  label: string;
  icon: string;
}

// --- Disponibilité collaborative ("Waze du randonneur") ---
// Pas de réservation : un simple signalement horodaté de présence.
export interface PresenceReport {
  id: number;
  spot_id: number;
  tent_count: number;
  reported_at: string;      // ISO timestamp
  reported_by?: string;
}

// --- Signalement écologique communautaire ---
export interface EcoReport {
  id: number;
  spot_id: number;
  status: EcoStatus;
  comment?: string;
  reported_at: string;
  reported_by?: string;
}

export interface Spot {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  distance: number;
  location: string;
  type: 'bivouac' | 'camping' | 'shelter' | "water" | 'alpine hut' ;
  latitude: number;
  longitude: number;
  created_by?: string;
  created_at?: string;

  // Critères de survie / légalité
  water_availability?: WaterAvailability;
  legal_status?: LegalStatus;
  ground_type?: GroundType;
  network_coverage?: NetworkCoverage;

  // État écologique agrégé (calculé depuis les eco_reports les plus récents)
  eco_status?: EcoStatus;

  // Relations jointes depuis Supabase
  spot_photos: SpotPhoto[];
  spot_services: { service_id: string }[];

  // Disponibilité collaborative : dernier signalement de présence connu
  last_presence_report?: PresenceReport;

  // Calculé côté app, pas en base
  isFavorite?: boolean;
  coverUrl?: string;  // raccourci pratique pour le template
}
