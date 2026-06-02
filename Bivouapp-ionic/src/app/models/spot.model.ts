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
  // Relations jointes depuis Supabase
  spot_photos: SpotPhoto[];
  spot_services: { service_id: string }[];
  // Calculé côté app, pas en base
  isFavorite?: boolean;
  coverUrl?: string;  // raccourci pratique pour le template
}
