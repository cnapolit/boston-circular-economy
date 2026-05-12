from datetime import datetime, timezone

import requests

from base.querier import BaseQuerier
from dtos import RawLocation
from pipelines.repair_cafe.common import parse_coordinates
from common import in_boston_metro


API_URL = "https://www.repaircafe.org/wp-json/v1/map"


def _cafe_in_metro(coordinates: str) -> bool:
    try:
        lat, lon = parse_coordinates(coordinates)
    except (ValueError, AttributeError):
        return False
    return in_boston_metro(lat, lon)


class RepairCafeQuerier(BaseQuerier):

    def fetch(self) -> list[RawLocation]:
        response = requests.get(API_URL, timeout=30)
        response.raise_for_status()
        cafes = response.json()

        fetched_at = datetime.now(timezone.utc)
        raw_locations = []
        for cafe in cafes:
            if not _cafe_in_metro(cafe.get("coordinate", "")):
                continue
            raw_locations.append(RawLocation(
                data_source="repair_cafe",
                data_source_id=cafe["link"],
                fetched_at=fetched_at,
                payload=cafe,
            ))
        return raw_locations
