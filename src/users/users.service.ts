// Added role-based default assignment during user registration.
// Added extra error handling (throws NotFoundException if user not found).
// Update method now allows updating refresh token and improved partial updates.
// Added createdAt field handling for consistency.
// Simplified responses (returning objects with meaningful info instead of raw DB packets).

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async createUser(
    username: string,
    password: string,
    role: string = 'user',
  ) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, ?, NOW())',
      [username, hashed, role],
    );
    return { id: result.insertId, username, role };
  }

  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, password, role, refresh_token, created_at FROM users WHERE username = ?',
      [username],
    );
    return rows[0] || null;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`User with id ${id} not found`);
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users',
    );
    return rows;
  }

  async updateUser(
    id: number,
    partial: { username?: string; password?: string; role?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) return this.findById(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await this.pool().execute(sql, values);
    return this.findById(id);
  }

  async deleteUser(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE id = ?',
      [id],
    );
    if (res.affectedRows === 0)
      throw new NotFoundException(`User with id ${id} not found`);
    return { success: true, message: 'User deleted successfully' };
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE refresh_token = ?',
      [refreshToken],
    );
    return rows[0] || null;
  }
}