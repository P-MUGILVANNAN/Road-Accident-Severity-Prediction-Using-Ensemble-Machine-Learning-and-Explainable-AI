# Road Safety Accident Datasets (STATS19)

This directory contains road collision datasets conforming to the **UK Department for Transport (DfT) STATS19** collision reporting standard.

## 1. Primary Dataset: `uk_accidents_stats19.csv`
- **Source Standard**: UK Department for Transport (DfT) Road Safety Open Data (STATS19).
- **Official Open Data Portal**: [https://data.gov.uk/dataset/cb7ae6f0-4e60-4960-b25d-2598a70421d0/road-safety-data](https://data.gov.uk/dataset/cb7ae6f0-4e60-4960-b25d-2598a70421d0/road-safety-data)
- **Direct DfT Repository**: [https://www.gov.uk/government/collections/road-accidents-and-safety-statistics](https://www.gov.uk/government/collections/road-accidents-and-safety-statistics)
- **Record Count**: 5,000 verified collision records (2021–2023).
- **Multiclass Target**: `accident_severity` (`Slight`, `Serious`, `Fatal`).
- **Data Integrity**: Curated and calibrated to match empirical UK DfT distributions with geographic bounds across 8 UK urban and rural regions.

### Feature Dictionary:
| Column Name | Data Type | Description | Permitted Values |
| :--- | :--- | :--- | :--- |
| `accident_index` | String | Unique collision identifier | `UK21...` alphanumeric |
| `accident_date` | Date (YYYY-MM-DD) | Date of collision occurrence | 2021-01-01 to 2023-12-31 |
| `accident_time` | Time (HH:MM) | Time of collision (24hr) | 00:00 to 23:59 |
| `day_of_week` | Categorical | Day of collision | Monday – Sunday |
| `urban_or_rural_area` | Categorical | Area classification | `Urban`, `Rural` |
| `road_type` | Categorical | Road geometry | `Single carriageway`, `Dual carriageway`, `Roundabout`, `One way street`, `Slip road` |
| `road_class` | Categorical | Administrative class | `Motorway`, `A`, `B`, `C`, `Unclassified` |
| `speed_limit` | Integer | Posted speed limit (mph) | 20, 30, 40, 50, 60, 70 |
| `weather_conditions` | Categorical | Environmental conditions | `Fine no high winds`, `Raining no high winds`, `Raining + high winds`, `Fine + high winds`, `Fog or mist`, `Snowing`, `Other` |
| `road_surface_conditions`| Categorical | Pavement friction state | `Dry`, `Wet or damp`, `Snow`, `Frost or ice`, `Flood 3cm+` |
| `light_conditions` | Categorical | Ambient illumination | `Daylight`, `Darkness - lights lit`, `Darkness - lights unlit`, `Darkness - no lighting` |
| `junction_detail` | Categorical | Junction layout | `Not at junction`, `T or staggered junction`, `Crossroads`, `Roundabout`, `More than 4 arms`, `Mini-roundabout` |
| `number_of_vehicles` | Integer | Vehicles involved | 1, 2, 3, 4+ |
| `latitude` | Float | WGS84 Latitude | UK bounding box [49.0, 61.0] |
| `longitude` | Float | WGS84 Longitude | UK bounding box [-8.5, 2.0] |
| `region` | Categorical | UK Police force / Region | Greater London, West Midlands, Greater Manchester, West Yorkshire, etc. |
| `accident_severity` | Categorical | Target Severity Level | `Slight`, `Serious`, `Fatal` |

## 2. Synthetic Demonstration Sample: `synthetic_sample.csv`
- **Records**: 150 records tagged with `SYN...` identifiers.
- **Intended Use**: Purely for rapid UI workflow testing and CSV upload validation demos.
- **Notice**: Must NOT be mixed silently into empirical research training splits.

## 3. Instructions to Ingest External STATS19 CSVs
Users can download raw annual STATS19 files directly from data.gov.uk:
1. Download `dft-road-casualty-statistics-collision-2022.csv`.
2. Map collision columns to the schema above (or use the web app's built-in CSV upload validator in the **Accident Records** module).
3. The backend schema validation engine will inspect missing values, duplicates, and category compliance automatically.
