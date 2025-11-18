export interface BlogEntity {
  id?: number;
  titulo: string;
  contenido: string;
  etiquetas: string;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
