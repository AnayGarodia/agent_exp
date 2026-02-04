import React, { useEffect } from "react";
import * as Blockly from "blockly";
import TOOLBOX from "../../config/toolbox";
import "../../config/customBlocks"; // registers blocks as a side-effect

// ---------------------------------------------------------------------------
// BLOCKLY THEME  (identical to MVP)
// ---------------------------------------------------------------------------
const agentTheme = Blockly.Theme.defineTheme("agent_theme", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#fffbf5",
    toolboxBackgroundColour: "#1a1716",
    toolboxForegroundColour: "#fffbf5",
    flyoutBackgroundColour: "#4a4540",
    flyoutForegroundColour: "#fffbf5",
    flyoutOpacity: 0.95,
    scrollbarColour: "#7c3aed",
    scrollbarOpacity: 0.6,
    insertionMarkerColour: "#7c3aed",
    insertionMarkerOpacity: 0.3,
  },
});

const MainContent = ({ workspaceRef, blocklyDivRef, showOutput, showCode, onWorkspaceInit }) => {
  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef.current) return;

    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: TOOLBOX,
      theme: agentTheme,
      grid: { spacing: 25, length: 3, colour: "#e5e5e5", snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.5,
        scaleSpeed: 1.1,
      },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
    });

    // Call the initialization callback if provided
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

  return (
    <div className="builder-content">
      {/* Blockly canvas */}
      <div
        ref={blocklyDivRef}
        className="blockly-container"
        style={{ width: showOutput || showCode ? "60%" : "100%" }}
      />
    </div>
  );
};

export default MainContent;