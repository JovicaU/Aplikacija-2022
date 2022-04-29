import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getHello(): string {
    return 'Helo World!';
  }

  @Get('world')
  getWorld(): string {
    return 'World!!!!';
  }

}
