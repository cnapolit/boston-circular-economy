from etl.base.normalizer import BaseNormalizer

from etl.dtos import (
    Activity,
    Address,
    Availability,
    Contact,
    ItemCategory,
    NormalizedLocation,
    RawLocation,
    Service,
)

GREATER_BOSTON_BBOX = "42.2,-71.2,42.5,-70.9"

# OSM shop= values mapped to the ItemCategory of the goods sold/serviced.
SHOP_TO_CATEGORY: dict[str, ItemCategory] = {
    "tailor": ItemCategory.CLOTHING,
    "clothes": ItemCategory.CLOTHING,
    "shoes": ItemCategory.SHOES,
    "computer": ItemCategory.ELECTRONICS,
    "electronics": ItemCategory.ELECTRONICS,
    "mobile_phone": ItemCategory.ELECTRONICS,
    "furniture": ItemCategory.FURNITURE,
    "books": ItemCategory.BOOKS,
    "tool_hire": ItemCategory.TOOLS,
    "hardware": ItemCategory.TOOLS,
}

class OpenStreetMapNormalizer(BaseNormalizer):

    def normalize(self, raw_locations: list[RawLocation]) -> list[NormalizedLocation]:
        normalized_locations = []
        for raw in raw_locations:
            location = self.build_normalized_location(raw)
            if location is not None:
                normalized_locations.append(location)
        return normalized_locations
    
    def build_normalized_location(
        self,
        raw: RawLocation,
        data_source: str,
    ) -> NormalizedLocation | None:
        """Validate an Overpass element and assemble a NormalizedLocation.

        Returns None if the element lacks a name, coordinates, or services.
        """
        element = raw.payload
        tags = element.get("tags", {})

        name = tags.get("name")
        lat, lon = self.get_coordinates(element)
        categories = self.infer_item_categories(tags)
        if not name or lat is None or lon is None or not categories:
            return None

        activities = self._get_activities(tags)
        services = [
            Service(activity=activity, item_category=category)
            for activity in activities
            for category in categories
        ]
        
        craft = tags.get("craft")


        if tags.get("craft") == "electronics_repair" or tags.get("electronics_repair"):
            services.append(Service(activity=Activity.REPAIR_PAID, item_category=ItemCategory.ELECTRONICS))

        return NormalizedLocation(
            data_source_id=raw.data_source_id,
            data_source=data_source,
            name=name,
            lat=lat,
            lon=lon,
            address=self.build_address(tags),
            contact=self.build_contact(tags),
            services=services,
            availability=self.build_availability(tags),
            last_verified=tags.get("check_date"),
        )
    
    def get_coordinates(element: dict) -> tuple[float | None, float | None]:
        target = element if element["type"] == "node" else element.get("center", {})
        return target.get("lat"), target.get("lon")


    def build_address(tags: dict) -> Address:
        houseNumber = tags.get("addr:housenumber")
        street_name = tags.get("addr:street")
        if houseNumber and street_name:
            street = f"{houseNumber} {street_name}"
        else:
            street = street_name or houseNumber
        return Address(
            street=street,
            city=tags.get("addr:city"),
            state=tags.get("addr:state"),
            postcode=tags.get("addr:postcode"),
        )


    def build_contact(tags: dict) -> Contact:
        return Contact(
            phone=tags.get("phone") or tags.get("contact:phone"),
            email=tags.get("email") or tags.get("contact:email"),
            website=tags.get("website") or tags.get("contact:website"),
        )


    def build_availability(tags: dict) -> Availability:
        return Availability(opening_hours=tags.get("opening_hours"))

    # TODO: needs heavy refining
    def infer_item_categories(tags: dict) -> list[ItemCategory]:
        """Infer item categories from shop type and free-text fields."""
        categories: set[ItemCategory] = set()

        #investigate
        shop = tags.get("shop")
        category = SHOP_TO_CATEGORY.get(shop)
        if category:
            categories.add(category)

        text = " ".join([
            tags.get("name", ""),
            tags.get("description", ""),
        ]).lower()

        keyword_map = {
            ItemCategory.CLOTHING: ["clothing", "clothes", "apparel", "tailor"],
            ItemCategory.ELECTRONICS: ["electronics", "computer", "phone", "printer"],
            ItemCategory.FURNITURE: ["furniture"],
            ItemCategory.SHOES: ["shoe", "cobbler"],
            ItemCategory.BOOKS: ["book"],
            ItemCategory.TOOLS: ["tool"],
        }
        for category, keywords in keyword_map.items():
            if any(kw in text for kw in keywords):
                categories.add(category)

        return sorted(categories, key=lambda c: c.value)

    @staticmethod
    def _get_activities(tags: dict) -> list[Activity]:
        # Charity shops both accept donations and resell them.
        activities = [Activity.DONATION_DROP]
        if tags.get("shop") == "charity" or tags.get("second_hand") in ("yes", "only"):
            activities.append(Activity.RESALE_BUY)

        return activities
