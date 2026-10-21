
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    createdAt: string;
    updatedAt: string;
}

@Injectable({
    providedIn: 'root',
})
export class CustomersService {
    private readonly apiUrl = 'http://localhost:3000/customers';

    constructor(private readonly http: HttpClient) { }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(this.apiUrl);
    }

    getCustomer(id: string): Observable<Customer> {
        return this.http.get<Customer>(
            `${this.apiUrl}/${encodeURIComponent(id)}`,
        );
    }

    createCustomer(data: {
        name: string;
        email: string;
        phone?: string;
        company?: string;
    }): Observable<Customer> {
        return this.http.post<Customer>(this.apiUrl, data);
    }
}
