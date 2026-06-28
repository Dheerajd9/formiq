# French class schedule - all times are EST, converted to CST (EST - 1 hour)
# Videos: V1-V5, V6-V10, V11-V14

# Map day names to weekday numbers (Monday=0, Sunday=6)
DAY_MAP = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

# CST times = EST - 1 hour
# Morning: 8:30→7:30, 9:30→8:30, 10:30→9:30, 11:30→10:30 (all AM)
# Evening: 8:30→7:30, 9:30→8:30, 10:30→9:30, 11:30→10:30 (all PM)

MORNING_SCHEDULE = [
    # (day, hour_cst, minute_cst, videos)
    ("monday",    7, 30, "V1 to V5"),
    ("monday",    8, 30, "V1 to V5"),
    ("monday",    9, 30, "V11 to V14"),
    ("monday",   10, 30, "V11 to V14"),

    ("tuesday",   7, 30, "V1 to V5"),
    ("tuesday",   8, 30, "V1 to V5"),
    ("tuesday",   9, 30, "V11 to V14"),
    ("tuesday",  10, 30, "V11 to V14"),

    ("wednesday", 7, 30, "V6 to V10"),
    ("wednesday", 8, 30, "V6 to V10"),
    ("wednesday", 9, 30, "V1 to V5"),
    ("wednesday",10, 30, "V1 to V5"),

    ("thursday",  7, 30, "V6 to V10"),
    ("thursday",  8, 30, "V6 to V10"),
    ("thursday",  9, 30, "V1 to V5"),
    ("thursday", 10, 30, "V1 to V5"),

    ("friday",    7, 30, "V11 to V14"),
    ("friday",    8, 30, "V11 to V14"),
    ("friday",    9, 30, "V6 to V10"),
    ("friday",   10, 30, "V6 to V10"),

    ("saturday",  7, 30, "V11 to V14"),
    ("saturday",  8, 30, "V11 to V14"),
    ("saturday",  9, 30, "V6 to V10"),
    ("saturday", 10, 30, "V6 to V10"),
]

EVENING_SCHEDULE = [
    # (day, hour_cst, minute_cst, videos)
    ("sunday",   19, 30, "V1 to V5"),
    ("sunday",   20, 30, "V1 to V5"),
    ("sunday",   21, 30, "V11 to V14"),
    ("sunday",   22, 30, "V11 to V14"),

    ("monday",   19, 30, "V1 to V5"),
    ("monday",   20, 30, "V1 to V5"),
    ("monday",   21, 30, "V11 to V14"),
    ("monday",   22, 30, "V11 to V14"),

    ("tuesday",  19, 30, "V6 to V10"),
    ("tuesday",  20, 30, "V6 to V10"),
    ("tuesday",  21, 30, "V1 to V5"),
    ("tuesday",  22, 30, "V1 to V5"),

    ("wednesday",19, 30, "V6 to V10"),
    ("wednesday",20, 30, "V6 to V10"),
    ("wednesday",21, 30, "V1 to V5"),
    ("wednesday",22, 30, "V1 to V5"),

    ("thursday", 19, 30, "V11 to V14"),
    ("thursday", 20, 30, "V11 to V14"),
    ("thursday", 21, 30, "V6 to V10"),
    ("thursday", 22, 30, "V6 to V10"),

    ("friday",   19, 30, "V11 to V14"),
    ("friday",   20, 30, "V11 to V14"),
    ("friday",   21, 30, "V6 to V10"),
    ("friday",   22, 30, "V6 to V10"),
]

ALL_SESSIONS = MORNING_SCHEDULE + EVENING_SCHEDULE
