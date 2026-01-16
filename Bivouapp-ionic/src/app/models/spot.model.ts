export interface Spot {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  distance: number;
  imageUrl: string;
  services: string[];
  isFavorite: boolean;
  location: string;
  type: string;
  latitude: number;
  longitude: number;
}
// Service disponible pour un spot
export interface Service {
  id: string;
  label: string;
  icon: string;
}
