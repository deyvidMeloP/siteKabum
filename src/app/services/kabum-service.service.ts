import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KabumServiceService {

  private apiUrl = 'http://localhost:8080/api/products';
  private apiUrlImages = 'http://localhost:8080/api/images';
  private apiUrlBrands = 'http://localhost:8080/api/brands';

  
  constructor(private http: HttpClient) { }

  getDados(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }
  
  getDadosImages(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlImages).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }

  getDadosBrands(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrlBrands).pipe(
      tap(data => console.log('Dados recebidos:', data))
    );
  }
}
