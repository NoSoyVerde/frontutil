import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { BlogEntity } from '../../models/blog-entity';

@Component({
  selector: 'app-blog-form',
  imports: [ReactiveFormsModule],
  templateUrl: './blog-form.html',
  styleUrl: './blog-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly blogService = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly blogForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly blogId = signal<number | null>(null);

  constructor() {
    this.blogForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1024)]],
      contenido: ['', [Validators.required, Validators.minLength(3)]],
      etiquetas: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1024)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.blogId.set(+id);
      this.loadBlog(+id);
    }
  }

  private loadBlog(id: number): void {
    this.loading.set(true);
    this.blogService.getById(id).subscribe({
      next: (blog) => {
        this.blogForm.patchValue({
          titulo: blog.titulo,
          contenido: blog.contenido,
          etiquetas: blog.etiquetas
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar blog:', err);
        let errorMessage = 'Error al cargar el blog';
        
        if (err.status === 0) {
          errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8089';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  protected onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const blogData = this.blogForm.value;

    const operation = this.isEditMode()
      ? this.blogService.update(this.blogId()!, blogData)
      : this.blogService.create(blogData);

    operation.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/blogs']);
      },
      error: (err) => {
        console.error('Error completo:', err);
        let errorMessage = 'Error al guardar el blog';
        
        if (err.status === 0) {
          errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8089';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/blogs']);
  }

  protected getErrorMessage(field: string): string {
    const control = this.blogForm.get(field);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
