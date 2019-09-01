import { Cliente } from './cliente';
export class Usuario {
    idUsuario: number;
    cliente: Cliente;
    username: string;
    password: string;
    enabled: boolean;
}