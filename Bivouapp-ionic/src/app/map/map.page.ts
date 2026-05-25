import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Spot} from "../models/spot.model";
import { SupabaseService } from '../services/supabase';
import {Router} from "@angular/router";
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MapPage implements OnInit {
  allSpots: Spot[] = [];
  longitude: number = 0;
  latitude: number=0;
  map!: L.Map;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
  ) {}



  ngOnInit() { }


  async ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize(); // Force la carte à se rafraîchir proprement
      return;
    }

    await this.getCurrentPosition();

    this.map = L.map('map').setView([this.latitude, this.longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    await this.loadSpotsFromSupabase();
  }

  async getCurrentPosition(){
    try{
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
    } catch (e) {
      console.log(e)
      this.latitude = 43.2964 ;
      this.longitude = 5.3697;
    }


  }

  async loadSpotsFromSupabase() {
    try {
      const data = await this.supabaseService.getSpots();
      this.allSpots = data || [];


      // On applique le filtre de catégorie actuel
      // Ajouter la localisation aussi

      console.log('Spots chargés depuis Supabase :', this.allSpots);
    } catch (err) {
      console.error('Erreur lors de la récupération des spots :', err);
    }
  }

}
