import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import {Spot} from "../models/spot.model";

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase= createClient(environment.supabaseUrl,environment.supabaseKey);
  }

  async getSpots(){
    const{data,error} = await this.supabase
      .from('spots')
      .select('*');

    if(error) throw error;
      return data;

  }

  async addSpot(newSpot: Partial<Spot>){
    const {data, error}= await this.supabase.from('spots')
      .insert([newSpot]);
    if(error) throw error;
      return data;
  }

}
