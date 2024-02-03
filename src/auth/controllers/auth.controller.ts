import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { UserSignUpDto } from './dto/user-sign.up.dto'
import { UserSignInDto } from './dto/user-sign.in.dto'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async singUp(@Body() userSignUpDto: UserSignUpDto) {
    return await this.authService.singUp(userSignUpDto)
  }

  @Post('signin')
  async singIn(@Body() userSignInDto: UserSignInDto) {
    return await this.authService.singIn(userSignInDto)
  }
}
