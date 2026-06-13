import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Snippet } from '../snippets/snippet.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 7, default: '#3B82F6' })
  color!: string;

  @ManyToMany(() => Snippet, (snippet) => snippet.tags)
  snippets!: Snippet[];
}
