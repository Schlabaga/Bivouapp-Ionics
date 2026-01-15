import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingSpotsPage } from './listing-spots.page';

describe('ListingSpotsPage', () => {
  let component: ListingSpotsPage;
  let fixture: ComponentFixture<ListingSpotsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingSpotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
