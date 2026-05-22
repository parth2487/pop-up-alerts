import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Muat environment variables dari file .env
dotenv.config();

// --- PERBAIKAN UTAMA: Verifikasi variabel sebelum digunakan ---
const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    // Berikan pesan error yang jelas jika ada yang hilang
    throw new Error(`Environment variable ${varName} is missing in .env file.`);
  }
}
// -------------------------------------------------------------

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
});