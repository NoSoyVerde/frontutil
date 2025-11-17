import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogEntity } from '../models/blog-entity';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/blogs';

  getAllByCategoria(categoria: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/categoria/${categoria}`, { params });
  }

  getAllByTitulo(titulo: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/titulo/${titulo}`, { params });
  }

  getAllByContenido(contenido: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/contenido/${contenido}`, { params });
  }

  getById(id: number): Observable<BlogEntity> {
    return this.http.get<BlogEntity>(`${this.apiUrl}/${id}`);
  }

  create(blog: BlogEntity): Observable<number> {
    return this.http.post<number>(this.apiUrl, blog);
  }

  update(blog: BlogEntity): Observable<number> {
    return this.http.put<number>(this.apiUrl, blog);
  }
}
