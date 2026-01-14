export interface Spot {
  id: number;
  name: string;
  image: string;
  rating: number;
  isFavorite?: boolean;
}

export interface RecommendedSpot {
  id: number;
  name: string;
  image: string;
  distance: string;
}

