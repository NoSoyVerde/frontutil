import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { BlogEntity } from '../../models/blog-entity';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogList implements OnInit {
  private readonly blogService = inject(BlogService);
  
  protected readonly blogs = signal<BlogEntity[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  
  protected readonly searchType = signal<'etiquetas' | 'titulo' | 'contenido'>('titulo');
  protected readonly searchValue = signal('');
  
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly pageSize = 10;
  protected readonly vecindad = 1; // Número de páginas a cada lado de la página actual

  ngOnInit(): void {
    this.loadBlogs();
  }

  /**
   * Calcula los números de página visibles según la lógica de vecindad
   * Devuelve un array con los números de página a mostrar, incluyendo null para los "..."
   */
  protected getPageNumbers(): (number | null)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const vecindad = this.vecindad;
    
    if (total === 0) return [];
    
    const pages: (number | null)[] = [];
    
    // Siempre mostrar la primera página
    pages.push(0);
    
    // Calcular el rango visible alrededor de la página actual
    const start = Math.max(1, current - vecindad);
    const end = Math.min(total - 2, current + vecindad);
    
    // Agregar "..." si hay páginas ocultas entre 1 y el inicio del rango
    if (start > 1) {
      pages.push(null);
    }
    
    // Agregar páginas del rango visible
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Agregar "..." si hay páginas ocultas entre el final del rango y la última
    if (end < total - 2) {
      pages.push(null);
    }
    
    // Siempre mostrar la última página (si hay más de una)
    if (total > 1) {
      pages.push(total - 1);
    }
    
    return pages;
  }

  protected goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) {
      return;
    }
    
    this.currentPage.set(page);
    if (this.searchValue().trim()) {
      this.loadBlogsWithSearch();
    } else {
      this.loadBlogs();
    }
  }

  private loadBlogsWithSearch(): void {
    const searchVal = this.searchValue().trim();
    this.loading.set(true);
    this.error.set(null);
    
    const filters = searchVal ? {
      [this.searchType() === 'etiquetas' ? 'category' : this.searchType()]: searchVal
    } : undefined;

    this.blogService.getBlogs(this.currentPage(), this.pageSize, 'fechaCreacion', 'desc', filters).subscribe({
      next: (response) => {
        this.blogs.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al buscar blogs: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  loadBlogs(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.blogService.getBlogs(this.currentPage(), this.pageSize, 'fechaCreacion', 'desc').subscribe({
      next: (response) => {
        this.blogs.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar blogs:', err);
        let errorMessage = 'Error al cargar blogs';
        
        if (err.status === 0) {
          errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  search(): void {
    const searchVal = this.searchValue().trim();
    
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(0);
    
    const filters = searchVal ? {
      [this.searchType() === 'etiquetas' ? 'category' : this.searchType()]: searchVal
    } : undefined;

    this.blogService.getBlogs(0, this.pageSize, 'fechaCreacion', 'desc', filters).subscribe({
      next: (response) => {
        this.blogs.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al buscar blogs: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchValue.set('');
    this.currentPage.set(0);
    this.loadBlogs();
  }

  protected firstPage(): void {
    this.goToPage(0);
  }

  protected lastPage(): void {
    this.goToPage(this.totalPages() - 1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  deleteBlog(id: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este blog?')) {
      return;
    }

    this.loading.set(true);
    this.blogService.delete(id).subscribe({
      next: () => {
        this.loadBlogs();
      },
      error: (err) => {
        this.error.set('Error al eliminar blog: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}
