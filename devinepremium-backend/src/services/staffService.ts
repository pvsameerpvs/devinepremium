import { AppDataSource } from "../config/data-source";
import { StaffMember } from "../entities/StaffMember";
import {
  STAFF_AVAILABILITY_DAYS,
  StaffAvailabilityDay,
  StaffMemberInput,
} from "../types/domain";

const staffRepository = () => AppDataSource.getRepository(StaffMember);

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function normalizeAvailabilityDays(
  days: StaffAvailabilityDay[] | undefined,
): StaffAvailabilityDay[] {
  if (!days?.length) {
    return [];
  }

  const uniqueDays = new Set(days);
  return STAFF_AVAILABILITY_DAYS.filter((day) => uniqueDays.has(day));
}

export function getWeekdayKeyFromDate(date: string): StaffAvailabilityDay {
  return STAFF_AVAILABILITY_DAYS[new Date(`${date}T12:00:00`).getDay()];
}

export function isStaffAvailableForDate(
  staffMember: Pick<StaffMember, "availabilityDays" | "isActive">,
  date: string,
) {
  if (!staffMember.isActive) {
    return false;
  }

  return staffMember.availabilityDays.includes(getWeekdayKeyFromDate(date));
}

export const staffService = {
  async listStaffMembers() {
    return staffRepository()
      .createQueryBuilder("staff")
      .orderBy("staff.isActive", "DESC")
      .addOrderBy("staff.fullName", "ASC")
      .getMany();
  },

  async getStaffMember(staffId: string) {
    const staffMember = await staffRepository().findOne({
      where: { id: staffId },
    });

    if (!staffMember) {
      throw new Error("Staff member not found.");
    }

    return staffMember;
  },

  async createStaffMember(input: StaffMemberInput) {
    const availabilityDays = normalizeAvailabilityDays(input.availabilityDays);

    if (!input.fullName.trim()) {
      throw new Error("Staff name is required.");
    }

    if (!availabilityDays.length) {
      throw new Error("Select at least one available day for this staff member.");
    }

    const staffMember = staffRepository().create({
      fullName: input.fullName.trim(),
      email: normalizeText(input.email),
      phone: normalizeText(input.phone),
      availabilityDays,
      notes: normalizeText(input.notes),
      isActive: input.isActive ?? true,
    });

    return staffRepository().save(staffMember);
  },

  async updateStaffMember(
    staffId: string,
    input: Partial<StaffMemberInput>,
  ) {
    const staffMember = await this.getStaffMember(staffId);

    if (input.fullName !== undefined) {
      const fullName = input.fullName.trim();
      if (!fullName) {
        throw new Error("Staff name is required.");
      }
      staffMember.fullName = fullName;
    }

    if (input.email !== undefined) {
      staffMember.email = normalizeText(input.email);
    }

    if (input.phone !== undefined) {
      staffMember.phone = normalizeText(input.phone);
    }

    if (input.notes !== undefined) {
      staffMember.notes = normalizeText(input.notes);
    }

    if (input.isActive !== undefined) {
      staffMember.isActive = input.isActive;
    }

    if (input.availabilityDays !== undefined) {
      const availabilityDays = normalizeAvailabilityDays(input.availabilityDays);

      if (!availabilityDays.length) {
        throw new Error("Select at least one available day for this staff member.");
      }

      staffMember.availabilityDays = availabilityDays;
    }

    return staffRepository().save(staffMember);
  },
};
