# The latitudes for most of the borders between Connecticut, Massachusetts, & New Hampshire
# Does not include the area north-east of Andover or south of Brockton
# which is fine for our purposes given we only need to cover the Boston metro area
MA_LAT_MIN, MA_LAT_MAX = 42.034333, 42.697039
# Min covers as far as Worcester & max reaches the south shore
MA_LON_MIN, MA_LON_MAX = -71.875193, -70.614723

def in_boston_metro(lat: float, lon: float) -> bool:
    return MA_LAT_MIN <= lat <= MA_LAT_MAX and MA_LON_MIN <= lon <= MA_LON_MAX