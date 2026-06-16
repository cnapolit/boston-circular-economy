from pipelines.openstreetmap.repair_shop.querier import RepairCafeQuerier
from pipelines.openstreetmap.repair_shop.normalizer import RepairCafeNormalizer

querier = RepairCafeQuerier()
normalizer = RepairCafeNormalizer()

locations = querier.fetch()
normalized_locations = normalizer.normalize(locations)