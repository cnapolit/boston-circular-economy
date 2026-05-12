import pyap

from base.normalizer import BaseNormalizer
from dtos import (
    RawLocation,
    NormalizedLocation,
    Address,
    Contact,
    Service,
    Activity,
    ItemCategory,
    Availability,
)
from pipelines.repair_cafe.common import parse_coordinates

def _parse_address(raw_address: str | None) -> Address:
    if not raw_address:
        return Address()
    parsed = pyap.parse(raw_address, country="US")
    if not parsed:
        return Address(street=raw_address)
    addr = parsed[0].as_dict()
    return Address(
        street=addr.get("full_street"),
        city=addr.get("city"),
        state=addr.get("region1"),
        postcode=addr.get("postal_code"),
    )


class RepairCafeNormalizer(BaseNormalizer):

    def normalize(self, raw_locations: list[RawLocation]) -> list[NormalizedLocation]:
        normalized_locations = []
        for raw in raw_locations:
            payload = raw.payload
            lat, lon = parse_coordinates(payload["coordinate"])

            services = [Service(activity=Activity.REPAIR_FREE)]

            website = payload.get("external_link") or payload.get("link", "")

            normalized_locations.append(NormalizedLocation(
                data_source_id=raw.data_source_id,
                data_source="repair_cafe",
                name=payload["name"],
                lat=lat,
                lon=lon,
                address=_parse_address(payload.get("address")),
                contact=Contact(
                    email=payload.get("email"),
                    website=website,
                ),
                services=services,
                availability=Availability(is_persistent=False),
                last_verified=payload.get("last_updated"),
            ))
        return normalized_locations
