from base.normalizer import BaseNormalizer
from dtos import (
    Activity,
    NormalizedLocation,
    RawLocation,
)
from pipelines.openstreetmap.openstreetmap_common import (
    build_normalized_location,
)
from pipelines.openstreetmap.repair_shop.querier import DATA_SOURCE


class RepairCafeNormalizer(BaseNormalizer):

    def normalize(self, raw_locations: list[RawLocation]) -> list[NormalizedLocation]:
        normalized_locations = []
        for raw in raw_locations:
            location = build_normalized_location(raw, DATA_SOURCE, self._get_activity)
            if location is not None:
                normalized_locations.append(location)
        return normalized_locations

    @staticmethod
    def _get_activity(tags: dict) -> list[Activity]:
        # Repair cafes are community-run free repair events, typically tagged
        # amenity=social_facility or community_centre with repair=*. Commercial
        # repair shops just carry shop=* + repair=yes.
        if tags.get("fee") == "no" or tags.get("amenity") in ("social_facility", "community_centre"):
            return [Activity.REPAIR_FREE]
        return Activity.REPAIR_PAID
