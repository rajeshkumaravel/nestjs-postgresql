import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// INFO: Custom imports
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
    sub: string;
    jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload.sub || !payload.jti) {
            throw new UnauthorizedException('Invalid token');
        }
        const session = await this.prisma.authSession.findUnique({
            where: { jti: payload.jti },
            select: {
                userId: true,
                expiresAt: true,
                revokedAt: true,
            },
        });
        if (
            !session ||
            session.revokedAt ||
            session.expiresAt <= new Date() ||
            session.userId !== payload.sub
        ) {
            throw new UnauthorizedException('Session is invalid or revoked');
        }
        return {
            userId: session.userId,
            email: undefined,
            jti: payload.jti,
        };
    }
}
