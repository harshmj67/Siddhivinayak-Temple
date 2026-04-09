from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import cadquery as cq
import os

app = FastAPI()


# ---------- Request Models ----------

class SceneObject(BaseModel):
    url: str
    position: List[float]
    scale: List[float]
    color: str
    rotation: List[float]


class ExportRequest(BaseModel):
    objects: List[SceneObject]


# ---------- Helpers ----------

OUTPUT_DIR = "output"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "temple_design.stl")


def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def safe_box_at(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    """
    Create a simple box placeholder centered at position.
    """
    return (
        cq.Workplane("XY")
        .box(sx, sy, sz)
        .translate((x, y, z))
    )


def safe_cylinder_at(x: float, y: float, z: float, radius: float, height: float):
    """
    Create a simple cylinder placeholder centered at position.
    """
    return (
        cq.Workplane("XY")
        .circle(radius)
        .extrude(height)
        .translate((x, y, z - height / 2))
    )


def build_scene(objects: List[SceneObject]):
    """
    Build a simplified export scene using parametric placeholder geometry.
    Temple -> large base block
    Ganesha -> smaller decorative box
    Bell -> small cylinder
    """
    scene = None

    for obj in objects:
        x, y, z = obj.position
        sx, sy, sz = obj.scale

        # Convert tiny frontend scales into useful backend dimensions
        # You can tune these multipliers later.
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
            # Generic fallback
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


# ---------- Routes ----------

@app.get("/")
def home():
    return {"message": "Temple configurator backend is running"}


@app.post("/export")
def export_model(data: ExportRequest):
    ensure_output_dir()

    if not data.objects:
        raise HTTPException(status_code=400, detail="No objects received for export")

    try:
        model = build_scene(data.objects)

        if model is None:
            raise HTTPException(status_code=400, detail="Failed to build scene")

        cq.exporters.export(model, OUTPUT_FILE)

        return FileResponse(
            OUTPUT_FILE,
            media_type="application/sla",
            filename="temple_design.stl"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")