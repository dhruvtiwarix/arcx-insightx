import io

import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from profiler import profile_dataframe   # ← add this import

app = FastAPI(title="ARCX InsightX API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ARCX InsightX API"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()

    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(contents))
    else:
        return {"error": "Only CSV and XLSX files are supported"}

    # Parse dates automatically — important for datetime column detection
    df = df.infer_objects()
    for col in df.select_dtypes(include="object").columns:
        try:
            df[col] = pd.to_datetime(df[col])
        except (ValueError, TypeError):
            pass  # not a date column, leave as string

    return {
        "filename": file.filename,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "rows": df.head(100).to_dict(orient="records"),
        "stats": profile_dataframe(df),   # ← new
    }