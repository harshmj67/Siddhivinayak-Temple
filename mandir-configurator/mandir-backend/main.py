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


def safe_cone_at(x: float, y: float, z: float, r1: float, r2: float, height: float):
    return (
        cq.Workplane("XY")
        .cone(height, r1, r2)
        .translate((x, y, z - height / 2))
    )


def safe_plate_at(x: float, y: float, z: float, width: float, depth: float, height: float):
    return cq.Workplane("XY").box(width, depth, height).translate((x, y, z))


def build_temple(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    base = safe_box_at(
        x=x,
        y=y,
        z=z,
        sx=max(20, 200 * sx),
        sy=max(20, 120 * sy),
        sz=max(20, 200 * sz),
    )

    top = safe_box_at(
        x=x,
        y=y + max(8, 40 * sy),
        z=z,
        sx=max(14, 140 * sx),
        sy=max(10, 80 * sy),
        sz=max(14, 140 * sz),
    )

    return base.union(top)


def build_ganesha(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    body = safe_cylinder_at(
        x=x,
        y=y,
        z=z,
        radius=max(2, 40 * sx),
        height=max(8, 140 * sy),
    )

    head = safe_cylinder_at(
        x=x,
        y=y + max(5, 70 * sy),
        z=z,
        radius=max(1.5, 25 * sx),
        height=max(4, 50 * sy),
    )

    return body.union(head)


def build_bell(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    bell_body = safe_cone_at(
        x=x,
        y=y,
        z=z,
        r1=max(2, 35 * sx),
        r2=max(0.8, 10 * sx),
        height=max(6, 100 * sy),
    )

    hanger = safe_cylinder_at(
        x=x,
        y=y + max(4, 55 * sy),
        z=z,
        radius=max(0.5, 6 * sx),
        height=max(2, 20 * sy),
    )

    return bell_body.union(hanger)


def build_chhattar(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    dome = safe_cone_at(
        x=x,
        y=y,
        z=z,
        r1=max(3, 50 * sx),
        r2=max(0.5, 5 * sx),
        height=max(4, 50 * sy),
    )

    stem = safe_cylinder_at(
        x=x,
        y=y - max(2, 20 * sy),
        z=z,
        radius=max(0.6, 8 * sx),
        height=max(4, 40 * sy),
    )

    return dome.union(stem)


def build_kalash(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    pot = safe_cylinder_at(
        x=x,
        y=y,
        z=z,
        radius=max(1.5, 18 * sx),
        height=max(5, 55 * sy),
    )

    tip = safe_cone_at(
        x=x,
        y=y + max(3, 25 * sy),
        z=z,
        r1=max(1, 10 * sx),
        r2=0.1,
        height=max(3, 30 * sy),
    )

    return pot.union(tip)


def build_name_plate(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    plate = safe_plate_at(
        x=x,
        y=y,
        z=z,
        width=max(8, 120 * sx),
        depth=max(1.5, 12 * sy),
        height=max(3, 40 * sz),
    )

    stand_left = safe_box_at(
        x=x - max(3, 40 * sx),
        y=y - max(2, 15 * sy),
        z=z,
        sx=max(0.8, 8 * sx),
        sy=max(3, 30 * sy),
        sz=max(0.8, 8 * sz),
    )

    stand_right = safe_box_at(
        x=x + max(3, 40 * sx),
        y=y - max(2, 15 * sy),
        z=z,
        sx=max(0.8, 8 * sx),
        sy=max(3, 30 * sy),
        sz=max(0.8, 8 * sz),
    )

    return plate.union(stand_left).union(stand_right)


def build_default(x: float, y: float, z: float, sx: float, sy: float, sz: float):
    return safe_box_at(
        x=x,
        y=y,
        z=z,
        sx=max(3, 100 * sx),
        sy=max(3, 100 * sy),
        sz=max(3, 100 * sz),
    )


def build_scene(objects: List[SceneObject]):
    scene = None

    for obj in objects:
        x, y, z = obj.position
        sx, sy, sz = obj.scale
        url = obj.url.lower()

        if "temple" in url:
            shape = build_temple(x, y, z, sx, sy, sz)

        elif "ganesha" in url:
            shape = build_ganesha(x, y, z, sx, sy, sz)

        elif "bell" in url:
            shape = build_bell(x, y, z, sx, sy, sz)

        elif "chhattar" in url:
            shape = build_chhattar(x, y, z, sx, sy, sz)

        elif "kalash" in url:
            shape = build_kalash(x, y, z, sx, sy, sz)

        elif "mandir name" in url or "name_patti" in url or "mandir_name" in url:
            shape = build_name_plate(x, y, z, sx, sy, sz)

        else:
            shape = build_default(x, y, z, sx, sy, sz)

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