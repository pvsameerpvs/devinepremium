import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { StaffAvailabilityDay } from "../types/domain";
import { Booking } from "./Booking";

@Entity("staff_members")
export class StaffMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  phone!: string | null;

  @Column({ type: "simple-json" })
  availabilityDays!: StaffAvailabilityDay[];

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Booking, (booking) => booking.assignedStaff)
  bookings!: Booking[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
