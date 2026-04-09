import React, { useEffect, useState } from "react";
import ModelViewer from "./ModelViewer";

function App() {
  const [objects, setObjects] = useState([
    {
      url: "/models/temple_clean.stl",
      position: [0, -0.7, 0],
      scale: [0.05, 0.05, 0.05],
      color: "orange",
      rotation: [-Math.PI / 2, 0, 0],
      spin: 0,
    },
  ]);

  const [draggingIndex, setDraggingIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [scaleValue, setScaleValue] = useState(0.05);
  const [heightValue, setHeightValue] = useState(-0.7);

  useEffect(() => {
    if (selectedIndex !== null && objects[selectedIndex]) {
      setScaleValue(objects[selectedIndex].scale[0]);
      setHeightValue(objects[selectedIndex].position[1]);
    }
  }, [selectedIndex, objects]);

  const clampToFloorArea = (point, currentIndex) => {
    const currentY = objects[currentIndex]?.position?.[1] ?? -0.7;
    const x = Math.max(-10, Math.min(10, point.x));
    const z = Math.max(-10, Math.min(10, point.z));
    return [x, currentY, z];
  };

  const isColliding = (newPos, currentIndex) => {
    return objects.some((obj, i) => {
      if (i === 0 || i === currentIndex) return false;

      const dx = obj.position[0] - newPos[0];
      const dz = obj.position[2] - newPos[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      return distance < 1;
    });
  };

  const addGanesha = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/ganesha.stl",
        position: [0, -0.7, 6],
        scale: [0.015, 0.015, 0.015],
        color: "pink",
        rotation: [-Math.PI / 2, 0, 0],
        spin: 0,
      },
    ]);
  };

  const addBell = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/bell.stl",
        position: [2, -0.7, 6],
        scale: [0.01, 0.01, 0.01],
        color: "gold",
        rotation: [0, 0, 0],
        spin: 0,
      },
    ]);
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);

    if (index !== 0) {
      setDraggingIndex(index);
    } else {
      setDraggingIndex(null);
    }
  };

  const handleDrag = (point) => {
    if (draggingIndex === null) return;

    const newPos = clampToFloorArea(point, draggingIndex);
    if (isColliding(newPos, draggingIndex)) return;

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === draggingIndex ? { ...obj, position: newPos } : obj
      )
    );
  };

  const stopDragging = () => {
    setDraggingIndex(null);
  };

  const rotateSelected = () => {
    if (selectedIndex === null) return;

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === selectedIndex
          ? {
              ...obj,
              spin: (obj.spin || 0) + Math.PI / 8,
            }
          : obj
      )
    );
  };

  const scaleSelected = (value) => {
    if (selectedIndex === null) return;

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === selectedIndex
          ? {
              ...obj,
              scale: [value, value, value],
            }
          : obj
      )
    );
  };

  const moveSelectedHeight = (value) => {
    if (selectedIndex === null) return;

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === selectedIndex
          ? {
              ...obj,
              position: [obj.position[0], value, obj.position[2]],
            }
          : obj
      )
    );
  };

  const deselect = () => {
    setSelectedIndex(null);
    setDraggingIndex(null);
  };

  const deleteSelected = () => {
    if (selectedIndex === null) return;

    if (selectedIndex === 0) {
      alert("Temple cannot be deleted");
      return;
    }

    setObjects((prev) => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
    setDraggingIndex(null);
  };

  const saveDesign = () => {
    localStorage.setItem("templeDesign", JSON.stringify(objects));
    alert("Design saved");
  };

  const loadDesign = () => {
    const data = localStorage.getItem("templeDesign");
    if (data) {
      const parsed = JSON.parse(data);
      setObjects(parsed);
      setSelectedIndex(null);
      setDraggingIndex(null);
    }
  };

  const exportSTL = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objects }),
      });

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "temple_design.stl";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Export failed. Make sure backend is running.");
    }
  };

  return (
    <div style={{ textAlign: "center" }} onPointerUp={stopDragging}>
      <h2>Temple Configurator</h2>

      <ModelViewer
        objects={objects}
        onDrag={handleDrag}
        onSelect={handleSelect}
        draggingIndex={draggingIndex}
        selectedIndex={selectedIndex}
      />

      <div
        style={{
          position: "fixed",
          right: "20px",
          top: "100px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: "240px",
        }}
      >
        <h3 style={{ margin: 0 }}>Controls</h3>

        <button onClick={addGanesha}>Add Ganesha</button>
        <button onClick={addBell}>Add Bell</button>

        <button onClick={rotateSelected} disabled={selectedIndex === null}>
          Rotate Selected
        </button>

        <button onClick={deleteSelected} disabled={selectedIndex === null}>
          Delete Selected
        </button>

        <button onClick={deselect} disabled={selectedIndex === null}>
          Deselect
        </button>

        {selectedIndex !== null && (
          <>
            <label style={{ textAlign: "left", fontWeight: "bold" }}>
              Scale: {scaleValue.toFixed(3)}
            </label>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.001"
              value={scaleValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setScaleValue(val);
                scaleSelected(val);
              }}
            />

            <label style={{ textAlign: "left", fontWeight: "bold" }}>
              Height (Y): {heightValue.toFixed(2)}
            </label>
            <input
              type="range"
              min="-8"
              max="5"
              step="0.1"
              value={heightValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setHeightValue(val);
                moveSelectedHeight(val);
              }}
            />
          </>
        )}

        <button onClick={saveDesign}>Save Design</button>
        <button onClick={loadDesign}>Load Design</button>
        <button onClick={exportSTL}>Export STL</button>
      </div>
    </div>
  );
}

export default App;