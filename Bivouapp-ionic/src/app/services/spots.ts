import { Injectable } from '@angular/core';
import { Spot, Service } from '../models/spot.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotsService {

  // Liste des services disponibles pour les spots (icônes et labels)
  private availableServices: Service[] = [
    { id: 'fire', label: 'Feu autorisé', icon: 'flame-outline' },
    { id: 'water', label: "Point d'eau", icon: 'water-outline' },
    { id: 'wifi', label: '4G / 5G', icon: 'wifi-outline' },
    { id: 'electricity', label: 'Électricité', icon: 'flash-outline' },
    { id: 'pool', label: 'Baignade', icon: 'boat-outline' },
    { id: 'shower', label: 'Douche', icon: 'rainy-outline' },
  ];

  // tableau qui contient tous les spots pour test
  private spots: Spot[] = [
    // TYPE: BIVOUAC
    {
      id: 1, title: 'Mont des Pyrénées', description: 'Vue imprenable sur la chaîne.', price: 25, rating: 4.8, distance: 12, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', services: ['fire', 'water'], isFavorite: false, location: 'Pyrénées', type: 'bivouac',
      latitude: 42.7667, longitude: 0.1500
    },
    {
      id: 6, title: 'Désert des Bardenas', description: 'Dépaysement garanti, décor de cinéma.', price: 20, rating: 4.7, distance: 250, imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', services: ['wifi'], isFavorite: false, location: 'Espagne', type: 'bivouac',
      latitude: 42.1930, longitude: -1.4883
    },
    {
      id: 9, title: 'Plateau du Vercors', description: 'Immersion totale en pleine nature sauvage.', price: 0, rating: 4.9, distance: 45, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', services: ['fire'], isFavorite: false, location: 'Isère, France', type: 'bivouac',
      latitude: 44.9572, longitude: 5.4619
    },
    {
      id: 10, title: 'Crique Secrète Corse', description: 'Dormir au son des vagues sur le sable.', price: 0, rating: 4.6, distance: 15, imageUrl: 'https://images.unsplash.com/photo-1533632359083-0185df1be85d?w=600', services: ['pool'], isFavorite: false, location: 'Corse, France', type: 'bivouac',
      latitude: 41.6025, longitude: 9.2625
    },
    {
      id: 11, title: 'Forêt d\'Ardenne', description: 'Spot discret sous les grands chênes.', price: 5, rating: 4.2, distance: 80, imageUrl: 'https://www.visitardenne.com/sites/default/files/upload/destinations%20incontournables/forets/__3324_0.JPG', services: ['fire'], isFavorite: false, location: 'Belgique', type: 'bivouac',
      latitude: 50.2456, longitude: 5.2553
    },
    {
      id: 12, title: 'Lacs de la Tempête', description: 'Haute altitude, vue sur les sommets.', price: 0, rating: 5.0, distance: 35, imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', services: ['water'], isFavorite: true, location: 'Savoie, France', type: 'bivouac',
      latitude: 45.5894, longitude: 6.6713
    },

    // TYPE: CAMPING
    {
      id: 3, title: 'Vue Lac d\'Annecy', description: 'Accès privé au lac.', price: 55, rating: 4.7, distance: 8, imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600', services: ['water', 'pool', 'wifi'], isFavorite: true, location: 'Annecy, France', type: 'camping',
      latitude: 45.8992, longitude: 6.1294
    },
    {
      id: 13, title: 'Camping des Pins', description: 'Ambiance familiale sous la pinède.', price: 35, rating: 4.1, distance: 50, imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600', services: ['shower', 'electricity', 'wifi'], isFavorite: false, location: 'Landes, France', type: 'camping',
      latitude: 43.9610, longitude: -1.1852
    },
    {
      id: 14, title: 'L\'Écho de la Vallée', description: 'Petit camping à la ferme très calme.', price: 22, rating: 4.5, distance: 110, imageUrl: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=600', services: ['water', 'electricity'], isFavorite: false, location: 'Dordogne, France', type: 'camping',
      latitude: 44.8878, longitude: 1.2136
    },
    {
      id: 15, title: 'Camping du Bord de Mer', description: 'Pieds dans l\'eau et animations.', price: 65, rating: 3.9, distance: 200, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', services: ['pool', 'shower', 'wifi', 'electricity'], isFavorite: false, location: 'Var, France', type: 'camping',
      latitude: 43.1950, longitude: 6.5516
    },
    {
      id: 17, title: 'Camping Glamping Chic', description: 'Tentes safari tout confort.', price: 120, rating: 4.9, distance: 150, imageUrl: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600', services: ['wifi', 'electricity', 'pool', 'shower'], isFavorite: true, location: 'Ardèche, France', type: 'camping',
      latitude: 44.4056, longitude: 4.3857
    },

    // TYPE: REFUGE
    {
      id: 4, title: 'Grange Rénovée en Toscane', description: 'Cadre rustique parmi les oliviers.', price: 28, rating: 4.9, distance: 120, imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600', services: ['fire', 'shower'], isFavorite: false, location: 'Toscane, Italie', type: 'refuge',
      latitude: 43.4167, longitude: 11.1167
    },
    {
      id: 5, title: 'Phare de Bretagne', description: 'Dormir sous les étoiles au bord des falaises.', price: 60, rating: 4.9, distance: 30, imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600', services: ['wifi', 'electricity'], isFavorite: true, location: 'Brest, France', type: 'refuge',
      latitude: 48.3366, longitude: -4.6190
    },
    {
      id: 8, title: 'Refuge du Col Noir', description: 'Refuge de haute montagne non gardé.', price: 15, rating: 4.6, distance: 45, imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', services: ['fire', 'electricity'], isFavorite: false, location: 'Chamonix, France', type: 'refuge',
      latitude: 45.9237, longitude: 6.8694
    },
    {
      id: 18, title: 'Cabane des Écrins', description: 'Abri sommaire mais vue panoramique.', price: 10, rating: 4.3, distance: 60, imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600', services: ['fire'], isFavorite: false, location: 'Hautes-Alpes, France', type: 'refuge',
      latitude: 44.9197, longitude: 6.3608
    },
    {
      id: 19, title: 'Le Chalet d\'Alpage', description: 'Fromage sur place et réveil au son des cloches.', price: 40, rating: 4.7, distance: 20, imageUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=600', services: ['water', 'shower'], isFavorite: false, location: 'Valais, Suisse', type: 'refuge',
      latitude: 46.1917, longitude: 7.5358
    },

    // TYPE: POINT D'EAU
    {
      id: 7, title: 'Source de la Roche', description: 'Source naturelle potable très fraîche.', price: 0, rating: 4.5, distance: 5, imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600', services: ['water'], isFavorite: false, location: 'Savoie, France', type: 'point d\'eau',
      latitude: 45.6415, longitude: 6.0123
    },
    {
      id: 23, title: 'Source des Pyrénées', description: 'Eau minérale à flanc de montagne.', price: 0, rating: 4.4, distance: 55, imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', services: ['water'], isFavorite: false, location: 'Pyrénées, France', type: 'point d\'eau',
      latitude: 42.8800, longitude: 0.1000
    },
    {
      id: 24, title: 'Lac de Gaube', description: 'Grand lac de montagne accessible.', price: 0, rating: 5.0, distance: 40, imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', services: ['water', 'pool'], isFavorite: false, location: 'Cauterets, France', type: 'point d\'eau',
      latitude: 42.8317, longitude: -0.1384
    },
    {
      id: 25, title: 'Puits Traditionnel', description: 'Point d\'eau sécurisé en bordure de route.', price: 0, rating: 3.8, distance: 120, imageUrl: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600', services: ['water'], isFavorite: false, location: 'Maroc', type: 'point d\'eau',
      latitude: 31.7917, longitude: -7.0926
    }
  ];

  // pour notifier tous les composants des changements
  private spotsSubject = new BehaviorSubject<Spot[]>(this.spots);
  // ca permet d'actualiser et ça envoie la nouvelle liste à tous ceux qui l'utilisent
  public observable = this.spotsSubject.asObservable();

  constructor() {}

  // retourne tous les spots sous forme d'Observable
  getSpots(): Observable<Spot[]> {
    return this.observable;
  }

  // retourne tous les services disponibles
  getAllServices(): Service[] {
    return this.availableServices;
  }

  // ajoute un nouveau spot dans le tableau
  addSpot(newSpot: Spot): void {
    this.spots.push(newSpot);
    this.spotsSubject.next([...this.spots]); // Notifie tous les abonnés
  }

  // cherche un spot par son ID et le retourne dans un Observable
  getSpotById(id: number): Observable<Spot | undefined> {
    return new Observable(observer => {
      const spot = this.spots.find(s => s.id === id);
      observer.next(spot);
      observer.complete();
    });
  }

  // inverse l'état favori d'un spot
  toggleFavorite(id: number): void {
    const spot = this.spots.find(s => s.id === id);
    if (spot) {
      spot.isFavorite = !spot.isFavorite;
      this.spotsSubject.next([...this.spots]); // Notifie tous les abonnés du changement
    }
  }

  // retourne les spots populaires (bien notés)
  getPopularSpots(): Spot[] {
    return this.spots.filter(s => s.rating >= 4.5).slice(0, 5);
  }

  // retourne les spots recommandés (proches)
  getRecommendedSpots(): Spot[] {
    return this.spots.filter(s => s.distance <= 50).slice(0, 5);
  }
}
