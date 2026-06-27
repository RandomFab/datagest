from enum import Enum


class AllergenName(str, Enum):
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


class FoodCategory(str, Enum):
    PLANT = "Plant"
    MEAT = "Meat"
    DAIRY = "Dairy"
    FISH = "Fish"
    DRINK = "Drink"
    MEAL = "Meal"


class EntryType(str, Enum):
    FOOD = "food"
    DRINK = "drink"


class Preparation(str, Enum):
    RAW = "raw"
    COOKED = "cooked"


class Quantity(str, Enum):
    SMALL = "small"
    NORMAL = "normal"
    LARGE = "large"


class StoolQuality(str, Enum):
    IDEAL = "ideal"
    NORMAL = "normal"
    CONCERNING = "concerning"
