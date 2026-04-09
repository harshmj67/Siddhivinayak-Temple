from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import cadquery as cq
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SceneObject(BaseModel):
    url: str
    position: List[float]
    scale: List[float]
    color: str
    rotation: List[float]
    spin: float = 0


class ExportRequest(BaseModel):
    objects: List[SceneObject]


OUTPUT_DIR = "output"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "temple_design.stl")


def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def safe_box_at(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    return cq.Workplane("XY").box(sx, sy, sz).translate((x, y, z))


def safe_cylinder_at(x: float, y: float, z: float, radius: float, height: float):
    return (
        cq.Workplane("XY")
        .circle(radius)
        .extrude(height)
        .translate((x, y, z - height / 2))
    )


def build_scene(objects: List[SceneObject]):
    scene = None

    for obj in objects:
        x, y, z = obj.position
        sx, sy, sz = obj.scale

        if "temple" in obj.url.lower():
            shape = safe_box_at(
                x=x,
                y=y,
                z=z,
                sx=max(20, 200 * sx),
                sy=max(20, 120 * sy),
                sz=max(20, 200 * sz),
            )
        elif "ganesha" in obj.url.lower():
            shape = safe_box_at(
                x=x,
                y=y,
                z=z,
                sx=max(4, 120 * sx),
                sy=max(6, 160 * sy),
                sz=max(4, 120 * sz),
            )
        elif "bell" in obj.url.lower():
            shape = safe_cylinder_at(
                x=x,
                y=y,
                z=z,
                radius=max(1.5, 60 * sx),
                height=max(4, 120 * sy),
            )
        else:
            shape = safe_box_at(
                x=x,
                y=y,
                z=z,
                sx=max(3, 100 * sx),
                sy=max(3, 100 * sy),
                sz=max(3, 100 * sz),
            )

        scene = shape if scene is None else scene.union(shape)

    return scene


@app.get("/")
def home():
    return {"message": "Temple configurator backend is running"}


@app.post("/export")
def export_model(data: ExportRequest):
    ensure_output_dir()

    if not data.objects:
        raise HTTPException(status_code=400, detail="No objects received for export")

    try:
        print("Received objects:", data.objects)

        model = build_scene(data.objects)

        if model is None:
            raise HTTPException(status_code=400, detail="Failed to build scene")

        cq.exporters.export(model.val(), OUTPUT_FILE)

        print("Export successful:", OUTPUT_FILE)

        return FileResponse(
            path=OUTPUT_FILE,
            media_type="application/sla",
            filename="temple_design.stl"
        )

    except HTTPException:
        raise
    except Exception as e:
        print("EXPORT ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Export failed: {repr(e)}")