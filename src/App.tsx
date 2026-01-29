import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import UploadZone from "./components/upload/UploadZone";
import ProcessingIndicator from "./components/upload/ProcessingIndicator";
import ConfigReview from "./components/analysis/ConfigReview";
import ManualSetup from "./components/manual/ManualSetup";
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

  useEffect(() => {
    if (!configuration) return;
    setTubeCount(configuration.tubes.length);
    setTubeInputs(configuration.tubes.map((tube) => tube.colors.join("")));
    setPalette(configuration.colorPalette);
  }, [configuration]);

  useEffect(() => {
    if (solution?.warnings?.length) {
      setToast({ message: solution.warnings[0], tone: "warning" });
    }
  }, [solution]);

  const onFileSelected = async (file: File) => {
    setMode("analysis");
    await analyzeImage(file);
  };

  const onAcceptAnalysis = () => {
    if (!configuration) return;
    setActiveConfig(configuration);
    solve(configuration);
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
        confidence: 0.85,
      },
    };

    setActiveConfig(config);
    solve(config);
    setStepIndex(0);
    setMode("solution");
  };

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

  return (
    <div className="app">
      <Header
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
      />
      <main className="main">
        <div className="container grid grid-2">
          <div className="grid" style={{ gap: 16 }}>
            <UploadZone
              onFileSelected={onFileSelected}
              previewUrl={previewUrl}
            />
            <ProcessingIndicator isProcessing={isProcessing} />
            {mode === "analysis" && configuration && (
              <ConfigReview
                configuration={configuration}
                onAccept={onAcceptAnalysis}
                onAdjust={() => setMode("manual")}
              />
            )}
            {mode !== "solution" && (
              <div className="card">
                <h3 className="section-title">Or Setup Manually</h3>
                <p className="muted">
                  Use letters A-P and ? for unknown segments. Example: A B ? C →
                  AB?C.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <Button onClick={() => setMode("manual")}>
                    Open Manual Setup
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      reset();
                      setActiveConfig(null);
                      setMode("upload");
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className="muted">Preview tubes:</span>
                  <div className="tube-grid" style={{ marginTop: 12 }}>
                    {manualConfigPreview.tubes.slice(0, 6).map((tube) => (
                      <div className="tube-card" key={tube.index}>
                        <div className="muted">Tube {tube.index + 1}</div>
                        <div className="tube-row">
                          {[...tube.colors].reverse().map((color, idx) => (
                            <span
                              key={`${tube.index}-${idx}`}
                              className="color-chip"
                              style={{
                                background: palette[color]?.hex ?? "#111827",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="grid" style={{ gap: 16 }}>
            {mode === "manual" && (
              <ManualSetup
                tubeCount={tubeCount}
                tubeInputs={tubeInputs}
                palette={palette}
                onTubeCountChange={updateTubeCount}
                onTubeInputChange={(index, value) => {
                  setTubeInputs((prev) => {
                    const next = [...prev];
                    next[index] = value;
                    return next;
                  });
                }}
                onPaletteChange={onPaletteChange}
                onSave={onManualSave}
                onCancel={() => setMode("upload")}
              />
            )}
            {mode === "solution" && solution && activeConfig && (
              <SolutionViewer
                solution={solution}
                states={states}
                palette={activeConfig.colorPalette}
                stepIndex={stepIndex}
                onStepChange={setStepIndex}
                guaranteedMoves={guaranteedMoves}
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
      <Footer />
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
