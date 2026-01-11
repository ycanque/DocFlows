import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

/**
 * Smart Auth Response Type
 *
 * Includes the user's organizational context (department, business unit)
 * for frontend form auto-filling and context-aware operations.
 */
interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department: {
    id: string;
    name: string;
    code: string;
    businessUnitId: string | null;
    businessUnit: {
      id: string;
      unitCode: string;
      name: string;
      description: string | null;
      status: string;
    } | null;
  } | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials and returns user with organizational context
   *
   * Smart Auth: Includes department and business unit data for frontend
   * context hydration. This allows forms to auto-fill based on user's
   * organizational membership.
   */
  private async validateUser(email: string, password: string): Promise<AuthUserResponse> {
    // Fetch user with department and business unit relations
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        department: {
          include: {
            businessUnit: {
              select: {
                id: true,
                unitCode: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Authenticates user and returns JWT token with organizational context
   *
   * Response includes:
   * - accessToken: JWT for API authentication
   * - user: User profile with department and business unit data
   *
   * Frontend can use department/businessUnit to:
   * - Auto-fill requisition forms with user's department
   * - Display correct business unit context
   * - Route requests to appropriate approvers
   */
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    // JWT payload includes organizational context for authorization
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      businessUnitId: user.department?.businessUnitId ?? null,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user,
    };
  }
}
