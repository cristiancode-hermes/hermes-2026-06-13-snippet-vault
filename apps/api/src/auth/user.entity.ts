import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, unique: true })
  username!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
