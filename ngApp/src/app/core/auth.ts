
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly apiUrl = 'http://localhost:3000/auth';

    private accessToken: string | null = null;
    private currentUser: LoginResponse['user'] | null = null;

    constructor(private readonly http: HttpClient) { }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap((response) => {
                    this.accessToken = response.access_token;
                    this.currentUser = response.user;
                }),
            );
    }

    logout(): Observable<{ message: string }> {
        if (!this.accessToken) {
            this.clearSession();
            return new Observable((subscriber) => {
                subscriber.next({ message: 'Logged out' });
                subscriber.complete();
            });
        }
        return this.http
            .post<{ message: string }>(
                `${this.apiUrl}/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                },
            )
            .pipe(
                tap(() => this.clearSession()),
            );
    }

    getToken(): string | null {
        return this.accessToken;
    }

    getUser(): LoginResponse['user'] | null {
        return this.currentUser;
    }

    isAuthenticated(): boolean {
        return this.accessToken !== null;
    }

    clearSession(): void {
        this.accessToken = null;
        this.currentUser = null;
    }
}
