import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import {
  Spot, Service,
  WaterAvailabilityOption, LegalStatusOption, GroundTypeOption, NetworkCoverageOption
} from '../models/spot.model';
import { SpotsService } from '../services/spots';
import {NavController, AlertController, ToastController} from "@ionic/angular";
import * as L from 'leaflet';



@Component({
  selector: 'app-spot-detail',
  templateUrl: './spot-detail.page.html',
  styleUrls: ['./spot-detail.page.scss'],
  standalone: false,
})


export class SpotDetailPage implements OnInit, OnDestroy {

  @Input() spotId?:number;
  @Output() closed = new EventEmitter<void>();
  spot?: Spot;
  allServices: Service[] = [];
  showMap = false;
  map: L.Map | undefined;
  currentImageIndex = 0;
  from="";

  waterOptions: WaterAvailabilityOption[] = [];
  legalOptions: LegalStatusOption[] = [];
  groundOptions: GroundTypeOption[] = [];
  networkOptions: NetworkCoverageOption[] = [];

  constructor(
    private route: ActivatedRoute,
    private spotsService: SpotsService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // 1. On charge d'abord la liste des services (communs aux deux cas)
    this.allServices = this.spotsService.getAllServices();
    this.waterOptions = this.spotsService.getWaterOptions();
    this.legalOptions = this.spotsService.getLegalOptions();
    this.groundOptions = this.spotsService.getGroundOptions();
    this.networkOptions = this.spotsService.getNetworkOptions();

    // 2. On regarde si on a reçu l'ID par l'Input (Cas du volet sur la carte)
    if (this.spotId) {
      this.loadSpot(this.spotId);
    }
    // 3. Sinon, on va le chercher dans l'URL (Cas de la page seule)
    else {
      const urlId = Number(this.route.snapshot.paramMap.get('id'));
      this.from = String(this.route.snapshot.paramMap.get('from'));
      if (urlId) {
        this.loadSpot(urlId);
      }
    }
  }

  // quand on quitte la page on détruit la carte
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadSpot(id: number) {
    this.spotsService.getSpotById(id).subscribe({
      next: (spot) => {
        this.spot = spot;

        // si la carte doit être affichée on attend que le html soit là
        if (this.showMap) {
          setTimeout(() => {
            this.loadMap();
          }, 100);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // pour switcher le petit coeur des favoris
  toggleFavorite() {
    if (this.spot) {
      this.spotsService.toggleFavorite(this.spot.id);
    }
  }

  // récupère le nom du service
  getServiceLabel(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.label || serviceId;
  }

  // récupère l'icône ionic correspondante au service
  getServiceIcon(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.icon || 'help-circle-outline';
  }

  // pour afficher ou cacher la carte quand on clique sur le bouton
  toggleMap() {
    this.showMap = !this.showMap;

    if (this.showMap) {
      setTimeout(() => {
        this.loadMap();
        // on force la carte à se redimensionner sinon elle s'affiche mal
        this.map?.invalidateSize();
      }, 100);
    }
  }

  // initialisation de la mini carte leaflet
  loadMap() {
    if (!this.spot) return;

    // on nettoie l'ancienne carte si elle existe
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    // on crée la carte centrée sur le spot
    this.map = L.map('mini-map', {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
    }).setView([this.spot.latitude, this.spot.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // gros rond bleu transparent
    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#2f65e8',
      fillColor: '#2f65e8',
      fillOpacity: 0.5,
      radius: 20
    }).addTo(this.map);

    // et un point blanc au milieu
    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#fff',
      fillColor: '#fff',
      fillOpacity: 1,
      radius: 5
    }).addTo(this.map);
  }
  closeSheet(){
    this.closed.emit();
  }

  goBack(){
    this.navCtrl.back();
  }

  onCarouselScroll(event: any) {
    const container = event.target;
    this.currentImageIndex = Math.round(container.scrollLeft / container.clientWidth);
  }

  // --- Critères de survie : helpers d'affichage ---

  get waterInfo(): WaterAvailabilityOption | undefined {
    return this.waterOptions.find(o => o.id === (this.spot?.water_availability || 'unknown'));
  }

  get legalInfo(): LegalStatusOption | undefined {
    return this.legalOptions.find(o => o.id === (this.spot?.legal_status || 'unknown'));
  }

  get groundInfo(): GroundTypeOption | undefined {
    return this.groundOptions.find(o => o.id === (this.spot?.ground_type || 'unknown'));
  }

  get networkInfo(): NetworkCoverageOption | undefined {
    return this.networkOptions.find(o => o.id === (this.spot?.network_coverage || 'unknown'));
  }

  // --- Disponibilité collaborative ---
  // Texte relatif type "il y a 2h", pour ne pas laisser croire à un statut temps réel exact
  get presenceLabel(): string {
    const report = this.spot?.last_presence_report;
    if (!report) return 'Aucun signalement récent';

    const minutes = Math.round((Date.now() - new Date(report.reported_at).getTime()) / 60000);
    let when: string;
    if (minutes < 60) when = `il y a ${minutes} min`;
    else if (minutes < 24 * 60) when = `il y a ${Math.round(minutes / 60)} h`;
    else when = `il y a ${Math.round(minutes / (60 * 24))} j`;

    const tentLabel = report.tent_count > 1 ? `${report.tent_count} tentes` : `${report.tent_count} tente`;
    return `${tentLabel} signalées ${when}`;
  }

  async openPresenceReport() {
    if (!this.spot) return;

    const alert = await this.alertController.create({
      header: 'Je suis sur place',
      subHeader: 'Aide les prochains randonneurs à savoir à quoi s\'attendre',
      inputs: [
        {
          name: 'tentCount',
          type: 'number',
          placeholder: 'Nombre de tentes sur le spot',
          min: 0,
          max: 99
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Signaler',
          handler: async (data) => {
            const count = parseInt(data.tentCount, 10);
            if (isNaN(count) || count < 0) return false;
            await this.spotsService.reportPresence(this.spot!.id, count);
            this.loadSpot(this.spot!.id);
            await this.showToast('Merci mon frate, signalement pris en compte !', 'success');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // --- Charte de préservation ---
  async openEcoReport() {
    if (!this.spot) return;

    const alert = await this.alertController.create({
      header: 'État du spot',
      subHeader: 'Aide à préserver ce coin de nature',
      buttons: [
        {
          text: '✅ Spot propre',
          handler: async () => {
            await this.spotsService.reportEcoStatus(this.spot!.id, 'clean');
            await this.showToast('Merci pour ta vigilance, badge Gardien de la Nature +1 !', 'success');
          }
        },
        {
          text: '⚠️ Déchets trouvés',
          handler: async () => {
            await this.spotsService.reportEcoStatus(this.spot!.id, 'litter_reported');
            await this.showToast('Signalé, merci de nous prévenir.', 'warning');
          }
        },
        { text: 'Annuler', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
