import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonModule } from '@angular/common';
import { setListRow } from '../../util/methods';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RolResponse } from '../../model/api/response/RolResponse';
import { RolRequest } from '../../model/api/request/RolRequest';
import { RolService } from '../../service/security/rol.service';
import { PaginaService } from '../../service/security/pagina.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Pagina } from '../../model/dto/Pagina';

@Component({
  selector: 'app-rol',
  imports: [CommonModule,
    NgxDatatableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule],
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.css'
})
export class RolComponent implements OnInit {

  listPagina: Pagina[] = [];

  result: RolResponse[] = [];
  filter: RolRequest = new RolRequest();
  record: RolRequest = new RolRequest();
  columns: any[] = [];

  @ViewChild('colAccionTemplate', { static: true }) colAccionTemplate!: TemplateRef<any>;
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private dialog: MatDialog,
    private service: RolService,
    private paginaService: PaginaService
  ) { }

  ngOnInit() {

    forkJoin({
      resultPagina: this.paginaService.list({})
    }).subscribe({
      next: ({ resultPagina }) => {
        this.listPagina = resultPagina;
        this.search();
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: err.error,
        });
      }
    });
  }

  cleanSearch() {
    this.filter = new RolRequest();
    this.search();
  }

  search() {
    forkJoin({
      resultResponse: this.service.list(this.filter)
    }).subscribe({
      next: ({ resultResponse }) => {
        console.log(resultResponse);
        this.result = [...setListRow(resultResponse)];
        this.initTable();
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: err.error,
        });
      }
    });
  }

  openAdd() {
    this.record = new RolRequest();
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px'
    });
  }

  openEdit(value: RolResponse) {
    forkJoin({
      resultResponse: this.service.find({ id: value.id })
    }).subscribe({
      next: ({ resultResponse }) => {
        this.record = resultResponse;
        this.dialogRef = this.dialog.open(this.dialogTemplate, {
          width: '400px'
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: err.error,
        });
      }
    });
  }

  save() {
    if (!this.record.nombre || !this.record.codigo) {
      Swal.fire({
        icon: 'warning',
        title: 'Debe ingresar todos los valores obligatorios',
      });
      return;
    }
    this.service.save(this.record).subscribe(
      (result: RolResponse) => {
        this.search();
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: this.record.id ? 'Actualización Exitosa' : 'Registro Exitoso',
          text: 'El rol ' + result.nombre + ' fue ' + (this.record.id ? 'actualizado' : 'registrado'),
        });
        this.dialogRef.close();
      },
      (err: any) => {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: err.error,
        });
      }
    );
  }

  delete(value: RolResponse) {
    Swal.fire({
      title: '¿Está seguro de eliminar el rol seleccionado?',
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Si',
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete({ id: value.id }).subscribe(
          (result: RolResponse) => {
            this.search();
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Eliminación Exitosa',
              text: 'El rol ' + result.nombre + ' fue eliminado',
            });
          },
          (err: any) => {
            Swal.close();
            Swal.fire({
              icon: 'warning',
              title: '¡Advertencia!',
              text: err.error,
            });
          }
        );
      }
    });
  }

  initTable() {
    this.columns = [
      { name: 'Nro.', prop: 'row', width: 40 },
      { name: 'Código', prop: 'codigo' },
      { name: 'Nombre', prop: 'nombre' },
      { name: 'Acciones', cellTemplate: this.colAccionTemplate, width: 80 }
    ];
  }

}
