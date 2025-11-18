import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { BlogEntity } from '../../models/blog-entity';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetail implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly blog = signal<BlogEntity | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBlog(+id);
    }
  }

  private loadBlog(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.blogService.getById(id).subscribe({
      next: (blog) => {
        this.blog.set(blog);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar blog:', err);
        let errorMessage = 'Error al cargar el blog';
        
        if (err.status === 0) {
          errorMessage = 'No se puede conectar al servidor';
        } else if (err.status === 404) {
          errorMessage = 'Blog no encontrado';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  protected deleteBlog(): void {
    const blogId = this.blog()?.id;
    if (!blogId) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este blog?')) {
      return;
    }

    this.loading.set(true);
    this.blogService.delete(blogId).subscribe({
      next: () => {
        this.router.navigate(['/blogs']);
      },
      error: (err) => {
        this.error.set('Error al eliminar el blog: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/blogs']);
  }
}
