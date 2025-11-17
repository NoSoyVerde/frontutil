export interface BlogEntity {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
