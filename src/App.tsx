import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header";
import HelpOverlay from "./components/layout/HelpOverlay";
import UploadZone from "./components/upload/UploadZone";
import PlaybackControls from "./components/shared/PlaybackControls";
import ConfigReview from "./components/analysis/ConfigReview";
import SolutionViewer from "./components/solver/SolutionViewer";
import Toast from "./components/shared/Toast";
import Button from "./components/shared/Button";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { usePuzzleSolver } from "./hooks/usePuzzleSolver";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { PuzzleConfiguration, ColorPalette } from "./types/puzzle";
import { buildPaletteFromTubes, DEFAULT_COLOR_MAP } from "./lib/utils/colors";
import { normalizeTubeInput } from "./lib/utils/validation";

const DEFAULT_TUBE_COUNT = 8;

export default function App() {
  const [theme, setTheme] = useLocalStorage("water-sort-theme", "light");
  const isDark = theme === "dark";

  const { isProcessing, previewUrl, configuration, analyzeImage, reset } =
    useImageAnalysis();
  const { solution, states, guaranteedMoves, solve } = usePuzzleSolver();

  const [mode, setMode] = useState<
    "upload" | "analysis" | "manual" | "solution"
  >("upload");
  const [stepIndex, setStepIndex] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    tone?: "success" | "warning" | "danger";
  } | null>(null);
  const [activeConfig, setActiveConfig] = useState<PuzzleConfiguration | null>(
    null,
  );
  const [localConfiguration, setLocalConfiguration] = useState<PuzzleConfiguration | null>(null);

  const [tubeCount, setTubeCount] = useState(DEFAULT_TUBE_COUNT);
  const [tubeInputs, setTubeInputs] = useState<string[]>(
    Array.from({ length: DEFAULT_TUBE_COUNT }, () => ""),
  );
  const [palette, setPalette] = useState<ColorPalette>(() => {
    const entries: ColorPalette = {};
    Object.entries(DEFAULT_COLOR_MAP).forEach(([letter, value]) => {
      entries[letter] = { ...value, frequency: 0 };
    });
    return entries;
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Update local configuration when analysis completes
  useEffect(() => {
    if (configuration) {
      setLocalConfiguration(configuration);
      setTubeCount(configuration.tubes.length);
      setTubeInputs(configuration.tubes.map((tube) => tube.colors.join("")));
    }
  }, [configuration]);

  const handleConfigurationChange = (newConfig: PuzzleConfiguration) => {
    setLocalConfiguration(newConfig);
  };

  const onFileSelected = async (file: File) => {
    setMode("analysis");
    await analyzeImage(file);
  };

  const onAcceptAnalysis = () => {
    if (!localConfiguration) return;
    setActiveConfig(localConfiguration);
    solve(localConfiguration);
    setStepIndex(0);
    setMode("solution");
  };

  const onManualSave = () => {
    const tubes = tubeInputs.map((input, index) => ({
      index,
      colors: normalizeTubeInput(input),
    }));

    const tubesForPalette = tubes.map((tube) => tube.colors);
    const updatedPalette = buildPaletteFromTubes(tubesForPalette);

    Object.entries(palette).forEach(([letter, entry]) => {
      if (updatedPalette[letter]) {
        updatedPalette[letter].hex = entry.hex;
      }
    });

    const config: PuzzleConfiguration = {
      version: "1.2.0",
      timestamp: new Date().toISOString(),
      tubes,
      colorPalette: updatedPalette,
      hasUnknowns: tubes.some((tube) => tube.colors.includes("?")),
      metadata: {
        source: "manual",
      },
    };

    setActiveConfig(config);
    solve(config);
    setStepIndex(0);
    setMode("solution");
  };

  useEffect(() => {
    const currentConfig = localConfiguration || activeConfig;
    if (currentConfig) {
      setPalette(currentConfig.colorPalette);
    }
  }, [localConfiguration, activeConfig]);

  useEffect(() => {
    if (solution?.warnings?.length) {
      setToast({ message: solution.warnings[0], tone: "warning" });
    }
  }, [solution]);

  const currentDisplayConfig = localConfiguration || configuration;

  const updateTubeCount = (count: number) => {
    const nextCount = Math.max(3, Math.min(18, count));
    setTubeCount(nextCount);
    setTubeInputs((prev) => {
      const next = [...prev];
      if (next.length < nextCount) {
        return next.concat(
          Array.from({ length: nextCount - next.length }, () => ""),
        );
      }
      return next.slice(0, nextCount);
    });
  };

  const onPaletteChange = (letter: string, hex: string) => {
    setPalette((prev) => ({
      ...prev,
      [letter]: {
        ...(prev[letter] ?? { name: `Color ${letter}`, frequency: 0 }),
        hex,
      },
    }));
  };

  const manualConfigPreview = useMemo(() => {
    return {
      tubes: tubeInputs.map((input, index) => ({
        index,
        colors: normalizeTubeInput(input),
      })),
    };
  }, [tubeInputs]);

  // Calculate detection info for VCR display
  const detectionInfo = useMemo(() => {
    if (!currentDisplayConfig?.metadata?.detection) return undefined;
    const { detection } = currentDisplayConfig.metadata;
    
    return {
      tubes: detection.tubes.length,
      segments: detection.tubes.reduce((sum, tube) => sum + tube.segments.length, 0),
      colors: Object.keys(currentDisplayConfig.colorPalette).length,
      confidence: detection.confidence ? Math.round(detection.confidence * 100) : 0
    };
  }, [currentDisplayConfig]);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Re-upload handler
  const handleReupload = () => {
    reset();
    setActiveConfig(null);
    setMode("upload");
  };

  return (
    <div className="app">
      <Header
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
        isHelpOpen={isHelpOpen}
        onToggleHelp={() => setIsHelpOpen(!isHelpOpen)}
      />
      
      <HelpOverlay 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)}
      />

      <main className="main">
        <div className="container grid grid-2">
          <div className="grid" style={{ gap: 16 }}>
            {(mode === "upload" || mode === "analysis") && (
              <>
                <UploadZone
                  onFileSelected={onFileSelected}
                  previewUrl={previewUrl}
                  detectionData={currentDisplayConfig?.metadata?.detection || null}
                  palette={currentDisplayConfig?.colorPalette}
                  onConfigurationChange={handleConfigurationChange}
                  isProcessing={isProcessing}
                  onPlay={onAcceptAnalysis}
                />
              </>
            )}
            {mode === "solution" && solution && activeConfig && (
              <SolutionViewer
                solution={solution}
                states={states}
                palette={activeConfig.colorPalette}
                stepIndex={stepIndex}
                onStepChange={setStepIndex}
                guaranteedMoves={guaranteedMoves}
                // Pass detection data for Reality View
                detectionData={activeConfig.metadata?.detection}
                imageUrl={activeConfig.metadata?.originalImage}
                onReset={() => {
                  setMode("upload");
                  reset();
                  setActiveConfig(null);
                }}
              />
            )}
            {mode === "solution" && solution && !activeConfig && (
              <div className="card">
                <h2 className="section-title">Solution Ready</h2>
                <p className="muted">
                  Use manual setup to create a configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* VCR Controls as Footer */}
      {/* Footer / VCR Controls */}
      <footer className="footer-area">
        {(mode === 'analysis' && previewUrl) || mode === 'solution' ? (
          <PlaybackControls
            mode={mode === 'solution' ? 'solution' : 'analysis'}
            detectionInfo={detectionInfo}
            onPlay={onAcceptAnalysis}
            onUpload={handleReupload}
            
            // Solution props
            currentStep={stepIndex}
            totalSteps={solution?.steps.length || 0}
            onNext={() => setStepIndex(prev => Math.min((solution?.steps.length || 1) - 1, prev + 1))}
            onPrev={() => setStepIndex(prev => Math.max(0, prev - 1))}
            onFirst={() => setStepIndex(0)}
            onLast={() => setStepIndex((solution?.steps.length || 1) - 1)}
            onPause={() => {
              setMode("upload");
              reset();
              setActiveConfig(null);
            }}
          />
        ) : null}
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
