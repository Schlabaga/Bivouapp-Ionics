import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import { Service } from '../models/spot.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.page.html',
  styleUrls: ['./publish.page.scss'],
  standalone: false,
})
export class PublishPage implements OnInit {

  spotForm!: FormGroup;
  allServices: Service[] = [];
  map: L.Map | undefined;
  marker: L.Marker | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private spotsService: SpotsService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.allServices = this.spotsService.getAllServices();

    this.spotForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['Spot inconnu'], // L'utilisateur peut changer ça
      longitude: [0, [Validators.required]],
      latitude: [0, [Validators.required]],
      rating: [4],
      price: [null], // Null pour afficher le placeholder
      services: [[]],
      imageUrl: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600'], // Image par défaut
      type: 'bivouac',
      isFavorite: false
    });
  }

  // On charge la carte quand la page s'affiche
  ionViewDidEnter() {
    this.initMap();
  }

  initMap() {
    // Si la carte existe déjà, on touche à rien (sinon ça bug)
    if (this.map) return;

    // On centre sur la France ou Sallanches par défaut
    const defaultLat = 45.9366;
    const defaultLng = 6.6300;

    this.map = L.map('map-publish', {
      zoomControl: false // On vire les boutons zoom pour le style
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // On crée une icône perso (sinon Leaflet bug parfois avec Angular)
    const icon = L.icon({
      iconUrl: 'assets/icon/favicon.png', // Mets ton icône ici
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // On ajoute un marqueur qu'on peut bouger (draggable: true)
    this.marker = L.marker([defaultLat, defaultLng], {
      icon: icon,
      draggable: true
    }).addTo(this.map);

    // On met à jour le formulaire par défaut
    this.updateCoordinates(defaultLat, defaultLng);

    // QUAND ON BOUGE LE MARQUEUR
    this.marker.on('dragend', () => {
      const position = this.marker!.getLatLng();
      this.updateCoordinates(position.lat, position.lng);
      console.log("Nouvelle position : ", position);
    });
  }

  updateCoordinates(lat: number, lng: number) {
    this.spotForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  setRating(rating: number) {
    this.spotForm.get('rating')?.setValue(rating);
  }

  isServiceSelected(serviceId: string): boolean {
    const services = this.spotForm.get('services')?.value as string[];
    return services.includes(serviceId);
  }

  toggleService(serviceId: string): void {
    const currentServices = this.spotForm.get('services')?.value as string[];
    if (currentServices.includes(serviceId)) {
      this.spotForm.get('services')?.setValue(currentServices.filter(id => id !== serviceId));
    } else {
      currentServices.push(serviceId);
      this.spotForm.get('services')?.setValue(currentServices);
    }
  }

  async onSubmit() {
    if (this.spotForm.valid) {
      const newSpot = {
        ...this.spotForm.value,
        id: Date.now(),
        distance: 0, // Calculera plus tard
        price: this.spotForm.value.price || 0 // Si vide = 0 (Gratuit)
      };

      this.spotsService.addSpot(newSpot);

      const toast = await this.toastController.create({
        message: 'Spot publié avec succès mon gaté !',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      this.router.navigate(['/tabs/explore']);

      // reset
      this.spotForm.reset();
    } else {
      // Si formulaire invalide
      const toast = await this.toastController.create({
        message: 'Il manque des infos ! Vérifie le titre et la carte.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    }
  }
}
