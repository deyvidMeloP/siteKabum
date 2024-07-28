import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { resolveRouterResolver } from './resolve-router.resolver';

describe('resolveRouterResolver', () => {
  // Define a função para executar o resolver dentro do contexto de injeção
  const executeResolver: ResolveFn<any> = (...resolverParameters) => 


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        resolveRouterResolver // Inclua o resolver nos providers
      ]
    });
  });

  it('should be created', () => {
    const resolver: resolveRouterResolver = TestBed.inject(resolveRouterResolver);
    expect(resolver).toBeTruthy();
  });

  it('should return true', () => {
    const resolver: resolveRouterResolver = TestBed.inject(resolveRouterResolver);


  });
});
