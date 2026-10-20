import json
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from etl.base.querier import BaseQuerier
from etl.dtos import RawLocation

class Query:
    target: str
    args: dict[str, str]

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

class OpenStreetMapQuerier(BaseQuerier):

    def GetQueries(self) -> list[Query]:
        return []

    def fetch(self, query: Query) -> list[RawLocation]:
        body = urlencode({"data": query}).encode("utf-8")
        request = Request(
            OVERPASS_URL,
            data=body,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "boston-circular-economy-etl/0.1",
            },
        )
        with urlopen(request, timeout=60) as response:
            data = json.load(response)

        fetched_at = datetime.now(timezone.utc)
        raw_locations = []
        for element in data.get("elements", []):
            raw_locations.append(RawLocation(
                data_source="open_street_maps",
                data_source_id=f"osm-{element['type']}-{element['id']}",
                fetched_at=fetched_at,
                payload=element,
            ))
        return raw_locations
