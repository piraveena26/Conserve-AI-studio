
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-fuchsia-50 to-rose-100 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background shapes -->
      <div class="absolute top-0 -left-1/4 w-96 h-96 bg-gradient-to-tr from-rose-200 to-fuchsia-300 rounded-full opacity-50 filter blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 -right-1/4 w-96 h-96 bg-gradient-to-br from-sky-300 to-indigo-300 rounded-full opacity-50 filter blur-3xl animate-pulse animation-delay-4000"></div>
      <div class="absolute -bottom-1/2 left-1/4 w-80 h-80 bg-gradient-to-tl from-green-200 to-cyan-300 rounded-full opacity-40 filter blur-3xl animate-pulse animation-delay-2000"></div>


      <!-- Login Card -->
      <div class="w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl z-10 flex overflow-hidden">
        <!-- Image Panel -->
        <div class="hidden lg:block lg:w-1/2">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Professional workspace" class="w-full h-full object-cover">
        </div>

        <!-- Form Panel -->
        <div class="w-full lg:w-1/2 p-8 text-slate-800 flex flex-col justify-center">
            <div class="text-center mb-8">
                <img src="https://img.logoipsum.com/243.svg" alt="Company Logo" class="h-10 mx-auto">
                <h2 class="text-3xl font-bold text-slate-900 mt-6">Welcome Back</h2>
                <p class="text-slate-600 mt-2">Sign in to continue to your dashboard.</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Email Input -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                </div>
                <input id="email" type="email" formControlName="email"
                  class="block w-full rounded-md border-0 bg-white/50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                  placeholder="you@example.com">
              </div>
              
              <!-- Password Input -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                    </svg>
                </div>
                <input id="password" type="password" formControlName="password"
                  class="block w-full rounded-md border-0 bg-white/50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                  placeholder="Password">
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-slate-300 bg-white/30 text-blue-600 focus:ring-blue-500">
                  <label for="remember-me" class="ml-2 block text-slate-600">Remember me</label>
                </div>
                <a href="#" class="font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>

              @if (errorMessage()) {
                <div class="bg-red-100 border border-red-300 text-sm text-red-800 rounded-md p-3" role="alert">
                  <strong>Login failed:</strong> {{ errorMessage() }}
                </div>
              }

              <div>
                <button type="submit" [disabled]="loginForm.invalid"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Sign in
                </button>
              </div>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-slate-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="bg-white/70 backdrop-blur-xl px-2 text-slate-500 rounded-full">Or continue with</span>
                </div>
            </div>

            <div>
                <button class="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-300 rounded-md shadow-sm bg-white/80 text-sm font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors">
                    <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['thava@conserve.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please enter a valid email and password.');
      return;
    }
    
    const { email, password } = this.loginForm.getRawValue();

    const success = this.userService.login(email!, password!);

    if (!success) {
      this.errorMessage.set('Invalid credentials. Please try again.');
    } else {
      this.errorMessage.set(null);
    }
  }
}
