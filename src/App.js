import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import SVGMorph from "./SVGMorph";
import SVGList from "./SVGList";
import MorphSettingPanel from "./MorphSettingPanel";
import ExportSettingPanel from "./ExportSettingPanel";

const DEMO_SVG_1 = "leaves-4-svgrepo-com.svg";
const DEMO_SVG_2 = "tree-2-svgrepo-com.svg";
function App() {
  const [svgs, setSvgs] = useState([]);
  const [svgMorphingSettings, setSvgMorphingSettings] = useState({
    duration: 1000,
    quality: 10,
    easing: "exp-in-out",
    oneToMany: "duplicate",
    matching: "default",
  });
  const [initialSvgs, setInitialSvgs] = useState([]);
  const [isInitialSvgLoading, setIsInitialSvgLoading] = useState(true);
  const [initialSvgLoadError, setInitialSvgLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSvgs = async () => {
      try {
        const svgUrls = [
          `${process.env.PUBLIC_URL}/${DEMO_SVG_1}`,
          `${process.env.PUBLIC_URL}/${DEMO_SVG_2}`,
        ];
        const responses = await Promise.all(svgUrls.map((url) => fetch(url)));

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to load the default SVGs.");
        }

        const defaultSvgs = await Promise.all(
          responses.map((response) => response.text()),
        );

        if (isMounted) {
          setInitialSvgs(defaultSvgs);
          setSvgs(defaultSvgs);
        }
      } catch (error) {
        console.error("Failed to load default SVGs:", error);
        if (isMounted) {
          setInitialSvgLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsInitialSvgLoading(false);
        }
      }
    };

    loadInitialSvgs();

    return () => {
      isMounted = false;
    };
  }, []);

  const [exportSettings, setExportSettings] = useState({
    framerate: 30,
    resolution: 1024,
    fileFormat: "MP4",
    filename: "morphing",
  });

  const [, setLoadingInfoList] = useState([
    {
      text: "Please upload at least 2 SVGs to start morphing.",
    },
  ]);

  const [, setIsMorphing] = useState(false);

  const handleLoadingStateChange = useCallback(
    (isStartingNewMorph, isMorphing, loadingInfo) => {
      setIsMorphing(isMorphing);

      setLoadingInfoList((prevLoadingInfo) => {
        // if loadingInfo.text is empty, do not add to loadingInfoList
        let newLoadingInfo = [...prevLoadingInfo];
        if (loadingInfo.text !== "") {
          newLoadingInfo.push(loadingInfo);
        }

        if (isStartingNewMorph) {
          return [
            {
              text: "Please upload at least 2 SVGs to start morphing.",
            },
          ];
        } else {
          return newLoadingInfo.slice(-10); //only keep top 10 latest message
        }
      });
    },
    [],
  );

  if (isInitialSvgLoading || initialSvgLoadError) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="initial-svg-loading" role="status">
            {initialSvgLoadError ? (
              <p>Unable to load the demo SVGs. Please refresh the page.</p>
            ) : (
              <>
                <div className="initial-svg-loading-spinner" />
                <p>Loading Demo SVGs...</p>
              </>
            )}
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
            position: "relative",
            height: "100%",
          }}
        >
          <div
            style={{
              height: "30%",
              width: "100%",
              padding: "10px",
            }}
          >
            <SVGList initialSvgs={initialSvgs} onSvgsChange={setSvgs} />
          </div>
          <div
            id="morphing-preview"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              aspectRatio: "1/1",
              width: "auto",
              height: "30%",
              minWidth: "100px",
              padding: "10px",
            }}
          >
            <SVGMorph
              svgs={svgs}
              morphSetting={svgMorphingSettings}
              exportSetting={exportSettings}
              onLoadingStateChange={handleLoadingStateChange}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "70%",
              height: "30%",
              padding: "10px",
            }}
          >
            <MorphSettingPanel onSettingChange={setSvgMorphingSettings} />
            <ExportSettingPanel onExportSettingChange={setExportSettings} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
