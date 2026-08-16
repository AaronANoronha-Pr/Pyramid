import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  signToken(userId: string) {
    return this.jwt.sign({ sub: userId });
  }
}
