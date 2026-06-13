import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable, OneToMany,
} from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { AiAnalysis } from '../ai-analysis/ai-analysis.entity';
import { Collection } from '../collections/collection.entity';

@Entity()
export class Snippet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text' })
  code!: string;

  @Column({ length: 50, default: 'plaintext' })
  language!: string;

  @ManyToMany(() => Tag, (tag) => tag.snippets)
  @JoinTable()
  tags!: Tag[];

  @OneToMany(() => AiAnalysis, (analysis) => analysis.snippet)
  analyses!: AiAnalysis[];

  @ManyToMany(() => Collection, (collection) => collection.snippets)
  collections!: Collection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
