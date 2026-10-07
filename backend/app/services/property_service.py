import math
from typing import List, Dict, Any

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return round(R * c, 2)

UZBEKISTAN_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "Toshkent shahri": {
        "lat": 41.2995,
        "lon": 69.2401,
        "districts": [
            "Chilonzor tumani", "Yunusobod tumani", "Mirzo Ulug'bek tumani",
            "Yakkasaroy tumani", "Shayxontohur tumani", "Olmazor tumani",
            "Mirobod tumani", "Sergeli tumani", "Uchtepa tumani",
            "Bektemir tumani", "Yangihayot tumani", "Yashnobod tumani"
        ]
    },
    "Toshkent viloyati": {
        "lat": 41.2000,
        "lon": 69.4000,
        "districts": [
            "Chirchiq shahri", "Olmaliq shahri", "Angren shahri", "Bekobod shahri",
            "Yangiyo'l shahri", "Bo'stonliq tumani", "Zangiota tumani", "Qibray tumani",
            "Parkent tumani", "Yuqorichirchiq tumani", "O'rtachirchiq tumani", "Chinoz tumani"
        ]
    },
    "Samarqand viloyati": {
        "lat": 39.6542,
        "lon": 66.9597,
        "districts": [
            "Samarqand shahri", "Urgut tumani", "Kattaqo'rg'on shahri", "Payariq tumani",
            "Pastdarg'om tumani", "Bulung'ur tumani", "Toyloq tumani", "Jomboy tumani"
        ]
    },
    "Buxoro viloyati": {
        "lat": 39.7747,
        "lon": 64.4286,
        "districts": [
            "Buxoro shahri", "Kogon shahri", "G'ijduvon tumani", "Romitan tumani",
            "Jondor tumani", "Shofirkon tumani", "Vobkent tumani", "Qorako'l tumani"
        ]
    },
    "Andijon viloyati": {
        "lat": 40.7821,
        "lon": 72.3442,
        "districts": [
            "Andijon shahri", "Asaka tumani", "Shahrixon tumani", "Xo'jaobod tumani",
            "Qo'rg'ontepa tumani", "Baliqchi tumani", "Oltinko'l tumani", "Izboskan tumani"
        ]
    },
    "Farg'ona viloyati": {
        "lat": 40.3842,
        "lon": 71.7843,
        "districts": [
            "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Quvasoy shahri",
            "Rishton tumani", "Oltiariq tumani", "Beshariq tumani", "Quva tumani"
        ]
    },
    "Namangan viloyati": {
        "lat": 40.9983,
        "lon": 71.6726,
        "districts": [
            "Namangan shahri", "Chortoq tumani", "Chust tumani", "Pop tumani",
            "Kosonsoy tumani", "To'raqo'rg'on tumani", "Uychi tumani"
        ]
    },
    "Qashqadaryo viloyati": {
        "lat": 38.8606,
        "lon": 65.7891,
        "districts": [
            "Qarshi shahri", "Shahrisabz shahri", "Kitob tumani", "Yakkabog' tumani",
            "Koson tumani", "G'uzor tumani", "Chiroqchi tumani", "Qamashi tumani"
        ]
    },
    "Surxondaryo viloyati": {
        "lat": 37.2242,
        "lon": 67.2783,
        "districts": [
            "Termiz shahri", "Denov tumani", "Sho'rchi tumani", "Jarqo'rg'on tumani",
            "Boysun tumani", "Sariosiyo tumani", "Sherobod tumani"
        ]
    },
    "Xorazm viloyati": {
        "lat": 41.5564,
        "lon": 60.6310,
        "districts": [
            "Urganch shahri", "Xiva shahri", "Shovot tumani", "Gurlan tumani",
            "Xonqa tumani", "Qo'shko'pir tumani", "Hazorasp tumani"
        ]
    },
    "Navoiy viloyati": {
        "lat": 40.1039,
        "lon": 65.3688,
        "districts": [
            "Navoiy shahri", "Zarafshon shahri", "Karmana tumani", "Qiziltepa tumani",
            "Xatirchi tumani", "Nurota tumani", "Uchquduq tumani"
        ]
    },
    "Jizzax viloyati": {
        "lat": 40.1250,
        "lon": 67.8808,
        "districts": [
            "Jizzax shahri", "Zomin tumani", "Zarbdor tumani", "Do'stlik tumani",
            "Baxmal tumani", "G'allaorol tumani", "Paxtakor tumani"
        ]
    },
    "Sirdaryo viloyati": {
        "lat": 40.4983,
        "lon": 68.7842,
        "districts": [
            "Guliston shahri", "Shirin shahri", "Yangiyer shahri", "Boyovut tumani",
            "Sardoba tumani", "Mirzaobod tumani", "Xovos tumani"
        ]
    },
    "Qoraqalpog'iston Respublikasi": {
        "lat": 42.4602,
        "lon": 59.6166,
        "districts": [
            "Nukus shahri", "Xo'jayli tumani", "Qo'ng'irot tumani", "To'rtko'l tumani",
            "Beruniy tumani", "Chimboy tumani", "Amudaryo tumani", "Mo'ynoq tumani"
        ]
    }
}
