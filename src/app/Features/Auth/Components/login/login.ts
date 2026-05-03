import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(""),
    password: new FormControl("")
  });

  http = inject(HttpClient);
  router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;

  OnLogin() {
    const formValue = this.loginForm.value;
    this.http.post("https://smartcarepharmacy.tryasp.net/api/auth/login", formValue).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this._snackBar.open("Login Successful ✅", "Close", {
            duration: this.durationInSeconds * 1000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snack-success']
          });
          localStorage.setItem("token",response.data.accessToken)
          this.router.navigateByUrl("/dashboard");
        } else {
          this._snackBar.open(response.message, "Close", {
            duration: this.durationInSeconds * 1000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snack-error']
          });
        }
      },
      error: (error) => {
        this._snackBar.open(error.error?.message || "Login failed. Please try again.", "Close", {
          duration: this.durationInSeconds * 1000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snack-error']
        });
      }
    });
  }
}
