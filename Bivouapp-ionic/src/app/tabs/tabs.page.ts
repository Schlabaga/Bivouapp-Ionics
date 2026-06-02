import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  showTabBar=true;

  constructor() {}

  ionTabsWillChange(event:any){
    if(event.tab){
      if(event.tab == 'map' || event.tab=='publish'){
        this.showTabBar= false;
      } else{
        this.showTabBar= true;
      }
    }

  }
}
