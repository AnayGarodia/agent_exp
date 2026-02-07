import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import "./WorkflowCanvas.css";

// Import your existing Blockly config
import TOOLBOX from "../../config/toolbox";
import "../../config/customBlocks";

// Scratch-inspired theme
const dorianTheme = Blockly.Theme.defineTheme("dorian", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#F9F9F9",
    toolboxBackgroundColour: "#FFFFFF",
    toolboxForegroundColour: "#2E2E2E",
    flyoutBackgroundColour: "#F0F0F0",
    flyoutForegroundColour: "#2E2E2E",
    flyoutOpacity: 0.98,
    scrollbarColour: "#C0C0C0",
    scrollbarOpacity: 0.6,
    insertionMarkerColour: "#4C97FF",
    insertionMarkerOpacity: 0.4,
    cursorColour: "#4C97FF",
  },
  blockStyles: {
    logic_blocks: {
      colourPrimary: "#FFAB19",
      colourSecondary: "#FFC14D",
      colourTertiary: "#CF8B00",
    },
    loop_blocks: {
      colourPrimary: "#FFAB19",
      colourSecondary: "#FFC14D",
      colourTertiary: "#CF8B00",
    },
    math_blocks: {
      colourPrimary: "#59C059",
      colourSecondary: "#79D479",
      colourTertiary: "#389438",
    },
  },
  categoryStyles: {
    control_category: { colour: "#FFAB19" },
    input_category: { colour: "#5CB1D6" },
    gmail_category: { colour: "#FFBF00" },
    ai_category: { colour: "#9966FF" },
    data_category: { colour: "#59C059" },
    output_category: { colour: "#4C97FF" },
    utility_category: { colour: "#FF6680" },
  },
});

const WorkflowCanvas = ({ workspaceRef, isToolboxOpen, onToolboxToggle }) => {
  const blocklyDivRef = useRef(null);
  const workspaceInstanceRef = useRef(null);

  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef?.current) return;

    console.log("[WorkflowCanvas] Initializing Blockly workspace...");

    // Initialize Blockly with improved settings
    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: TOOLBOX,
      theme: dorianTheme,
      grid: {
        spacing: 40,
        length: 2,
        colour: "#E0E0E0",
        snap: true,
      },
      zoom: {
        controls: false, // We use custom controls
        wheel: true,
        startScale: 1.0,
        maxScale: 2.5,
        minScale: 0.3,
        scaleSpeed: 1.1,
      },
      trashcan: false, // We have our own clear button
      sounds: false,
      move: {
        scrollbars: false, // Disable all scrollbars
        drag: true,
        wheel: true,
      },
      renderer: "geras", // More defined, less rounded blocks
    });

    console.log("[WorkflowCanvas] Blockly workspace initialized");

    workspaceInstanceRef.current = workspace;
    if (workspaceRef) {
      workspaceRef.current = workspace;
    }

    // Add initial start block
    const startBlock = workspace.newBlock("agent_start");
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(150, 100);

    console.log("[WorkflowCanvas] Initial start block added");

    // Prevent browser zoom (Ctrl/Cmd+wheel) on the entire page so only Blockly zooms
    const preventBrowserZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", preventBrowserZoom, { passive: false });

    return () => {
      console.log("[WorkflowCanvas] Cleaning up workspace");
      document.removeEventListener("wheel", preventBrowserZoom);
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

  // ZOOM FUNCTIONS - Use Blockly's zoomCenter so only the workspace zooms, not the page
  const handleZoomIn = () => {
    if (workspaceRef?.current && typeof workspaceRef.current.zoomCenter === "function") {
      workspaceRef.current.zoomCenter(1);
      workspaceRef.current.resize();
    }
  };

  const handleZoomOut = () => {
    if (workspaceRef?.current && typeof workspaceRef.current.zoomCenter === "function") {
      workspaceRef.current.zoomCenter(-1);
      workspaceRef.current.resize();
    }
  };

  const handleZoomReset = () => {
    if (workspaceRef?.current) {
      if (typeof workspaceRef.current.zoomCenter === "function") {
        const startScale = workspaceRef.current.options?.zoomOptions?.startScale ?? 1;
        const scaleSpeed = workspaceRef.current.options?.zoomOptions?.scaleSpeed ?? 1.2;
        const amount = Math.log(startScale / workspaceRef.current.scale) / Math.log(scaleSpeed);
        workspaceRef.current.zoomCenter(amount);
      }
      workspaceRef.current.scrollCenter();
    }
  };

  const handleClear = () => {
    if (
      workspaceRef?.current &&
      window.confirm("Clear all blocks? This cannot be undone.")
    ) {
      console.log("[Clear] Clearing workspace");
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

      {/* Zoom Controls - Fixed positioning */}
      <div className="workflow-canvas__controls">
        <button onClick={handleZoomIn} title="Zoom in (make blocks larger)">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomReset} title="Reset zoom to 100%">
          <Maximize2 size={18} />
        </button>
        <button onClick={handleZoomOut} title="Zoom out (make blocks smaller)">
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
