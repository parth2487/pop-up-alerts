import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany, // <-- Pastikan ini diimpor
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity'; // <-- Impor Workspace

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  // --- KOLOM YANG HILANG ADA DI SINI ---
  @Column({ type: 'varchar', default: 'user' }) // Default 'user' untuk setiap pendaftaran baru
  role: string; // Bisa 'user' atau 'admin'
  // ------------------------------------

  @Column({ type: 'timestamp', nullable: true, default: null })
  email_verified_at: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false }) // Sembunyikan token dari query biasa
  email_verification_token: string | null;
  // --- TAMBAHKAN DUA KOLOM INI ---
  @Column({ type: 'varchar', nullable: true, select: false })
  password_reset_token: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  password_reset_expires: Date | null;
  // -----------------------------
  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  // Tambahkan hubungan kembali ke Workspace
  @OneToMany(() => Workspace, (workspace) => workspace.user)
  workspaces: Workspace[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}