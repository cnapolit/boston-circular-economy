def parse_coordinates(coordinate: str) -> tuple[float, float]:
    lat_str, lon_str = coordinate.split(",")
    return float(lat_str.strip()), float(lon_str.strip())