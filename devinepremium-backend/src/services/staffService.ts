import { AppDataSource } from "../config/data-source";
import { StaffMember } from "../entities/StaffMember";
import {
  STAFF_AVAILABILITY_DAYS,
  StaffAvailabilityDay,
  StaffMemberInput,
} from "../types/domain";

const staffRepository = () => AppDataSource.getRepository(StaffMember);
const MAX_IMAGE_PAYLOAD_CHARS = 7_500_000;
const MAX_DOCUMENT_IMAGE_COUNT = 8;
const MAX_STAFF_SLUG_LENGTH = 255;

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "staff";
}

function normalizeSlug(value?: string | null) {
  const normalized = value?.trim() || "";
  return normalized ? slugify(normalized) : null;
}

function normalizeImagePayload(value?: string | null) {
  const normalized = value?.trim() || null;

  if (normalized && normalized.length > MAX_IMAGE_PAYLOAD_CHARS) {
    throw new Error(
      "Image is too large. Please upload a smaller file (5MB max).",
    );
  }

  return normalized;
}

function normalizeDocumentImages(value?: string[] | null) {
  if (!value?.length) {
    return [];
  }

  const images = value
    .map((item) => normalizeImagePayload(item))
    .filter((item): item is string => Boolean(item));

  if (images.length > MAX_DOCUMENT_IMAGE_COUNT) {
    throw new Error(
      `Maximum ${MAX_DOCUMENT_IMAGE_COUNT} document images are allowed per staff member.`,
    );
  }

  return images;
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

function buildSlugCandidate(baseSlug: string, suffix: number) {
  const suffixText = suffix > 1 ? `-${suffix}` : "";
  const maxBaseLength = MAX_STAFF_SLUG_LENGTH - suffixText.length;
  const truncatedBase = baseSlug.slice(0, maxBaseLength).replace(/-+$/g, "");
  const safeBase = truncatedBase || "staff";

  return `${safeBase}${suffixText}`;
}

async function resolveUniqueSlug(baseInput: string, excludeStaffId?: string) {
  const repository = staffRepository();
  const baseSlug = slugify(baseInput);
  let suffix = 1;

  while (true) {
    const candidate = buildSlugCandidate(baseSlug, suffix);
    const existing = await repository.findOne({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeStaffId) {
      return candidate;
    }

    suffix += 1;
  }
}

async function ensureStaffSlug(staffMember: StaffMember) {
  if (staffMember.slug?.trim()) {
    return staffMember;
  }

  staffMember.slug = await resolveUniqueSlug(staffMember.fullName, staffMember.id);
  return staffRepository().save(staffMember);
}

export const staffService = {
  async listStaffMembers() {
    const staffMembers = await staffRepository()
      .createQueryBuilder("staff")
      .orderBy("staff.isActive", "DESC")
      .addOrderBy("staff.fullName", "ASC")
      .getMany();

    return Promise.all(staffMembers.map((staffMember) => ensureStaffSlug(staffMember)));
  },

  async getStaffMember(staffId: string) {
    const staffMember = await staffRepository().findOne({
      where: { id: staffId },
    });

    if (!staffMember) {
      throw new Error("Staff member not found.");
    }

    return ensureStaffSlug(staffMember);
  },

  async createStaffMember(input: StaffMemberInput) {
    const fullName = input.fullName.trim();
    const availabilityDays = normalizeAvailabilityDays(input.availabilityDays);

    if (!fullName) {
      throw new Error("Staff name is required.");
    }

    if (!availabilityDays.length) {
      throw new Error("Select at least one available day for this staff member.");
    }

    const slug = await resolveUniqueSlug(
      normalizeSlug(input.slug) || fullName,
    );

    const staffMember = staffRepository().create({
      fullName,
      slug,
      email: normalizeText(input.email),
      phone: normalizeText(input.phone),
      availabilityDays,
      notes: normalizeText(input.notes),
      profilePhotoUrl: normalizeImagePayload(input.profilePhotoUrl),
      documentImageUrls: normalizeDocumentImages(input.documentImageUrls),
      isActive: input.isActive ?? true,
    });

    return staffRepository().save(staffMember);
  },

  async updateStaffMember(
    staffId: string,
    input: Partial<StaffMemberInput>,
  ) {
    const staffMember = await this.getStaffMember(staffId);
    const wasSlugProvided = input.slug !== undefined;

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

    if (input.profilePhotoUrl !== undefined) {
      staffMember.profilePhotoUrl = normalizeImagePayload(input.profilePhotoUrl);
    }

    if (input.documentImageUrls !== undefined) {
      staffMember.documentImageUrls = normalizeDocumentImages(
        input.documentImageUrls,
      );
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

    if (wasSlugProvided) {
      staffMember.slug = await resolveUniqueSlug(
        normalizeSlug(input.slug) || staffMember.fullName,
        staffMember.id,
      );
    } else if (!staffMember.slug?.trim()) {
      staffMember.slug = await resolveUniqueSlug(
        staffMember.fullName,
        staffMember.id,
      );
    }

    return staffRepository().save(staffMember);
  },

  async deleteStaffMember(staffId: string) {
    const staffMember = await this.getStaffMember(staffId);
    await staffRepository().delete({ id: staffMember.id });
    return staffMember;
  },
};
