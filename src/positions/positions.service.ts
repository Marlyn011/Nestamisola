import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

/**
 * Service layer for handling all "positions" related database operations.
 */
@Injectable()
export class PositionsService {
  constructor(private db: DatabaseService) {}

  // Helper function to get the MySQL connection pool
  private pool = () => this.db.getPool();

  /**
   * CREATE a new position
   */
  async createPosition(data: {
    position_code: string;
    position_name: string;
    user_id: number;
  }) {
    const { position_code, position_name, user_id } = data;

    if (!position_code || !position_name) {
      throw new Error('position_code and position_name are required');
    }

    // Insert into MySQL
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO positions (position_code, position_name, user_id)
       VALUES (?, ?, ?)`,
      [position_code, position_name, user_id],
    );

    const position_id = result.insertId;

    // Return the created record including timestamps
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT position_id, position_code, position_name, user_id AS id,
              created_at, updated_at
       FROM positions WHERE position_id = ?`,
      [position_id],
    );

    return rows[0];
  }

  /**
   * READ all positions
   */
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT position_id, position_code, position_name, user_id AS id,
              created_at, updated_at
       FROM positions`,
    );
    return rows;
  }

  /**
   * READ a single position by ID
   */
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT position_id, position_code, position_name, user_id AS id,
              created_at, updated_at
       FROM positions WHERE position_id = ?`,
      [id],
    );

    if (!rows[0]) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    return rows[0];
  }

  /**
   * UPDATE an existing position
   * Returns only a success message
   */
  async updatePosition(
    id: number,
    data: { position_code?: string; position_name?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.position_code) {
      fields.push('position_code = ?');
      values.push(data.position_code);
    }
    if (data.position_name) {
      fields.push('position_name = ?');
      values.push(data.position_name);
    }

    if (fields.length === 0) {
      return { message: 'No changes were made' };
    }

    // Always update the timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE positions SET ${fields.join(', ')} WHERE position_id = ?`;
    values.push(id);

    const [res] = await this.pool().execute<OkPacket>(sql, values);

    if (res.affectedRows === 0) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    // Return success message only
    return { message: 'Position updated successfully' };
  }

  /**
   * DELETE a position by ID
   * Returns only a success message
   */
  async deletePosition(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      `DELETE FROM positions WHERE position_id = ?`,
      [id],
    );

    if (res.affectedRows === 0) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    return { message: 'Position deleted successfully' };
  }
}