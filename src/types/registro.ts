export interface RegistroUsuario {
  id: string;
  nit: string;
  nombre_establecimiento: string;
  direccion: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  num_telefono: string;
  nombre_barrio: string;
  nombre_sector: string;
}

export type UpdateRegistroPayload = Partial<
  Pick<
    RegistroUsuario,
    | "nit"
    | "nombre_establecimiento"
    | "direccion"
    | "primer_nombre"
    | "segundo_nombre"
    | "primer_apellido"
    | "segundo_apellido"
    | "num_telefono"
    | "nombre_barrio"
    | "nombre_sector"
  >
>;
