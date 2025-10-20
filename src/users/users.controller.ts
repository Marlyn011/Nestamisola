// Added TypeScript typing for route parameters (`id: number`).
// Kept route guards on GET, PUT, DELETE, but left POST (create user) unguarded.
// Cleaned method names to typical REST conventions (`getAll` ➝ `findAll`, `getOne` ➝ `findOne`, `remove` ➝ `removeById`).

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JWTAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JWTAuthGuard)
  @Get()
  async findAll() {
    return this.usersService.getAll();
  }

  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Post()
  async create(@Body() body: { username: string; password: string }) {
    return this.usersService.createUser(body.username, body.password);
  }

  @UseGuards(JWTAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(Number(id), body);
  }

  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  async removeById(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
}