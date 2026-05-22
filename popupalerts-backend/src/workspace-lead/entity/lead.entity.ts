import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workspace_leads')
export class WorkspaceLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  domain: string;

  @CreateDateColumn()
  created_at: Date;
}
