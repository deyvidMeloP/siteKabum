import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPrincipalComponent } from './product-principal.component';

describe('ProductPrincipalComponent', () => {
  let component: ProductPrincipalComponent;
  let fixture: ComponentFixture<ProductPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductPrincipalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
