import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Spot} from "../models/spot.model";
import { SupabaseService } from '../services/supabase';
import {Router} from "@angular/router";


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MapPage implements OnInit {
  allSpots: Spot[] = [];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
  ) {}



  ngOnInit() { }



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
