import { Widget } from 'src/widgets/entities/widget.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  response: string; // Misal: "happy", "neutral", "sad"

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Widget, (widget) => widget.feedbacks, { onDelete: 'CASCADE' })
  widget: Widget;
}