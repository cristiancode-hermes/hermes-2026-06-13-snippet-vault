import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Snippet } from '../snippets/snippet.entity';

export type AnalysisType = 'language_detection' | 'complexity' | 'suggestions';

@Entity()
export class AiAnalysis {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Snippet, (snippet) => snippet.analyses, { onDelete: 'CASCADE' })
  @JoinColumn()
  snippet!: Snippet;

  @Column({ type: 'int' })
  snippetId!: number;

  @Column({ length: 50 })
  analysisType!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'float', nullable: true })
  score!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
