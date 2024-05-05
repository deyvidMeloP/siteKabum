import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerPairComponent } from './banner-pair.component';

describe('BannerPairComponent', () => {
  let component: BannerPairComponent;
  let fixture: ComponentFixture<BannerPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BannerPairComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
