import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Spot } from '../models/spot.model';
import { SupabaseService } from '../services/supabase';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class MapPage implements OnInit {
  allSpots: Spot[] = [];
  latitude = 0;
  longitude = 0;
  map!: L.Map;
  searchQuery = '';
  selectedSort = 'all';

  // TODO: adapter les actions selon tes besoins
  sortOptions = [
    { id: 'all',      label: 'Tout',        icon: 'grid-outline' },
    { id: 'nearby',   label: 'Près de moi', icon: 'navigate-outline' },
    { id: 'top',      label: 'Les mieux notés', icon: 'star-outline' },
    { id: 'free',     label: 'Gratuit',     icon: 'pricetag-outline' },
    { id: 'bivouac',  label: 'Bivouac',     icon: 'bonfire-outline' },
    { id: 'water',    label: "Point d'eau", icon: 'water-outline' },
    
  ];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    await this.getCurrentPosition();

    this.map = L.map('map', {
      zoomControl: false
    }).setView([this.latitude, this.longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    await this.loadSpots();
  }

  async getCurrentPosition() {
    try {
      const coords = await Geolocation.getCurrentPosition();
      this.latitude = coords.coords.latitude;
      this.longitude = coords.coords.longitude;
    } catch {
      this.latitude = 43.2964;
      this.longitude = 5.3697;
    }
  }

  async loadSpots() {
    try {
      this.allSpots = await this.supabaseService.getSpots() || [];
    } catch (err) {
      console.error(err);
    }
  }

  selectSort(id: string) {
    this.selectedSort = id;
    // TODO: filtrer les marqueurs sur la carte selon l'option
  }

  onSearch(event: any) {
    // TODO: geocoding ou filtrage local
    console.log('Search:', this.searchQuery);
  }
}
