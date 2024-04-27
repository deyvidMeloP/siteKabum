import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKabumComponent } from './api-kabum.component';


describe('ApiKabumComponent', () => {
  let component: ApiKabumComponent;
  let fixture: ComponentFixture<ApiKabumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApiKabumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApiKabumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
