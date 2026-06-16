from base.querier import BaseQuerier
from dtos import RawLocation
from pipelines.openstreetmap.openstreetmap_common import (
    GREATER_BOSTON_BBOX,
    fetch_overpass,
)


DATA_SOURCE = "openstreetmap_repair"

OVERPASS_QUERY = f"""
[out:json][timeout:25];
nwr["repair"]({GREATER_BOSTON_BBOX});
out center;
"""


class RepairCafeQuerier(BaseQuerier):

    def fetch(self) -> list[RawLocation]:
        return fetch_overpass(OVERPASS_QUERY, DATA_SOURCE)
