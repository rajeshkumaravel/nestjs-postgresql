
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        return customer;
    }

    async create(dto: CreateCustomerDto) {
        try {
            return await this.prisma.customer.create({
                data: {
                    name: dto.name,
                    email: dto.email.trim().toLowerCase(),
                    phone: dto.phone,
                    company: dto.company,
                },
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A customer with this email already exists',
                );
            }
            throw error;
        }
    }

    async update(id: string, dto: UpdateCustomerDto) {
        await this.findOne(id);
        try {
            return await this.prisma.customer.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.email !== undefined && {
                        email: dto.email.trim().toLowerCase(),
                    }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.company !== undefined && { company: dto.company }),
                },
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A customer with this email already exists',
                );
            }
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.customer.delete({
            where: { id },
        });
        return { message: 'Customer deleted successfully' };
    }
}
