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

  ngOnInit(): void {
    this.loadBlogs();
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

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      if (this.searchValue().trim()) {
        this.search();
      } else {
        this.loadBlogs();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      if (this.searchValue().trim()) {
        this.search();
      } else {
        this.loadBlogs();
      }
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
