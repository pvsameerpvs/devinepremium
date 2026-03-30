import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BookingStatus } from "../types/domain";
import { Booking } from "./Booking";
import { User } from "./User";

@Entity("booking_status_history")
export class BookingStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  bookingId!: string;

  @ManyToOne(() => Booking, (booking) => booking.statusHistory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;

  @Column({ type: "varchar", nullable: true })
  changedByUserId!: string | null;

  @ManyToOne(() => User, (user) => user.changedStatuses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "changedByUserId" })
  changedBy!: User | null;

  @Column({ type: "varchar", nullable: true })
  fromStatus!: BookingStatus | null;

  @Column({ type: "varchar" })
  toStatus!: BookingStatus;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
