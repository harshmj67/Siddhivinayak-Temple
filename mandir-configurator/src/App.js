import React, { useEffect, useRef, useState } from "react";
import ModelViewer from "./ModelViewer";
import "./App.css";

function App() {
  const viewerRef = useRef(null);

  const [objects, setObjects] = useState([
    {
      url: "/models/Temple.stl",
      position: [0, -0.7, 0],
      scale: [0.05, 0.05, 0.05],
      color: "#f5f5f5",
      materialType: "marble",
      rotation: [0, 0, 0],
      spin: 0,
      objectType: "temple",
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

  const selectedObject = selectedIndex !== null ? objects[selectedIndex] : null;

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
        url: "/models/Ganesha.stl",
        position: [0, -0.7, 6],
        scale: [0.015, 0.015, 0.015],
        color: "#ffb6c1",
        materialType: "marble",
        rotation: [-Math.PI / 2, 0, 0],
        spin: 0,
        objectType: "ganesha",
      },
    ]);
  };

  const addBell01 = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Bell_01.stl",
        position: [2, -0.7, 6],
        scale: [0.01, 0.01, 0.01],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "bell",
      },
    ]);
  };

  const addBell02 = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Bell_02.stl",
        position: [-2, -0.7, 6],
        scale: [0.01, 0.01, 0.01],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "bell",
      },
    ]);
  };

  const addBell03 = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Bell_03.stl",
        position: [3, -0.7, 5],
        scale: [0.01, 0.01, 0.01],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "bell",
      },
    ]);
  };

  const addBell04 = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Bell_04.stl",
        position: [-3, -0.7, 5],
        scale: [0.01, 0.01, 0.01],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "bell",
      },
    ]);
  };

  const addChhattar = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Chhattar.stl",
        position: [0, 2.5, 0],
        scale: [0.02, 0.02, 0.02],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "chhattar",
      },
    ]);
  };

  const addKalash = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Kalash.stl",
        position: [0, 3.2, 0],
        scale: [0.015, 0.015, 0.015],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "kalash",
      },
    ]);
  };

  const addNamePatti = () => {
    setObjects((prev) => [
      ...prev,
      {
        url: "/models/Mandir_Name.stl",
        position: [0, -0.2, 5],
        scale: [0.02, 0.02, 0.02],
        color: "#D4AF37",
        materialType: "gold",
        rotation: [0, 0, 0],
        spin: 0,
        objectType: "namePatti",
      },
    ]);
  };

  const handleSelect = (index) => {
    if (index === null) {
      setSelectedIndex(null);
      setDraggingIndex(null);
      return;
    }

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
          ? { ...obj, spin: (obj.spin || 0) + Math.PI / 8 }
          : obj
      )
    );
  };

  const scaleSelected = (value) => {
    if (selectedIndex === null) return;

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === selectedIndex ? { ...obj, scale: [value, value, value] } : obj
      )
    );
  };

  const moveSelectedHeight = (value) => {
    if (selectedIndex === null) return;
    if (selectedObject?.objectType === "temple") return;

    const safeY = Math.max(-6, value);

    setObjects((prev) =>
      prev.map((obj, i) =>
        i === selectedIndex
          ? { ...obj, position: [obj.position[0], safeY, obj.position[2]] }
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

  const downloadImage = () => {
    viewerRef.current?.downloadScreenshot();
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
        let errorMessage = `Export failed with status ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
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
      alert(`Export failed: ${error.message}`);
    }
  };

  const selectedLabel = selectedObject
    ? selectedObject.objectType.charAt(0).toUpperCase() +
      selectedObject.objectType.slice(1)
    : "None";

  const renderObjectControls = () => {
    if (!selectedObject) return null;

    if (selectedObject.objectType === "temple") {
      return (
        <>
          <div className="mc-slider-group">
            <label className="mc-slider-label">
              <span>Temple Scale</span>
              <span className="mc-slider-value">{scaleValue.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.03"
              max="0.09"
              step="0.001"
              value={scaleValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setScaleValue(val);
                scaleSelected(val);
              }}
            />
          </div>

          <div className="mc-slider-group">
            <label className="mc-slider-label">
              <span>Temple Material</span>
            </label>
            <select
              value={selectedObject.materialType || "marble"}
              onChange={(e) => {
                const materialType = e.target.value;
                setObjects((prev) =>
                  prev.map((obj, i) =>
                    i === selectedIndex ? { ...obj, materialType } : obj
                  )
                );
              }}
            >
              <option value="marble">White Marble</option>
              <option value="wood">Wood</option>
              <option value="gold">Gold</option>
            </select>
          </div>
        </>
      );
    }

    if (
      ["ganesha", "bell", "namePatti", "chhattar", "kalash"].includes(
        selectedObject.objectType
      )
    ) {
      return (
        <>
          <div className="mc-slider-group">
            <label className="mc-slider-label">
              <span>{selectedLabel} Scale</span>
              <span className="mc-slider-value">{scaleValue.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.001"
              value={scaleValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setScaleValue(val);
                scaleSelected(val);
              }}
            />
          </div>

          <div className="mc-slider-group">
            <label className="mc-slider-label">
              <span>Height (Y)</span>
              <span className="mc-slider-value">{heightValue.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.1"
              value={heightValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setHeightValue(val);
                moveSelectedHeight(val);
              }}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="mc-root" onPointerUp={stopDragging}>
      <div className="mc-header">
        <div className="mc-header-left">
          <span className="mc-header-icon">🛕</span>
          <div>
            <div className="mc-header-title">Mandir Configurator</div>
            <div className="mc-header-sub">3D TEMPLE DESIGNER</div>
          </div>
        </div>

        <div className="mc-selected-badge">
          Selected: <span>{selectedLabel}</span>
        </div>
      </div>

      <ModelViewer
        ref={viewerRef}
        objects={objects}
        onDrag={handleDrag}
        onSelect={handleSelect}
        draggingIndex={draggingIndex}
        selectedIndex={selectedIndex}
      />

      <div className="mc-panel">
        <div className="mc-section">
          <div className="mc-section-title">ADD TO TEMPLE</div>

          <div className="mc-add-card" onClick={addGanesha}>
            <div className="mc-add-card-icon">🐘</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Ganesha</div>
              <div className="mc-add-card-hint">Tap to add, drag to place</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addBell01}>
            <div className="mc-add-card-icon">🔔</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Bell 01</div>
              <div className="mc-add-card-hint">Add Bell_01</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addBell02}>
            <div className="mc-add-card-icon">🔔</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Bell 02</div>
              <div className="mc-add-card-hint">Add bell_02</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addBell03}>
            <div className="mc-add-card-icon">🔔</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Bell 03</div>
              <div className="mc-add-card-hint">Add Bell_03</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addBell04}>
            <div className="mc-add-card-icon">🔔</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Bell 04</div>
              <div className="mc-add-card-hint">Add Bell_04</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addChhattar}>
            <div className="mc-add-card-icon">👑</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Chhattar</div>
              <div className="mc-add-card-hint">Add top decoration</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addKalash}>
            <div className="mc-add-card-icon">🏺</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Kalash</div>
              <div className="mc-add-card-hint">Add top Kalash</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>

          <div className="mc-add-card" onClick={addNamePatti}>
            <div className="mc-add-card-icon">🪧</div>
            <div className="mc-add-card-text">
              <div className="mc-add-card-name">Mandir Name</div>
              <div className="mc-add-card-hint">Add name plate</div>
            </div>
            <span className="mc-plus-icon">＋</span>
          </div>
        </div>

        <div className="mc-divider" />

        <div className="mc-section">
          <div className="mc-section-title">EDIT SELECTED</div>

          {!selectedObject && (
            <div className="mc-hint">Click any object to select it</div>
          )}

          {renderObjectControls()}

          <button
            className="mc-btn mc-btn-secondary"
            onClick={rotateSelected}
            disabled={selectedIndex === null}
          >
            <span className="mc-btn-icon">↻</span> Rotate 22.5°
          </button>

          <button className="mc-btn mc-btn-ghost" onClick={deselect}>
            Clear Selection
          </button>

          <button
            className="mc-btn mc-btn-danger"
            onClick={deleteSelected}
            disabled={selectedIndex === null}
          >
            <span className="mc-btn-icon">🗑</span> Delete
          </button>
        </div>

        <div className="mc-divider" />

        <div className="mc-section">
          <div className="mc-section-title">PROJECT</div>

          <button className="mc-btn mc-btn-success" onClick={saveDesign}>
            <span className="mc-btn-icon">💾</span> Save Design
          </button>

          <button className="mc-btn mc-btn-neutral" onClick={loadDesign}>
            <span className="mc-btn-icon">📂</span> Load Design
          </button>

          <button className="mc-btn mc-btn-neutral" onClick={downloadImage}>
            <span className="mc-btn-icon">🖼</span> Download Image
          </button>

          <button className="mc-btn mc-btn-export" onClick={exportSTL}>
            <span className="mc-btn-icon">📦</span> Export STL
          </button>
        </div>
      </div>

      <div className="mc-bottom-hint">
        ✦ Click a model to select · Scroll to zoom · Drag background to orbit
      </div>
    </div>
  );
}

export default App;