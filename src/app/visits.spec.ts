import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { KabumServiceService } from './services/kabum-service.service';
import { BannerPairComponent } from './components/banner-pair/banner-pair.component';
import { ApiKabumComponent } from './components/api-kabum/api-kabum.component';

describe('Visits HTTP contract', () => {
  let service: KabumServiceService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigate: jasmine.createSpy() } }]
    });
    service = TestBed.inject(KabumServiceService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('posts to the product endpoint without a client total', () => {
    let completed = false;
    service.registerProductVisit(7).subscribe({ complete: () => completed = true });
    const request = http.expectOne('https://apikabum.onrender.com/api/products/7/visits');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBeTrue();
  });

  it('propagates errors without retrying an increment', () => {
    let status = 0;
    service.registerProductVisit(7).subscribe({ error: error => status = error.status });
    http.expectOne('https://apikabum.onrender.com/api/products/7/visits')
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });
});

describe('Visits in product cards and ranking', () => {
  let component: BannerPairComponent;
  let service: any;
  beforeEach(() => {
    service = {
      getDados: jasmine.createSpy().and.returnValue(EMPTY),
      registerProductVisit: jasmine.createSpy().and.returnValue(of(undefined)),
      changeProductMainName: jasmine.createSpy()
    };
    component = new BannerPairComponent(service, service, service, {} as any,
      service, service, service, service, service);
    spyOn(window, 'scrollTo');
    spyOn(console, 'error');
  });

  it('sorts all products without changing totals or source order', () => {
    component.produtoAll = [{ idProduct: 1, visits: 3 }, { idProduct: 2 },
      { idProduct: 3, visits: 10 }, { idProduct: 4, visits: 0 }];
    const before = JSON.stringify(component.produtoAll);
    component.MostSearch('TODOS');
    expect(component.mostSearch.map((p: any) => p.idProduct)).toEqual([3, 1, 4]);
    expect(component.mostSearch.map((p: any) => p.visits)).toEqual([10, 3, 0]);
    expect(JSON.stringify(component.produtoAll)).toBe(before);
  });

  it('preserves department ranking totals when clicking a product', () => {
    component.produtoAll = [{ idProduct: 1, visits: 8, name_Product: 'A' },
      { idProduct: 2, visits: 2 }, { idProduct: 3, visits: 99 }];
    component.departments = [{ productId: 1, dtName: 'Hardware' },
      { productId: 2, dtName: 'Hardware' }];
    component.MostSearch('HARDWARE');
    expect(component.mostSearch.map((p: any) => p.visits)).toEqual([8, 2]);
    component.navegarParaProductMain(component.mostSearch[0]);
    expect(service.registerProductVisit).toHaveBeenCalledOnceWith(1);
    expect(service.changeProductMainName).toHaveBeenCalledOnceWith('A');
    expect(component.produtoAll[0].visits).toBe(8);
    expect(component.mostSearch[0].visits).toBe(8);
  });

  for (const card of ['banner', 'api']) {
    for (const fails of [false, true]) {
      it(`preserves navigation and sends only id (${card}, failure=${fails})`, () => {
        if (fails) service.registerProductVisit.and.returnValue(throwError(() => new Error('offline')));
        const product = { idProduct: 7, visits: -1, name_Product: 'A' };
        if (card === 'banner') component.navegarParaProductMain(product);
        else new ApiKabumComponent(service, service, {} as any, service).navegarParaProductMain(product);
        expect(service.registerProductVisit).toHaveBeenCalledOnceWith(7);
        expect(service.changeProductMainName).toHaveBeenCalledOnceWith('A');
        expect(product.visits).toBe(-1);
      });
    }
  }
});
