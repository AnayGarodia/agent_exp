import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import TOOLBOX from "../../config/toolbox";
import "../../config/customBlocks";

const cleanTheme = Blockly.Theme.defineTheme("clean", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#F9FAFB",
    toolboxBackgroundColour: "#FFFFFF",
    toolboxForegroundColour: "#111827",
    flyoutBackgroundColour: "#FFFFFF",
    flyoutForegroundColour: "#111827",
    flyoutBorderColour: "#E5E7EB",
    scrollbarColour: "#D1D5DB",
    scrollbarOpacity: 0.5,
    insertionMarkerColour: "#111827",
    insertionMarkerOpacity: 0.3,
  },
});

const MainContent = ({
  workspaceRef,
  blocklyDivRef,
  showOutput,
  showCode,
  onWorkspaceInit,
}) => {
  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef.current) return;

    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: TOOLBOX,
      theme: cleanTheme,
      grid: {
        spacing: 20,
        length: 1,
        colour: "#E5E7EB",
        snap: true,
      },
      zoom: {
        controls: false,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.5,
        scaleSpeed: 1.1,
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
    });

    if (onWorkspaceInit) {
      onWorkspaceInit(workspaceRef.current);
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [blocklyDivRef, workspaceRef, onWorkspaceInit]);

  const handleZoomIn = () => {
    if (workspaceRef.current) {
      workspaceRef.current.zoomCenter(1.2);
    }
  };

  const handleZoomOut = () => {
    if (workspaceRef.current) {
      workspaceRef.current.zoomCenter(0.8);
    }
  };

  const handleZoomReset = () => {
    if (workspaceRef.current) {
      workspaceRef.current.setScale(0.9);
      workspaceRef.current.scrollCenter();
    }
  };

  const handleClear = () => {
    if (workspaceRef.current && window.confirm("Clear workspace?")) {
      workspaceRef.current.clear();
    }
  };

  return (
    <div className="builder-main">
      <div
        ref={blocklyDivRef}
        className="blockly-wrapper"
        style={{
          width: showOutput || showCode ? "calc(100% - 400px)" : "100%",
        }}
      />

      <div className="zoom-controls">
        <button className="zoom-btn" onClick={handleZoomIn} title="Zoom in">
          +
        </button>
        <button className="zoom-btn" onClick={handleZoomReset} title="Reset">
          ⟲
        </button>
        <button className="zoom-btn" onClick={handleZoomOut} title="Zoom out">
          −
        </button>
        <button
          className="zoom-btn zoom-btn-trash"
          onClick={handleClear}
          title="Clear"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default MainContent;
