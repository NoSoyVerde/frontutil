import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogEntity, PageResponse } from '../models/blog-entity';
import { environment } from '../enviroment/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Listar con paginación y filtros
  getBlogs(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: 'asc' | 'desc' = 'asc',
    filters?: { category?: string; titulo?: string; contenido?: string }
  ): Observable<PageResponse<BlogEntity>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.titulo) params = params.set('titulo', filters.titulo);
    if (filters?.contenido) params = params.set('contenido', filters.contenido);

    return this.http.get<PageResponse<BlogEntity>>(this.apiUrl, { params });
  }

  // Lista simple con paginación
  getList(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: 'asc' | 'desc' = 'asc'
  ): Observable<PageResponse<BlogEntity>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<BlogEntity>>(`${this.apiUrl}/list`, { params });
  }

  // Obtener todos sin paginación
  getAllBlogs(): Observable<BlogEntity[]> {
    return this.http.get<BlogEntity[]>(`${this.apiUrl}/all`);
  }

  // Obtener por ID
  getById(id: number): Observable<BlogEntity> {
    return this.http.get<BlogEntity>(`${this.apiUrl}/${id}`);
  }

  // Crear blog
  create(blog: Omit<BlogEntity, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Observable<number> {
    return this.http.post<number>(this.apiUrl, blog);
  }

  // Actualizar blog
  update(id: number, blog: Omit<BlogEntity, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/${id}`, blog);
  }

  // Eliminar blog
  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  // Generar blog aleatorio
  generarBlogAleatorio(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/frasealeatoria`);
  }

  // Generar varios blogs
  generarVarios(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/generarvarios`, { responseType: 'text' as 'json' });
  }

  // Endpoint de prueba
  saludar(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/saludar`, { responseType: 'text' as 'json' });
  }
}
