import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import ConnectionParticles from "../ConnectionParticles";
import TOOLBOX from "../../config/toolbox";
import "../../config/customBlocks"; // registers blocks as a side-effect

// ---------------------------------------------------------------------------
// BLOCKLY THEME  (minimalist design with clean styling)
// ---------------------------------------------------------------------------
const agentTheme = Blockly.Theme.defineTheme("agent_theme", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#FAFAFA",
    toolboxBackgroundColour: "#FFFFFF",
    toolboxForegroundColour: "#111827",
    flyoutBackgroundColour: "#FFFFFF",
    flyoutForegroundColour: "#111827",
    flyoutBorderColour: "#E5E7EB",
    scrollbarColour: "#D1D5DB",
    scrollbarOpacity: 0.8,
    insertionMarkerColour: "#6366F1",
    insertionMarkerOpacity: 0.4,
    // Connection colors for different types
    startHatColour: "#6366F1",  // Primary accent
    startHatOpacity: 1,
  },
  blockStyles: {
    // Define block styles for different categories/types
    trigger_block: {
      colourPrimary: '#FBBF24',
      colourSecondary: '#FCD34D',
      colourTertiary: '#FEF3C7',
    },
    action_block: {
      colourPrimary: '#60A5FA',
      colourSecondary: '#93C5FD',
      colourTertiary: '#DBEAFE',
    },
    output_block: {
      colourPrimary: '#34D399',
      colourSecondary: '#6EE7B7',
      colourTertiary: '#D1FAE5',
    }
  },
  categoryStyles: {
    trigger_category: {
      colour: '#FBBF24',
    },
    action_category: {
      colour: '#60A5FA',
    },
    output_category: {
      colour: '#34D399',
    }
  }
});

const MainContent = ({ workspaceRef, blocklyDivRef, showOutput, showCode, onWorkspaceInit }) => {
  const zoomControlsRef = useRef(null);
  const [connections, setConnections] = useState([]);

  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef.current) return;

    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: TOOLBOX,
      theme: agentTheme,
      grid: { spacing: 40, length: 3, colour: "rgba(255, 255, 255, 0.1)", snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.1,
      },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
    });

    // Call the initialization callback if provided
    if (onWorkspaceInit) {
      onWorkspaceInit(workspaceRef.current);
    }

    // Simple connection tracking for particle effects
    const updateConnections = () => {
      if (workspaceRef.current) {
        const allBlocks = workspaceRef.current.getAllBlocks(false);
        const newConnections = allBlocks.map(block => ({
          id: block.id,
          type: block.type.includes('trigger') ? 'trigger' :
               block.type.includes('action') ? 'action' : 'output',
          startX: block.getRelativeToSurfaceXY().x + 50,
          startY: block.getRelativeToSurfaceXY().y + 20
        }));
        setConnections(newConnections);
      }
    };

    // Update connections when blocks change
    workspaceRef.current.addChangeListener(() => {
      updateConnections();
    });

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.removeChangeListener(updateConnections);
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [blocklyDivRef, workspaceRef, onWorkspaceInit]);

  // Handle zoom controls
  const handleZoomIn = () => {
    if (workspaceRef.current) {
      workspaceRef.current.zoom(1);
    }
  };

  const handleZoomOut = () => {
    if (workspaceRef.current) {
      workspaceRef.current.zoom(-1);
    }
  };

  const handleZoomReset = () => {
    if (workspaceRef.current) {
      workspaceRef.current.setScale(0.9);
    }
  };

  return (
    <div className="builder-content">
      {/* Canvas grid background */}
      <div className="canvas-grid" />

      {/* Animated connection particles */}
      <ConnectionParticles connections={connections} />

      {/* Blockly canvas */}
      <div
        ref={blocklyDivRef}
        className="blockly-container"
        style={{
          width: showOutput || showCode ? "60%" : "100%",
          zIndex: 20
        }}
      />

      {/* Canvas controls */}
      <div className="canvas-controls">
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
          <button className="zoom-btn" onClick={handleZoomReset}>↺</button>
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
        </div>
        <div className="minimap">
          {/* Minimap would go here */}
        </div>
      </div>
    </div>
  );
};

export default MainContent;