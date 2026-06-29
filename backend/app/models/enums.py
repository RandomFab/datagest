from enum import StrEnum


class AllergenName(StrEnum):
    GLUTEN = "Gluten"
    CRUSTACEANS = "Crustaceans"
    EGGS = "Eggs"
    FISH = "Fish"
    PEANUTS = "Peanuts"
    SOY = "Soy"
    MILK = "Milk"
    NUTS = "Nuts"
    CELERY = "Celery"
    MUSTARD = "Mustard"
    SESAME = "Sesame"
    SULFITES = "Sulfites"
    LUPIN = "Lupin"
    MOLLUSCS = "Molluscs"


class FoodCategory(StrEnum):
    PLANT = "Plant"
    MEAT = "Meat"
    DAIRY = "Dairy"
    FISH = "Fish"
    DRINK = "Drink"
    MEAL = "Meal"


class EntryType(StrEnum):
    FOOD = "food"
    DRINK = "drink"


class Preparation(StrEnum):
    RAW = "raw"
    COOKED = "cooked"


class Quantity(StrEnum):
    SMALL = "small"
    NORMAL = "normal"
    LARGE = "large"


class StoolQuality(StrEnum):
    IDEAL = "ideal"
    NORMAL = "normal"
    CONCERNING = "concerning"
