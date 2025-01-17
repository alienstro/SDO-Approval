import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {


  constructor(private _snackbar: MatSnackBar) {}

  showSnackbar(message: string) {
    this._snackbar.open(message, 'Close', {
      duration: 3000
    })
  }

}
