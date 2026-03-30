import { AppDataSource } from "../config/data-source";
import { SavedAddress } from "../entities/SavedAddress";
import { User } from "../entities/User";
import { SavedAddressInput } from "../types/domain";

interface UpdateProfileInput {
  fullName: string;
  phone?: string;
  defaultInstructions?: string;
}

const userRepository = () => AppDataSource.getRepository(User);
const savedAddressRepository = () => AppDataSource.getRepository(SavedAddress);

function toSafeUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    defaultInstructions: user.defaultInstructions,
  };
}

function toSavedAddress(address: SavedAddress) {
  return {
    id: address.id,
    label: address.label,
    location: address.location,
    building: address.building,
    apartment: address.apartment,
    city: address.city,
    mapLink: address.mapLink,
    lat: address.lat,
    lng: address.lng,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

function normalizeAddressInput(input: SavedAddressInput) {
  return {
    label: input.label.trim(),
    location: input.location.trim(),
    building: input.building?.trim() || null,
    apartment: input.apartment?.trim() || null,
    city: input.city.trim(),
    mapLink: input.mapLink?.trim() || null,
    lat: input.lat?.trim() || null,
    lng: input.lng?.trim() || null,
    isDefault: Boolean(input.isDefault),
  };
}

async function ensureSingleDefaultAddress(userId: string, keepAddressId?: string) {
  const query = savedAddressRepository()
    .createQueryBuilder()
    .update(SavedAddress)
    .set({ isDefault: false })
    .where("userId = :userId", { userId });

  if (keepAddressId) {
    query.andWhere("id != :keepAddressId", { keepAddressId });
  }

  await query.execute();
}

async function ensureFallbackDefaultAddress(userId: string) {
  const hasDefault = await savedAddressRepository().findOne({
    where: { userId, isDefault: true },
  });

  if (hasDefault) {
    return;
  }

  const firstAddress = await savedAddressRepository().findOne({
    where: { userId },
    order: {
      createdAt: "ASC",
    },
  });

  if (!firstAddress) {
    return;
  }

  firstAddress.isDefault = true;
  await savedAddressRepository().save(firstAddress);
}

export const accountService = {
  async getAccount(userId: string) {
    const user = await userRepository().findOne({
      where: { id: userId },
      relations: {
        savedAddresses: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const sortedAddresses = [...(user.savedAddresses ?? [])].sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      return a.isDefault ? -1 : 1;
    });

    return {
      user: toSafeUser(user),
      savedAddresses: sortedAddresses.map(toSavedAddress),
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    user.fullName = input.fullName.trim();
    user.phone = input.phone?.trim() || null;
    user.defaultInstructions = input.defaultInstructions?.trim() || null;

    const savedUser = await userRepository().save(user);

    return {
      user: toSafeUser(savedUser),
    };
  },

  async createSavedAddress(userId: string, input: SavedAddressInput) {
    const normalized = normalizeAddressInput(input);
    const existingCount = await savedAddressRepository().count({
      where: { userId },
    });

    const address = savedAddressRepository().create({
      userId,
      ...normalized,
      isDefault: normalized.isDefault || existingCount === 0,
    });

    if (address.isDefault) {
      await ensureSingleDefaultAddress(userId);
    }

    const savedAddress = await savedAddressRepository().save(address);

    return {
      address: toSavedAddress(savedAddress),
    };
  },

  async updateSavedAddress(
    userId: string,
    addressId: string,
    input: SavedAddressInput,
  ) {
    const address = await savedAddressRepository().findOne({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error("Saved address not found.");
    }

    const normalized = normalizeAddressInput(input);

    if (normalized.isDefault) {
      await ensureSingleDefaultAddress(userId, address.id);
    }

    Object.assign(address, normalized, {
      isDefault: normalized.isDefault,
    });

    const savedAddress = await savedAddressRepository().save(address);

    if (!savedAddress.isDefault) {
      await ensureFallbackDefaultAddress(userId);
    }

    const refreshedAddress = await savedAddressRepository().findOne({
      where: { id: savedAddress.id },
    });

    return {
      address: toSavedAddress(refreshedAddress ?? savedAddress),
    };
  },

  async deleteSavedAddress(userId: string, addressId: string) {
    const address = await savedAddressRepository().findOne({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error("Saved address not found.");
    }

    await savedAddressRepository().remove(address);
    await ensureFallbackDefaultAddress(userId);

    return {
      message: "Saved address deleted successfully.",
    };
  },
};
