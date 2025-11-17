import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogEntity } from '../../models/blog-entity';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogList {
  private readonly blogService = inject(BlogService);
  
  protected readonly blogs = signal<BlogEntity[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  
  protected readonly searchType = signal<'categoria' | 'titulo' | 'contenido'>('categoria');
  protected readonly searchValue = signal('');
  
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly pageSize = 10;

  search(): void {
    if (!this.searchValue().trim()) {
      this.error.set('Por favor, introduce un valor de búsqueda');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    
    const searchFn = {
      categoria: () => this.blogService.getAllByCategoria(this.searchValue(), this.currentPage(), this.pageSize),
      titulo: () => this.blogService.getAllByTitulo(this.searchValue(), this.currentPage(), this.pageSize),
      contenido: () => this.blogService.getAllByContenido(this.searchValue(), this.currentPage(), this.pageSize)
    }[this.searchType()];

    searchFn().subscribe({
      next: (response) => {
        this.blogs.set(response.content || []);
        this.totalPages.set(response.totalPages || 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al buscar blogs: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.search();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.search();
    }
  }
}
