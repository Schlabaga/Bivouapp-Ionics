import {Lodging, Service} from "../app/models/spot.model";

export const environment = {
  production: false,
  bypassAuth: false,

  supabaseUrl: 'https://wluyebrakzkvftofkmks.supabase.co',
  supabaseKey: 'sb_publishable_16eRskirQkEtT34_RKDV6A_SxMTlpSa',
  supabaseDirectConnectionString: 'postgresql://postgres:FeuilleDeMouchoir26%@db.wluyebrakzkvftofkmks.supabase.co:5432/postgres',
}

export const availableServices: Service[] = [
  { id: 'fire',        label: 'Feu autorisé', icon: 'flame-outline' },
  { id: 'water',       label: "Point d'eau",  icon: 'water-outline' },
  { id: 'wifi',        label: '4G / 5G',      icon: 'wifi-outline' },
  { id: 'electricity', label: 'Électricité',  icon: 'flash-outline' },
  { id: 'pool',        label: 'Baignade',     icon: 'boat-outline' },
  { id: 'shower',      label: 'Douche',       icon: 'rainy-outline' },
  { id: 'parking',     label: 'Parking',      icon: 'car-outline' },
  { id: 'toilet',      label: 'Toilettes',    icon: 'toilet-outline' },
];

export const lodging: Lodging[] = [
  { id: 'alpine_hut', label: 'Refuge gardé', icon: 'business-outline' },
  { id: 'wilderness_hut', label: 'Cabane non gardée', icon: 'home-outline' },
  { id: 'bivouac', label: 'Aire de bivouac', icon: 'tent-outline' },
  { id: 'camp_site', label: 'Camping aménagé', icon: 'bonfire-outline' },
  { id: 'gite_hostel', label: 'Gîte d\'étape', icon: 'bed-outline' },
  { id: 'chalet', label: 'Chalet / Cabin', icon: 'leaf-outline' }
];
