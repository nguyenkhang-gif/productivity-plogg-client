"use client";
import { useEffect, useRef } from "react";

export default function Live2DModel() {
  const canvasRef = useRef(null);
  const modelRef = useRef(null); // Sử dụng useRef để lưu model thay vì state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowRef = window as any;
  useEffect(() => {
    const checkScripts = () => {
      if (typeof windowRef.PIXI !== "undefined" && windowRef.PIXI.live2d) {
        const PIXI = windowRef.PIXI;
        const canvas = document.querySelector("#live2d-canvas"); // Sử dụng querySelector
        const app = new PIXI.Application({
          view: canvas,
          autoStart: true,
          backgroundAlpha: 0,
          resizeTo: window,
        });

        PIXI.live2d.Live2DModel.from(
          "/models/hiyori/runtime/hiyori_free_t08.model3.json"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).then((loadedModel: any) => {
          const scaleX = (windowRef.innerWidth * 1.4) / loadedModel.width;
          const scaleY = (windowRef.innerHeight * 1.4) / loadedModel.height;
          loadedModel.scale.x = scaleX;
          loadedModel.scale.y = scaleY;
          loadedModel.x = windowRef.innerWidth - loadedModel.width + 800;
          loadedModel.y = windowRef.innerHeight - loadedModel.height + 600;

          app.stage.addChild(loadedModel);
          modelRef.current = loadedModel; // Lưu model vào useRef

          setInterval(() => {
            playMotion();
          }, 5000);
        });
      } else {
        setTimeout(checkScripts, 300);
      }
    };
    checkScripts();
  }, []);

  const playMotion = async () => {
    const model = modelRef.current;
    if (!model) return;

    try {
      console.log("Motion triggered");

      // Load motion JSON
      const response = await fetch(
        "/models/hiyori/runtime/motion/hiyori_m04.motion3.json"
      );
      const motionJson = await response.json();

      // Chạy motion (loop = false, priority = NORMAL)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (model as any).motion(
        motionJson,
        false,
        windowRef.PIXI.live2d.MotionPriority.NORMAL
      );

      console.log("Motion played");
    } catch (err) {
      console.error("Error loading motion:", err);
    }
  };

  // const playMotion = async () => {
  //   const model = modelRef.current; // Lấy model từ useRef
  //   if (model) {
  //     try {
  //       console.log("Motion triggered");
  //       const motion = await (
  //         model as any
  //       ).internalModel.motionManager.loadMotion(
  //         "ParamGroupMouth",
  //         0,
  //         "/models/hiyori/runtime/motion/hiyori_m01.motion3.json"
  //       );
  //       if (motion) {
  //         console.log("Motion loaded", motion);
  //         model.motion("motion", 0, window.PIXI.live2d.MotionPriority.NORMAL);
  //       }
  //     } catch (err) {
  //       console.log("Error loading motion:", err);
  //     }
  //   }
  // };

  return (
    <div
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        // background: "blue",
        position: "relative",
      }}
    >
      <canvas id="live2d-canvas" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
