import { Router } from "express";
import { z } from "zod";
import { serviceCatalogService } from "../services/serviceCatalogService";
import { asyncHandler } from "../utils/http";

const router = Router();

const quoteSchema = z.object({
  serviceOptions: z.record(z.string(), z.unknown()).default({}),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const services = await serviceCatalogService.listServices({
      activeOnly: true,
      categoryId,
    });
    res.json({ services });
  }),
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await serviceCatalogService.listCategories({ activeOnly: true });
    res.json({ categories });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const service = await serviceCatalogService.getServiceBySlug(
      String(req.params.slug),
      { activeOnly: true },
    );
    res.json({ service });
  }),
);

router.post(
  "/:slug/quote",
  asyncHandler(async (req, res) => {
    const input = quoteSchema.parse(req.body);
    const service = await serviceCatalogService.getServiceBySlug(
      String(req.params.slug),
      { activeOnly: true },
    );
    const pricing = serviceCatalogService.calculatePricing(
      service,
      input.serviceOptions,
    );

    res.json({
      serviceId: service.id,
      serviceSlug: service.slug,
      pricing,
    });
  }),
);

export default router;
