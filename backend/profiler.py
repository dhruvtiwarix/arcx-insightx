import duckdb
import pandas as pd


def profile_dataframe(df: pd.DataFrame) -> list[dict]:
    """
    Compute per-column statistics using DuckDB.
    DuckDB is used here instead of pandas.describe() because:
    - It handles all column types cleanly in one query
    - It's 10-50x faster on larger files
    - It's the industry tool for analytical queries
    """
    conn = duckdb.connect()
    conn.register("df", df)

    profiles = []

    for col in df.columns:
        dtype = str(df[col].dtype)
        total_rows = len(df)

        # --- Numeric columns ---
        if dtype in ("int64", "float64", "int32", "float32"):
            result = conn.execute(f"""
                SELECT
                    COUNT("{col}")                                    AS non_null,
                    ROUND(AVG("{col}"), 4)                           AS mean,
                    ROUND(STDDEV("{col}"), 4)                        AS std,
                    MIN("{col}")                                      AS min,
                    MAX("{col}")                                      AS max,
                    PERCENTILE_CONT(0.50) WITHIN GROUP
                        (ORDER BY "{col}")                           AS median,
                    PERCENTILE_CONT(0.25) WITHIN GROUP
                        (ORDER BY "{col}")                           AS p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP
                        (ORDER BY "{col}")                           AS p75
                FROM df
            """).fetchone()

            non_null = result[0]
            null_count = total_rows - non_null
            null_pct = round((null_count / total_rows) * 100, 1)

            profiles.append({
                "name": col,
                "type": "numeric",
                "dtype": dtype,
                "total": total_rows,
                "non_null": non_null,
                "null_count": null_count,
                "null_pct": null_pct,
                "mean": result[1],
                "std": result[2],
                "min": result[3],
                "max": result[4],
                "median": result[5],
                "p25": result[6],
                "p75": result[7],
            })

        # --- Date/datetime columns ---
        elif "datetime" in dtype:
            result = conn.execute(f"""
                SELECT
                    COUNT("{col}")   AS non_null,
                    MIN("{col}")     AS min_date,
                    MAX("{col}")     AS max_date
                FROM df
            """).fetchone()

            non_null = result[0]
            null_count = total_rows - non_null
            null_pct = round((null_count / total_rows) * 100, 1)

            profiles.append({
                "name": col,
                "type": "datetime",
                "dtype": dtype,
                "total": total_rows,
                "non_null": non_null,
                "null_count": null_count,
                "null_pct": null_pct,
                "min_date": str(result[1]),
                "max_date": str(result[2]),
            })

        # --- String/categorical columns ---
        else:
            result = conn.execute(f"""
                SELECT
                    COUNT("{col}")                   AS non_null,
                    COUNT(DISTINCT "{col}")          AS distinct_count,
                    MODE("{col}")                    AS most_common
                FROM df
            """).fetchone()

            non_null = result[0]
            null_count = total_rows - non_null
            null_pct = round((null_count / total_rows) * 100, 1)

            # Compute most common value frequency separately
            top_result = conn.execute(f"""
                SELECT "{col}", COUNT(*) AS cnt
                FROM df
                WHERE "{col}" IS NOT NULL
                GROUP BY "{col}"
                ORDER BY cnt DESC
                LIMIT 1
            """).fetchone()

            top_value = top_result[0] if top_result else None
            top_pct = round((top_result[1] / total_rows) * 100, 1) if top_result else 0

            profiles.append({
                "name": col,
                "type": "categorical",
                "dtype": dtype,
                "total": total_rows,
                "non_null": non_null,
                "null_count": null_count,
                "null_pct": null_pct,
                "distinct_count": result[1],
                "most_common": top_value,
                "most_common_pct": top_pct,
            })

    conn.close()
    return profiles