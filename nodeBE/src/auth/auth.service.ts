
import {
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

// INFO: Custom imports
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    private async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString('hex')}`;
    }

    private async verifyPassword(
        password: string,
        storedHash: string,
    ): Promise<boolean> {
        const [salt, hashHex] = storedHash.split(':');
        if (!salt || !hashHex || !/^[a-f0-9]{128}$/i.test(hashHex)) {
            return false;
        }
        const expected = Buffer.from(hashHex, 'hex');
        const actual = (await scrypt(password, salt, expected.length)) as Buffer;
        return timingSafeEqual(expected, actual);
    }

    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }
        const passwordHash = await this.hashPassword(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    passwordHash,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                },
            });
            return {
                message: 'Registration successful',
                user,
            };
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email is already registered');
            }
            throw error;
        }
    }

    async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const passwordValid = await this.verifyPassword(
            dto.password,
            user.passwordHash,
        );
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const jti = randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.authSession.create({
            data: {
                userId: user.id,
                jti,
                expiresAt,
            },
        });
        try {
            const accessToken = await this.jwtService.signAsync({
                sub: user.id,
                jti,
            });
            return {
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: 900,
                user: {
                    id: user.id,
                    email: user.email,
                },
            };
        } catch (error) {
            // Avoid leaving an active session if JWT signing fails.
            await this.prisma.authSession.update({
                where: { jti },
                data: { revokedAt: new Date() },
            });
            throw error;
        }
    }

    async logout(jti: string) {
        await this.prisma.authSession.updateMany({
            where: {
                jti,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
        return {
            message: 'Logout successful',
        };
    }
}
