import { Component, OnInit, Inject } from '@angular/core';
import { Cliente } from 'src/app/_model/cliente';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ClienteService } from 'src/app/_service/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { PasswordValidation } from '../../login/nuevo/match';
import { Usuario } from 'src/app/_model/usuario';
import { UsuarioService } from 'src/app/_service/usuario.service';

@Component({
  selector: 'app-cliente-dialogo',
  templateUrl: './cliente-dialogo.component.html',
  styleUrls: ['./cliente-dialogo.component.css']
})
export class ClienteDialogoComponent implements OnInit {

  cliente: Cliente;
  imagenData: any;
  imagenEstado: boolean = false;
  selectedFiles: FileList;
  currentFileUpload: File;
  labelFile: string;

  form: FormGroup;

  constructor(private fb: FormBuilder,private dialogRef: MatDialogRef<ClienteDialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: Cliente, private clienteService: ClienteService, private userService: UsuarioService,private sanitization: DomSanitizer) { }

  ngOnInit() {
    this.cliente = new Cliente();
    this.cliente.idCliente = this.data.idCliente;
    this.cliente.nombres = this.data.nombres;
    this.cliente.apellidos = this.data.apellidos;
    this.cliente.dni = this.data.dni;
    this.cliente.fechaNac = this.data.fechaNac;

    if (this.data.idCliente > 0) {
      this.clienteService.listarPorId(this.data.idCliente).subscribe(data => {
        if (data.size > 0) {
          this.convertir(data);
        }
      });
    }

    this.form = this.fb.group({
      
      usuario: new FormControl(''),
      password: [''],
      confirmPassword: ['']
    }, {
        validator: PasswordValidation.MatchPassword
      });

  }

  convertir(data: any) {
    let reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = () => {
      let base64 = reader.result;
      this.imagenData = base64;
      this.setear(base64);
    }
  }

  setear(base64: any) {
    this.imagenData = this.sanitization.bypassSecurityTrustResourceUrl(base64);
    this.imagenEstado = true;
  }

  cancelar() {
    this.dialogRef.close();
  }

  selectFile(e: any) {
    this.labelFile = e.target.files[0].name;
    this.selectedFiles = e.target.files;
  }

  operar() {
    let usuario = new Usuario();
    usuario.username = this.form.value['usuario'];
    usuario.password = this.form.value['password'];
    usuario.enabled = true;
    usuario.cliente = this.cliente;


    if (this.selectedFiles != null) {
      this.currentFileUpload = this.selectedFiles.item(0);
    } else {
      this.currentFileUpload = new File([""], "blanco");
    }

    if (this.cliente != null && this.cliente.idCliente > 0) {
      console.log("Ingreso a Modificar");
      usuario.idUsuario=this.cliente.idCliente;
      console.log(usuario.idUsuario);
      console.log(usuario.username);
      console.log(usuario.password);

      this.userService.modificar(usuario).pipe(switchMap(() => {
        
        
        return this.clienteService.listar();
      }));
      
      this.clienteService.modificar(this.cliente,this.currentFileUpload).pipe(switchMap(() => {
        
        
        return this.clienteService.listar();
      })).subscribe(data => {
        
        this.clienteService.clienteCambio.next(data);
        this.clienteService.mensajeCambio.next("Se modifico");
      });
    } else {
      /*
      this.clienteService.registrar(this.cliente, this.currentFileUpload).subscribe(data => {
        this.clienteService.listar().subscribe(comidas => {
          this.clienteService.clienteCambio.next(comidas);
          this.clienteService.mensajeCambio.next("Se registro");
*/


this.clienteService.registrar(usuario, this.currentFileUpload).subscribe(data => {
  this.clienteService.listar().subscribe(data => {
    this.clienteService.clienteCambio.next(data);
    this.clienteService.mensajeCambio.next("Se registro");

        });
      });
    }
    this.dialogRef.close();
  }

}
