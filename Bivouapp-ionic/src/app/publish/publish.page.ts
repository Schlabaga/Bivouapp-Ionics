import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import { Service } from '../models/spot.model';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.page.html',
  styleUrls: ['./publish.page.scss'],
  standalone: false,
})
export class PublishPage implements OnInit {

  // FormGroup permet de gérer un formulaire avec plusieurs champs
  spotForm!: FormGroup;
  allServices: Service[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private spotsService: SpotsService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // On récupère tous les services disponibles
    this.allServices = this.spotsService.getAllServices();

    // Construction du formulaire avec FormBuilder
    this.spotForm = this.formBuilder.group({
      title: ['', [Validators.required]], // Champ obligatoire
      description: ['', [Validators.required]],
      location: ['Sallanches'],
      rating: [4, [Validators.min(1), Validators.max(5)]], // Entre 1 et 5
      price: [0, [Validators.min(0)]], // Prix positif
      services: [[]], // Tableau vide par défaut
      imageUrl: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'],
      type: 'bivouac',
      isFavorite: false
    });
  }

  // Change la note du spot
  setRating(rating: number) {
    this.spotForm.get('rating')?.setValue(rating);
  }

  // Vérifie si un service est sélectionné
  isServiceSelected(serviceId: string): boolean {
    const services = this.spotForm.get('services')?.value as string[];
    return services.includes(serviceId);
  }

  // Ajoute ou retire un service de la liste sélectionnée
  toggleService(serviceId: string): void {
    // On récupère le tableau actuel des services cochés
    const currentServices = this.spotForm.get('services')?.value as string[];

    // Si le service est déjà dans la liste on l'enlève
    if (currentServices.includes(serviceId)) {
      const newServices = currentServices.filter(id => id !== serviceId);
      this.spotForm.get('services')?.setValue(newServices);
    } else {
      // Sinon on l'ajoute
      currentServices.push(serviceId);
      this.spotForm.get('services')?.setValue(currentServices);
    }
  }

  async onSubmit() {
    // On vérifie que le formulaire est valide (tous les Validators sont OK)
    if (this.spotForm.valid) {
      // On crée un nouvel objet spot en prenant toutes les valeurs du formulaire
      const newSpot = {
        ...this.spotForm.value, // Le spread operator copie tous les champs
        id: Date.now(), // ID unique basé sur le timestamp
        distance: 0,
        isFavorite: false
      };

      // On ajoute le spot au service
      this.spotsService.addSpot(newSpot);
      console.log('Spot ajouté:', newSpot);

      // On affiche un message de confirmation
      const toast = await this.toastController.create({
        message: 'Spot publié avec succès !',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      // On réinitialise le formulaire et on redirige vers explore
      this.spotForm.reset({
        location: 'Sallanches',
        rating: 4,
        price: 0,
        services: [],
        imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
        type: 'bivouac',
        isFavorite: false
      });

      await this.router.navigate(['/tabs/explore']);
    }
  }
}
