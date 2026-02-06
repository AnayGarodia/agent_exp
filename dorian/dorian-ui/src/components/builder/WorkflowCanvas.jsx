import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import "./WorkflowCanvas.css";

// Import your existing Blockly config
import TOOLBOX from "../../config/toolbox";
import "../../config/customBlocks";

// Enhanced dark theme with better colors
const dorianTheme = Blockly.Theme.defineTheme("dorian", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#0A0E27",
    toolboxBackgroundColour: "#0F1629",
    toolboxForegroundColour: "#E5E7EB",
    flyoutBackgroundColour: "#141B2E",
    flyoutForegroundColour: "#E5E7EB",
    flyoutOpacity: 0.95,
    scrollbarColour: "#4B5563",
    scrollbarOpacity: 0.5,
    insertionMarkerColour: "#60A5FA",
    insertionMarkerOpacity: 0.3,
    cursorColour: "#60A5FA",
  },
  blockStyles: {
    logic_blocks: {
      colourPrimary: "#FF6B35",
      colourSecondary: "#FF8A65",
      colourTertiary: "#D84315",
    },
    loop_blocks: {
      colourPrimary: "#4A90E2",
      colourSecondary: "#64B5F6",
      colourTertiary: "#1976D2",
    },
    math_blocks: {
      colourPrimary: "#10B981",
      colourSecondary: "#34D399",
      colourTertiary: "#059669",
    },
  },
  categoryStyles: {
    control_category: {
      colour: "#FF6B35",
    },
    input_category: {
      colour: "#4A90E2",
    },
    gmail_category: {
      colour: "#EA4335",
    },
    ai_category: {
      colour: "#8B5CF6",
    },
    data_category: {
      colour: "#10B981",
    },
    output_category: {
      colour: "#06B6D4",
    },
    utility_category: {
      colour: "#6B7280",
    },
  },
});

const WorkflowCanvas = ({ workspaceRef, isToolboxOpen, onToolboxToggle }) => {
  const blocklyDivRef = useRef(null);
  const workspaceInstanceRef = useRef(null);

  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef?.current) return;

    // Initialize Blockly with improved settings
    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: TOOLBOX,
      theme: dorianTheme,
      grid: {
        spacing: 25,
        length: 3,
        colour: "#1E293B",
        snap: true,
      },
      zoom: {
        controls: false,
        wheel: true,
        startScale: 1.0,
        maxScale: 2.5,
        minScale: 0.3,
        scaleSpeed: 1.1,
      },
      trashcan: false, // We have our own clear button
      sounds: false,
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true,
        },
        drag: true,
        wheel: true,
      },
      renderer: "zelos",
    });

    workspaceInstanceRef.current = workspace;
    if (workspaceRef) {
      workspaceRef.current = workspace;
    }

    // Add initial start block
    const startBlock = workspace.newBlock("agent_start");
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(150, 100);

    // Prevent browser zoom - only zoom canvas
    const preventBrowserZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    blocklyDivRef.current.addEventListener("wheel", preventBrowserZoom, {
      passive: false,
    });

    return () => {
      if (blocklyDivRef.current) {
        blocklyDivRef.current.removeEventListener("wheel", preventBrowserZoom);
      }
      if (workspaceRef?.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [workspaceRef]);

  // Update toolbox visibility when toggled
  useEffect(() => {
    if (workspaceInstanceRef.current) {
      const toolbox = workspaceInstanceRef.current.getToolbox();
      if (toolbox) {
        if (isToolboxOpen) {
          toolbox.setVisible(true);
        } else {
          toolbox.setVisible(false);
        }
        workspaceInstanceRef.current.resize();
      }
    }
  }, [isToolboxOpen]);

  // FIXED: Swapped the zoom values as they were reported to be reversed
  // In Blockly, smaller values zoom OUT, larger values zoom IN (counterintuitive but that's how it works)
  const handleZoomIn = () => {
    workspaceRef?.current?.zoomCenter(1.25); // Zoom IN - make blocks appear larger
  };

  const handleZoomOut = () => {
    workspaceRef?.current?.zoomCenter(0.75); // Zoom OUT - make blocks appear smaller
  };

  const handleZoomReset = () => {
    if (workspaceRef?.current) {
      workspaceRef.current.setScale(1.0);
      workspaceRef.current.scrollCenter();
    }
  };

  const handleClear = () => {
    if (
      workspaceRef?.current &&
      window.confirm("Clear all blocks? This cannot be undone.")
    ) {
      workspaceRef.current.clear();
      const startBlock = workspaceRef.current.newBlock("agent_start");
      startBlock.initSvg();
      startBlock.render();
      startBlock.moveBy(150, 100);
    }
  };

  return (
    <div className="workflow-canvas">
      <div ref={blocklyDivRef} className="workflow-canvas__blockly" />

      {/* Zoom Controls */}
      <div className="workflow-canvas__controls">
        <button onClick={handleZoomIn} title="Zoom in">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomReset} title="Reset zoom">
          <Maximize2 size={18} />
        </button>
        <button onClick={handleZoomOut} title="Zoom out">
          <ZoomOut size={18} />
        </button>
        <div className="workflow-canvas__divider" />
        <button
          onClick={handleClear}
          title="Clear workspace"
          className="workflow-canvas__clear"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
