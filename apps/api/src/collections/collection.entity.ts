import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Snippet } from '../snippets/snippet.entity';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ length: 7, default: '#8B5CF6' })
  color!: string;

  @ManyToMany(() => Snippet, (snippet) => snippet.collections)
  @JoinTable()
  snippets!: Snippet[];

  @CreateDateColumn()
  createdAt!: Date;
}
