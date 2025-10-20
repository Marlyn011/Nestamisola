import {
  Controller, Get, Post,Put,Delete,Param,Body,UseGuards,Request,
} 

from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JWTAuthGuard } from '../auth/jwt-auth.guard';

// Define structure for authenticated request
interface AuthenticatedRequest extends Request {
  user?: { id: number }; // JWT payload (from logged-in user)
}

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  /**
   * GET /positions
   * Fetch all positions
   */
  @UseGuards(JWTAuthGuard)
  @Get()
  async findAll() {
    return this.positionsService.getAll();
  }

  /**
   * GET /positions/:id
   * Fetch a position by ID
   */
  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.positionsService.findById(Number(id));
  }

  /**
   * POST /positions
   * Create a new position.
   * The user_id is automatically linked from the logged-in user.
   */
  @UseGuards(JWTAuthGuard)
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() body: { position_code: string; position_name: string },
  ) {
    if (!req.user || typeof req.user.id !== 'number') {
      throw new Error('User ID not found in request.');
    }

    return this.positionsService.createPosition({
      position_code: body.position_code,
      position_name: body.position_name,
      user_id: req.user.id,
    });
  }

  /**
   * PUT /positions/:id
   * Update an existing position
   */
  @UseGuards(JWTAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { position_code?: string; position_name?: string },
  ) {
    return this.positionsService.updatePosition(Number(id), body);
  }

  /**
   * DELETE /positions/:id
   * Delete a position by ID
   */
  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.positionsService.deletePosition(Number(id));
  }
}