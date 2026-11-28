import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ORIGIN, createApiBaseUrl } from './services/api-configuration';
import { KabumServiceService } from './services/kabum-service.service';
import { environment } from '../environments/environment';
import { environment as development } from '../environments/environment.development';
import { environment as production } from '../environments/environment.production';
import { environment as testing } from '../environments/environment.test';

describe('Configuração da origem e contratos da API', () => {
  let service: KabumServiceService | undefined;
  let http: HttpTestingController | undefined;
  beforeEach(() => { service = undefined; http = undefined; });
  afterEach(() => { http?.verify(); service?.ngOnDestroy(); });

  function configure(origin?: string): KabumServiceService {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigate: jasmine.createSpy() } }, ...(origin ? [{ provide: API_ORIGIN, useValue: origin }] : [])]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(KabumServiceService);
    return service;
  }

  const endpoints = [
    ['getDados', 'products'], ['getDadosImages', 'images'], ['getDadosBrands', 'brands'],
    ['getDadosDepartments', 'departments'], ['getDadosSection', 'section'],
    ['getDadosSubsection', 'subsection'], ['getDadosCategories', 'categories'], ['getProductCategory', 'productCategory']
  ] as const;

  for (const config of [development, production, testing]) {
    for (const [method, endpoint] of endpoints) {
      it(config.name + ' consulta ' + endpoint + ' na origem escolhida', () => {
        let result: any[] | undefined;
        configure(config.apiOrigin)[method]().subscribe(value => result = value);
        const request = http!.expectOne(config.apiOrigin + '/api/' + endpoint);
        expect(request.request.method).toBe('GET');
        expect(request.request.body).toBeNull();
        request.flush([{ id: 7 }]);
        expect(result).toEqual([{ id: 7 }]);
      });
    }
    it(config.name + ' registra visita sem enviar o total', () => {
      let completed = false;
      configure(config.apiOrigin).registerProductVisit(7).subscribe({ complete: () => completed = true });
      const request = http!.expectOne(config.apiOrigin + '/api/products/7/visits');
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toBeNull();
      request.flush(null, { status: 204, statusText: 'No Content' });
      expect(completed).toBeTrue();
    });
  }

  it('o builder de testes seleciona a origem não pública', () => {
    expect(environment.name).toBe('test');
    expect(environment.apiOrigin).toBe(testing.apiOrigin);
    expect(environment.apiOrigin).not.toBe(production.apiOrigin);
  });
  it('a configuração local permanece separada da publicada', () => {
    expect(development.apiOrigin).toBe('http://localhost:8080');
    expect(production.apiOrigin).toBe('https://apikabum.onrender.com');
    expect(production.production).toBeTrue();
    expect(development.production).toBeFalse();
  });
  it('o provider padrão usa o ambiente de testes', () => {
    configure().getDados().subscribe();
    http!.expectOne(testing.apiOrigin + '/api/products').flush([]);
    expect(TestBed.inject(API_ORIGIN)).toBe(testing.apiOrigin);
  });
  it('a construção direta existente continua usando a configuração selecionada', () => {
    configure();
    const instance = new KabumServiceService(TestBed.inject(HttpClient), TestBed.inject(Router));
    instance.getDados().subscribe();
    http!.expectOne(testing.apiOrigin + '/api/products').flush([]);
    instance.ngOnDestroy();
  });
  for (const [origin, expected] of [
    ['http://localhost:8080/', 'http://localhost:8080/api'],
    ['https://api.test.invalid////', 'https://api.test.invalid/api'],
    [' https://api.test.invalid ', 'https://api.test.invalid/api']
  ]) {
    it('normaliza a origem ' + origin, () => expect(createApiBaseUrl(origin)).toBe(expected));
  }
  for (const origin of ['', '/api', 'ftp://api.invalid', 'https://user:fake@api.invalid', 'https://api.invalid/api', 'https://api.invalid?q=x', 'https://api.invalid#x', 'javascript:alert(1)']) {
    it('rejeita origem incompatível sem expor seu valor', () => expect(() => createApiBaseUrl(origin)).toThrowError('Origem da API inválida'));
  }
  it('propaga falha HTTP sem mudar a origem nem refazer o pedido', () => {
    let status = 0;
    configure(development.apiOrigin).getDados().subscribe({ error: error => status = error.status });
    http!.expectOne(development.apiOrigin + '/api/products').flush(null, { status: 503, statusText: 'Unavailable' });
    expect(status).toBe(503);
    http!.expectNone(request => request.url.startsWith(production.apiOrigin));
  });
});
