import { Widget } from 'src/widgets/entities/widget.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number; // Peringkat bintang (1-5)

  @Column({ type: 'text' })
  text: string; // Teks ulasan

  @Column()
  author: string; // Nama pemberi ulasan

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Widget, (widget) => widget.reviews, { onDelete: 'CASCADE' })
  widget: Widget;
}
