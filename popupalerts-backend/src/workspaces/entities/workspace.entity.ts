import { User } from 'src/users/entities/user.entity';
import { Widget } from 'src/widgets/entities/widget.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // --- PERBAIKAN UTAMA DI SINI ---
  // Arahkan relasi kembali ke properti 'workspaces' di User entity
  @ManyToOne(() => User, (user) => user.workspaces)
  user: User;
  // -----------------------------

  @OneToMany(() => Widget, (widget) => widget.workspace)
  widgets: Widget[];
}
