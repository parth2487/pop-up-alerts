import { Widget } from 'src/widgets/entities/widget.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Widget, (widget) => widget.leads, { onDelete: 'CASCADE' })
  widget: Widget;

  // Kita gunakan JSONB agar fleksibel. Bisa menyimpan email, nama, dll.
  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}

