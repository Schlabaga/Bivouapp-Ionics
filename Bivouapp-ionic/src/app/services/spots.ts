import { Injectable } from '@angular/core';
import {Spot, RecommendedSpot} from "../models/spot.model";


@Injectable({
  providedIn: 'root',
})

export class Spots {

  popularSpots: Spot[] = [
    {
      id: 1,
      name: 'Mont-Blanc',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      rating: 4.1,
      isFavorite: true
    },
    {
      id: 2,
      name: 'Passy',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
      rating: 4.5,
      isFavorite: false
    }
  ];

  recommendedSpots: RecommendedSpot[] = [
    {
      id: 1,
      name: 'Parking vue sur la ville',
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
      distance: '5 km'
    },
    {
      id: 2,
      name: 'Spot d\'hiver',
      image: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800',
      distance: '12 km'
    }
  ];
}
